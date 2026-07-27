package com.example.restaurant.service;

import com.example.restaurant.dto.ChefDashboardDTO;
import com.example.restaurant.dto.OrderHistoryDTO;
import com.example.restaurant.dto.OrderRecipeCheckDTO;
import com.example.restaurant.entity.*;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class ChefKitchenServiceImpl implements ChefKitchenService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private DishRecipeRepository dishRecipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Autowired
    private StaffNotificationRepository staffNotificationRepository;

    @Override
    @Transactional(readOnly = true)
    public ChefDashboardDTO getChefDashboardStats() {
        List<Order> allOrders = orderRepository.findAll();

        long pending = allOrders.stream()
                .filter(o -> "PENDING".equalsIgnoreCase(o.getStatus()) || "CONFIRMED".equalsIgnoreCase(o.getStatus()) || "PAID".equalsIgnoreCase(o.getStatus()))
                .count();

        long cooking = allOrders.stream()
                .filter(o -> "PREPARING".equalsIgnoreCase(o.getStatus()) || "COOKING".equalsIgnoreCase(o.getStatus()))
                .count();

        long completed = allOrders.stream()
                .filter(o -> "READY".equalsIgnoreCase(o.getStatus()) || "SERVED".equalsIgnoreCase(o.getStatus()) || "PAID".equalsIgnoreCase(o.getStatus()) || "COMPLETED".equalsIgnoreCase(o.getStatus()))
                .count();

        List<OrderItem> pendingItems = orderItemRepository.findAll().stream()
                .filter(i -> i.getOrder() != null && !"CANCELLED".equalsIgnoreCase(i.getOrder().getStatus()) && !"COMPLETED".equalsIgnoreCase(i.getOrder().getStatus()))
                .filter(i -> !"READY".equalsIgnoreCase(i.getCookingStatus()) && !"COMPLETED".equalsIgnoreCase(i.getCookingStatus()))
                .collect(Collectors.toList());

        Map<Dish, Long> dishCountMap = new HashMap<>();
        for (OrderItem item : pendingItems) {
            if (item.getDish() != null) {
                dishCountMap.put(item.getDish(), dishCountMap.getOrDefault(item.getDish(), 0L) + item.getQuantity());
            }
        }

        List<ChefDashboardDTO.TopQueueDishDTO> topDishes = dishCountMap.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(5)
                .map(e -> ChefDashboardDTO.TopQueueDishDTO.builder()
                        .dishId(e.getKey().getId())
                        .dishName(e.getKey().getName())
                        .image(e.getKey().getImage())
                        .pendingQuantity(e.getValue())
                        .build())
                .collect(Collectors.toList());

        return ChefDashboardDTO.builder()
                .pendingOrdersCount(pending)
                .cookingOrdersCount(cooking)
                .completedOrdersCount(completed)
                .avgCookingTimeMinutes(12.5)
                .topQueueDishes(topDishes)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderHistoryDTO> getKitchenOrders(String cookingStatus, Long categoryId, String search) {
        List<Order> orders = orderRepository.findAll();

        return orders.stream()
                .filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()))
                .filter(o -> !"COMPLETED".equalsIgnoreCase(o.getStatus()))
                .filter(o -> !"SERVED".equalsIgnoreCase(o.getStatus()))
                .filter(o -> !"PAID".equalsIgnoreCase(o.getStatus())) // Phương án B: Bếp nhận đơn KITCHEN_CONFIRMED ngay
                .filter(o -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String q = search.trim().toLowerCase();
                    String codeStr = o.getId() != null ? String.valueOf(o.getId()) : "";
                    String tName = o.getDiningTable() != null ? o.getDiningTable().getTableName().toLowerCase() : "mang về";
                    String cName = o.getCustomer() != null && o.getCustomer().getFullName() != null ? o.getCustomer().getFullName().toLowerCase() : "";
                    return codeStr.contains(q) || tName.contains(q) || cName.contains(q);
                })
                .map(o -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(o.getId());
                    if (cookingStatus != null && !cookingStatus.isEmpty() && !"ALL".equalsIgnoreCase(cookingStatus)) {
                        items = items.stream()
                                .filter(i -> cookingStatus.equalsIgnoreCase(i.getCookingStatus()))
                                .collect(Collectors.toList());
                    }
                    if (categoryId != null && categoryId > 0) {
                        items = items.stream()
                                .filter(i -> i.getDish() != null && i.getDish().getCategory() != null && categoryId.equals(i.getDish().getCategory().getId()))
                                .collect(Collectors.toList());
                    }
                    return mapToDTO(o, items);
                })
                .filter(dto -> dto.getItems() != null && !dto.getItems().isEmpty())
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate())) // NEWEST ORDERS FIRST
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderHistoryDTO> getCompletedOrders() {
        List<Order> orders = orderRepository.findAll();

        return orders.stream()
                .filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus()) || "SERVED".equalsIgnoreCase(o.getStatus()))
                .map(o -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(o.getId());
                    return mapToDTO(o, items);
                })
                .filter(dto -> dto.getItems() != null && !dto.getItems().isEmpty())
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate())) // Newest completed first
                .collect(Collectors.toList());
    }

    @Override
    public OrderHistoryDTO updateItemCookingStatus(Long orderItemId, String cookingStatus) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ApiException("Không tìm thấy món ăn trong đơn #" + orderItemId, HttpStatus.NOT_FOUND));

        String currentStatus = item.getCookingStatus();
        validateSequentialStatusTransition(currentStatus, cookingStatus);

        item.setCookingStatus(cookingStatus);
        orderItemRepository.save(item);

        Order order = item.getOrder();
        List<OrderItem> allItems = orderItemRepository.findByOrderId(order.getId());

        boolean allReady = allItems.stream().allMatch(i -> "READY".equalsIgnoreCase(i.getCookingStatus()) || "COMPLETED".equalsIgnoreCase(i.getCookingStatus()));
        boolean allCompleted = allItems.stream().allMatch(i -> "COMPLETED".equalsIgnoreCase(i.getCookingStatus()));

        if (allCompleted) {
            order.setStatus("COMPLETED");
            orderRepository.save(order);
        } else if (allReady) {
            order.setStatus("READY_FOR_PICKUP");
            orderRepository.save(order);

            // Notify Cashier & Waiter that order is ready for pickup
            try {
                String tName = order.getDiningTable() != null ? order.getDiningTable().getTableName() : "Mang về";
                staffNotificationRepository.save(StaffNotification.builder()
                        .senderName("Bếp Trưởng (Kitchen KDS)")
                        .senderRole("ROLE_CHEF")
                        .targetRole("ROLE_CASHIER")
                        .title("🔔 ĐƠN HÀNG SẴN SÀNG GIAO - BÀN " + tName)
                        .message("Tất cả các món trong đơn #" + order.getId() + " (" + tName + ") đã hoàn thành chế biến (READY). Thu ngân/Phục vụ vui lòng giao món cho khách!")
                        .urgent(true)
                        .isRead(false)
                        .isConfirmed(false)
                        .createdAt(LocalDateTime.now())
                        .build());
            } catch (Exception e) {
                log.warn("Lỗi gửi thông báo cho Thu ngân: ", e);
            }
        } else if ("READY".equalsIgnoreCase(cookingStatus)) {
            // Notify Cashier for individual dish READY
            try {
                String tName = order.getDiningTable() != null ? order.getDiningTable().getTableName() : "Mang về";
                String dName = item.getDish() != null ? item.getDish().getName() : "Món ăn";
                staffNotificationRepository.save(StaffNotification.builder()
                        .senderName("Bếp Trưởng (Kitchen KDS)")
                        .senderRole("ROLE_CHEF")
                        .targetRole("ROLE_CASHIER")
                        .title("🔔 MÓ N ĐÃ SẴN SÀNG: " + dName + " (Bàn " + tName + ")")
                        .message("Món " + dName + " x" + item.getQuantity() + " trong đơn #" + order.getId() + " (" + tName + ") đã hoàn thành chế biến.")
                        .urgent(false)
                        .isRead(false)
                        .isConfirmed(false)
                        .createdAt(LocalDateTime.now())
                        .build());
            } catch (Exception e) {
                log.warn("Lỗi gửi thông báo món ready cho Thu ngân: ", e);
            }
        } else if ("COOKING".equalsIgnoreCase(cookingStatus)) {
            order.setStatus("COOKING");
            orderRepository.save(order);
        } else if ("PREPARING".equalsIgnoreCase(cookingStatus)) {
            order.setStatus("PREPARING");
            orderRepository.save(order);
        }

        return mapToDTO(order, allItems);
    }

    @Override
    public OrderHistoryDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng #" + orderId, HttpStatus.NOT_FOUND));

        validateSequentialStatusTransition(order.getStatus(), status);

        order.setStatus(status);
        orderRepository.save(order);

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem i : items) {
            i.setCookingStatus(status);
            orderItemRepository.save(i);
        }

        if ("READY".equalsIgnoreCase(status)) {
            staffNotificationRepository.save(StaffNotification.builder()
                    .senderName("Bếp Trưởng (Kitchen KDS)")
                    .senderRole("ROLE_CHEF")
                    .targetRole("ROLE_WAITER")
                    .title("🔔 ĐƠN HÀNG SẴN SÀNG - BÀN " + (order.getDiningTable() != null ? order.getDiningTable().getTableName() : "MANG VỀ"))
                    .message("Đơn món #" + order.getId() + " đã chuyển sang SẴN SÀNG. Vui lòng nhận món phục vụ khách!")
                    .urgent(true)
                    .isRead(false)
                    .isConfirmed(false)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        return mapToDTO(order, items);
    }

    private void validateSequentialStatusTransition(String currentStatus, String targetStatus) {
        String curr = currentStatus != null ? currentStatus.toUpperCase() : "PENDING";
        String tgt = targetStatus != null ? targetStatus.toUpperCase() : "PENDING";

        if (curr.equalsIgnoreCase(tgt)) return;

        // Map allowed next steps
        Map<String, String> allowedTransitions = new HashMap<>();
        allowedTransitions.put("PENDING", "PREPARING");
        allowedTransitions.put("CONFIRMED", "PREPARING");
        allowedTransitions.put("PAID", "PREPARING");
        allowedTransitions.put("PREPARING", "COOKING");
        allowedTransitions.put("COOKING", "READY");
        allowedTransitions.put("READY", "COMPLETED");

        String allowedNext = allowedTransitions.get(curr);
        if (allowedNext == null || !allowedNext.equalsIgnoreCase(tgt)) {
            throw new ApiException(
                    "❌ QUY TẮC BẾP NGHIÊM NGẶT: Không được bỏ qua bước! Trạng thái [" + curr + "] chỉ được phép chuyển tiếp sang [" + (allowedNext != null ? allowedNext : "BƯỚC KẾ TIẾP") + "]. (Luồng chuẩn: PENDING ➔ PREPARING ➔ COOKING ➔ READY ➔ COMPLETED)",
                    HttpStatus.BAD_REQUEST
            );
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderRecipeCheckDTO> checkOrderRecipes(Long orderId) {
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        Map<Long, OrderRecipeCheckDTO> map = new HashMap<>();

        for (OrderItem item : items) {
            if (item.getDish() == null) continue;
            List<DishRecipe> recipes = dishRecipeRepository.findByDishId(item.getDish().getId());
            for (DishRecipe r : recipes) {
                Ingredient ing = r.getIngredient();
                if (ing == null) continue;

                double needed = r.getQuantityRequired() * item.getQuantity();
                if (map.containsKey(ing.getId())) {
                    OrderRecipeCheckDTO existing = map.get(ing.getId());
                    existing.setQuantityRequired(existing.getQuantityRequired() + needed);
                    existing.setIsSufficient(existing.getCurrentStockQuantity() >= existing.getQuantityRequired());
                } else {
                    double currStock = ing.getStockQuantity() != null ? ing.getStockQuantity() : 0.0;
                    map.put(ing.getId(), OrderRecipeCheckDTO.builder()
                            .ingredientId(ing.getId())
                            .ingredientName(ing.getName())
                            .ingredientCode(ing.getCode())
                            .quantityRequired(needed)
                            .currentStockQuantity(currStock)
                            .unit(r.getUnit() != null ? r.getUnit() : ing.getUnit())
                            .isSufficient(currStock >= needed)
                            .storageLocation(ing.getStorageLocation())
                            .build());
                }
            }
        }

        return new ArrayList<>(map.values());
    }

    @Override
    public OrderHistoryDTO deductIngredientsAndStartCooking(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng #" + orderId, HttpStatus.NOT_FOUND));

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);

        for (OrderItem item : items) {
            if (item.getDish() == null) continue;
            List<DishRecipe> recipes = dishRecipeRepository.findByDishId(item.getDish().getId());
            for (DishRecipe recipe : recipes) {
                Ingredient ing = recipe.getIngredient();
                if (ing == null) continue;

                double qtyToDeduct = recipe.getQuantityRequired() * item.getQuantity();
                double newStock = Math.max(0.0, (ing.getStockQuantity() != null ? ing.getStockQuantity() : 0.0) - qtyToDeduct);
                ing.setStockQuantity(newStock);
                ingredientRepository.save(ing);

                inventoryTransactionRepository.save(InventoryTransaction.builder()
                        .ticketCode("CHEF-COOKING-#ORD-" + order.getId())
                        .ingredient(ing)
                        .type("STOCK_OUT")
                        .quantity(qtyToDeduct)
                        .performedBy("Bếp Trưởng (Chế biến đơn #ORD-" + order.getId() + ")")
                        .transactionDate(LocalDateTime.now())
                        .note("Trừ kho tự động khi Bếp bắt đầu nấu đơn #" + order.getId() + " (" + item.getQuantity() + "x " + item.getDish().getName() + ")")
                        .build());
            }

            item.setCookingStatus("PREPARING");
            orderItemRepository.save(item);
        }

        order.setStatus("PREPARING");
        orderRepository.save(order);

        return mapToDTO(order, items);
    }

    @Override
    public OrderHistoryDTO notifyWaiter(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng #" + orderId, HttpStatus.NOT_FOUND));
        order.setStatus("READY");
        orderRepository.save(order);

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem i : items) {
            i.setCookingStatus("READY");
            orderItemRepository.save(i);
        }
        return mapToDTO(order, items);
    }

    private OrderHistoryDTO mapToDTO(Order order, List<OrderItem> items) {
        List<OrderHistoryDTO.OrderItemDetail> itemDetails = items.stream()
                .map(i -> {
                    Dish d = i.getDish();
                    List<OrderRecipeCheckDTO> recipesList = new ArrayList<>();
                    if (d != null) {
                        List<DishRecipe> drs = dishRecipeRepository.findByDishId(d.getId());
                        recipesList = drs.stream().map(dr -> OrderRecipeCheckDTO.builder()
                                .ingredientId(dr.getIngredient() != null ? dr.getIngredient().getId() : null)
                                .ingredientName(dr.getIngredient() != null ? dr.getIngredient().getName() : "Nguyên liệu")
                                .quantityRequired(dr.getQuantityRequired() * i.getQuantity())
                                .unit(dr.getUnit() != null ? dr.getUnit() : "kg")
                                .currentStockQuantity(dr.getIngredient() != null ? dr.getIngredient().getStockQuantity() : 0.0)
                                .isSufficient(dr.getIngredient() != null && dr.getIngredient().getStockQuantity() >= (dr.getQuantityRequired() * i.getQuantity()))
                                .build()
                        ).collect(Collectors.toList());
                    }

                    return OrderHistoryDTO.OrderItemDetail.builder()
                            .itemId(i.getId())
                            .dishId(d != null ? d.getId() : null)
                            .dishName(d != null ? d.getName() : "Món ăn")
                            .categoryName(d != null && d.getCategory() != null ? d.getCategory().getName() : "Món chính")
                            .image(d != null ? d.getImage() : null)
                            .quantity(i.getQuantity())
                            .price(i.getPrice())
                            .note(i.getNote())
                            .cookingStatus(i.getCookingStatus() != null ? i.getCookingStatus() : "PENDING")
                            .prepTime(d != null && d.getPrepTime() != null ? d.getPrepTime() : 15)
                            .description(d != null ? d.getDescription() : "")
                            .ingredients(d != null ? d.getIngredients() : "")
                            .spiciness(d != null ? d.getSpiciness() : "Không cay")
                            .calories(d != null && d.getCalories() != null ? d.getCalories() : 450)
                            .lineTotal(i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                            .recipes(recipesList)
                            .build();
                })
                .collect(Collectors.toList());

        String cName = order.getCustomer() != null ? order.getCustomer().getFullName() : "Khách tại bàn";
        String cPhone = order.getCustomer() != null ? order.getCustomer().getPhone() : "Chưa cập nhật";
        String tName = order.getDiningTable() != null ? order.getDiningTable().getTableName() : "Mang về";

        // Check if order is NEW (placed within last 10 minutes)
        boolean isNewOrder = order.getOrderDate() != null && order.getOrderDate().isAfter(LocalDateTime.now().minusMinutes(10));

        return OrderHistoryDTO.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .customerName(cName)
                .customerPhone(cPhone)
                .tableName(tName)
                .orderType(order.getDiningTable() != null ? "Ăn tại quán" : "Mang về")
                .priority(isNewOrder ? "Ưu tiên cao" : "Bình thường")
                .isNew(isNewOrder && !"COMPLETED".equalsIgnoreCase(order.getStatus()))
                .items(itemDetails)
                .build();
    }
}
