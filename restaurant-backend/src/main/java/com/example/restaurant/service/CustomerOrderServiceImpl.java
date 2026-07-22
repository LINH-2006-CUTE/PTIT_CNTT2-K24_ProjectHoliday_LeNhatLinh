package com.example.restaurant.service;

import com.example.restaurant.dto.CustomerOrderRequest;
import com.example.restaurant.dto.InvoiceDTO;
import com.example.restaurant.dto.OrderHistoryDTO;
import com.example.restaurant.entity.*;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerOrderServiceImpl implements CustomerOrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private DiningTableRepository diningTableRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private DishRecipeRepository dishRecipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Override
    public OrderHistoryDTO createOrder(CustomerOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ApiException("Danh sách món ăn không được để trống", HttpStatus.BAD_REQUEST);
        }

        User user = null;
        if (request.getCustomerEmail() != null && !request.getCustomerEmail().isEmpty()) {
            user = userRepository.findByEmail(request.getCustomerEmail()).orElse(null);
        }

        DiningTable table = null;
        if (request.getDiningTableId() != null) {
            table = diningTableRepository.findById(request.getDiningTableId()).orElse(null);
            if (table != null) {
                table.setStatus("OCCUPIED");
                diningTableRepository.save(table);
            }
        }

        Order order = Order.builder()
                .customer(user)
                .diningTable(table)
                .orderDate(LocalDateTime.now())
                .status("PENDING")
                .totalAmount(BigDecimal.ZERO)
                .build();

        order = orderRepository.save(order);

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CustomerOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Dish dish = dishRepository.findById(itemReq.getDishId())
                    .orElseThrow(() -> new ApiException("Không tìm thấy món ăn #" + itemReq.getDishId(), HttpStatus.NOT_FOUND));

            int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
            BigDecimal itemTotal = dish.getPrice().multiply(BigDecimal.valueOf(qty));
            subtotal = subtotal.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .dish(dish)
                    .quantity(qty)
                    .price(dish.getPrice())
                    .cookingStatus("PENDING")
                    .note(itemReq.getNote())
                    .build();

            orderItems.add(orderItemRepository.save(orderItem));

            // Auto deduct inventory stock based on recipe
            List<DishRecipe> recipes = dishRecipeRepository.findByDishId(dish.getId());
            for (DishRecipe recipe : recipes) {
                Ingredient ing = recipe.getIngredient();
                double qtyToDeduct = recipe.getQuantityRequired() * qty;
                double newStock = Math.max(0.0, ing.getStockQuantity() - qtyToDeduct);
                ing.setStockQuantity(newStock);
                ingredientRepository.save(ing);

                inventoryTransactionRepository.save(InventoryTransaction.builder()
                        .ticketCode("AUTO-ORDER-" + order.getId())
                        .ingredient(ing)
                        .type("STOCK_OUT")
                        .quantity(qtyToDeduct)
                        .performedBy("Hệ thống (Bán " + dish.getName() + ")")
                        .transactionDate(LocalDateTime.now())
                        .note("Tự động trừ kho khi tạo đơn bán " + qty + " x " + dish.getName())
                        .build());
            }
        }

        order.setTotalAmount(subtotal);
        orderRepository.save(order);

        return mapToDTO(order, orderItems);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderHistoryDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng #" + id, HttpStatus.NOT_FOUND));
        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        return mapToDTO(order, items);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderHistoryDTO> getCustomerOrders(String phoneOrEmail, String status, String search) {
        List<Order> orders = orderRepository.findAll();

        return orders.stream()
                .filter(o -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(o.getId());
                    return items != null && !items.isEmpty();
                })
                .filter(o -> {
                    if (status == null || status.isEmpty() || "ALL".equalsIgnoreCase(status)) return true;
                    String ordStatus = o.getStatus() != null ? o.getStatus().toUpperCase() : "";
                    String st = status.trim().toUpperCase();

                    if ("CONFIRMED".equals(st)) return "CONFIRMED".equals(ordStatus) || "IN_SERVICE".equals(ordStatus);
                    if ("COOKING".equals(st)) return "COOKING".equals(ordStatus) || "IN_SERVICE".equals(ordStatus);
                    if ("READY".equals(st)) return "READY".equals(ordStatus) || "SERVING".equals(ordStatus);
                    if ("PAID".equals(st)) return "PAID".equals(ordStatus) || "COMPLETED".equals(ordStatus);
                    return ordStatus.equals(st);
                })
                .filter(o -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String q = search.trim().toLowerCase().replaceAll("^#", "");
                    String ordIdStr = "ord-" + o.getId();
                    String idStr = String.valueOf(o.getId());
                    return ordIdStr.contains(q) || idStr.contains(q);
                })
                .map(o -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(o.getId());
                    return mapToDTO(o, items);
                })
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
                .limit(6)
                .collect(Collectors.toList());
    }

    @Override
    public OrderHistoryDTO cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng #" + id, HttpStatus.NOT_FOUND));

        if (!"PENDING".equalsIgnoreCase(order.getStatus())) {
            throw new ApiException("Chỉ được phép hủy đơn hàng khi trạng thái là 'Chờ xác nhận' (PENDING)", HttpStatus.BAD_REQUEST);
        }

        order.setStatus("CANCELLED");
        orderRepository.save(order);

        List<OrderItem> items = orderItemRepository.findByOrderId(id);
        return mapToDTO(order, items);
    }

    private OrderHistoryDTO mapToDTO(Order order, List<OrderItem> items) {
        List<OrderHistoryDTO.OrderItemDetail> itemDetails = items.stream()
                .map(i -> {
                    BigDecimal lineTot = i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity()));
                    return OrderHistoryDTO.OrderItemDetail.builder()
                            .dishId(i.getDish() != null ? i.getDish().getId() : null)
                            .dishName(i.getDish() != null ? i.getDish().getName() : "Món ăn")
                            .image(i.getDish() != null ? i.getDish().getImage() : null)
                            .quantity(i.getQuantity())
                            .price(i.getPrice())
                            .note(i.getNote())
                            .lineTotal(lineTot)
                            .build();
                })
                .collect(Collectors.toList());

        InvoiceDTO invoiceDTO = null;
        Optional<Invoice> invOpt = invoiceRepository.findByOrderId(order.getId());
        if (invOpt.isPresent()) {
            Invoice inv = invOpt.get();
            invoiceDTO = InvoiceDTO.builder()
                    .id(inv.getId())
                    .invoiceNumber(inv.getInvoiceNumber())
                    .orderId(order.getId())
                    .customerName(inv.getCustomerName())
                    .customerPhone(inv.getCustomerPhone())
                    .subtotal(inv.getSubtotal())
                    .discountAmount(inv.getDiscountAmount())
                    .serviceFee(inv.getServiceFee())
                    .vatAmount(inv.getVatAmount())
                    .grandTotal(inv.getGrandTotal())
                    .paymentMethod(inv.getPaymentMethod())
                    .issuedAt(inv.getIssuedAt())
                    .build();
        }

        String cName = order.getCustomer() != null ? order.getCustomer().getFullName() : "Khách hàng";
        String cPhone = order.getCustomer() != null ? order.getCustomer().getPhone() : "";
        String tName = order.getDiningTable() != null ? order.getDiningTable().getTableName() : "Mang về";

        return OrderHistoryDTO.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .customerName(cName)
                .customerPhone(cPhone)
                .tableName(tName)
                .items(itemDetails)
                .invoice(invoiceDTO)
                .build();
    }
}
