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
public class WaiterOrderServiceImpl implements WaiterOrderService {

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

    @Override
    @Transactional(readOnly = true)
    public List<OrderHistoryDTO> getActiveOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .filter(o -> !"COMPLETED".equalsIgnoreCase(o.getStatus()) && !"PAID".equalsIgnoreCase(o.getStatus()) && !"CANCELLED".equalsIgnoreCase(o.getStatus()))
                .map(o -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(o.getId());
                    return mapToDTO(o, items);
                })
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
                .collect(Collectors.toList());
    }

    @Override
    public OrderHistoryDTO createWaiterOrder(CustomerOrderRequest request) {
        if (request.getDiningTableId() == null) {
            throw new ApiException("Vui lòng chọn bàn cho đơn hàng", HttpStatus.BAD_REQUEST);
        }

        DiningTable table = diningTableRepository.findById(request.getDiningTableId())
                .orElseThrow(() -> new ApiException("Không tìm thấy bàn #" + request.getDiningTableId(), HttpStatus.NOT_FOUND));

        User customer = null;
        if (request.getCustomerEmail() != null && !request.getCustomerEmail().isEmpty()) {
            customer = userRepository.findByEmail(request.getCustomerEmail()).orElse(null);
        }

        Order order = Order.builder()
                .customer(customer)
                .diningTable(table)
                .orderDate(LocalDateTime.now())
                .status("IN_SERVICE")
                .totalAmount(BigDecimal.ZERO)
                .build();

        order = orderRepository.save(order);

        // Change table status to OCCUPIED
        table.setStatus("OCCUPIED");
        diningTableRepository.save(table);

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        if (request.getItems() != null) {
            for (CustomerOrderRequest.OrderItemRequest itemReq : request.getItems()) {
                Dish dish = dishRepository.findById(itemReq.getDishId())
                        .orElseThrow(() -> new ApiException("Không tìm thấy món #" + itemReq.getDishId(), HttpStatus.NOT_FOUND));

                int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;
                BigDecimal itemTotal = dish.getPrice().multiply(BigDecimal.valueOf(qty));
                subtotal = subtotal.add(itemTotal);

                OrderItem item = OrderItem.builder()
                        .order(order)
                        .dish(dish)
                        .quantity(qty)
                        .price(dish.getPrice())
                        .cookingStatus("PENDING")
                        .note(itemReq.getNote())
                        .build();

                orderItems.add(orderItemRepository.save(item));
            }
        }

        order.setTotalAmount(subtotal);
        orderRepository.save(order);

        return mapToDTO(order, orderItems);
    }

    @Override
    public OrderHistoryDTO addItemToOrder(Long orderId, CustomerOrderRequest.OrderItemRequest itemReq) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng #" + orderId, HttpStatus.NOT_FOUND));

        Dish dish = dishRepository.findById(itemReq.getDishId())
                .orElseThrow(() -> new ApiException("Không tìm thấy món #" + itemReq.getDishId(), HttpStatus.NOT_FOUND));

        int qty = itemReq.getQuantity() != null && itemReq.getQuantity() > 0 ? itemReq.getQuantity() : 1;

        OrderItem item = OrderItem.builder()
                .order(order)
                .dish(dish)
                .quantity(qty)
                .price(dish.getPrice())
                .cookingStatus("PENDING")
                .note(itemReq.getNote())
                .build();

        orderItemRepository.save(item);

        recalculateOrderTotal(order);
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        return mapToDTO(order, items);
    }

    @Override
    public OrderHistoryDTO removeItemFromOrder(Long orderId, Long dishId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng #" + orderId, HttpStatus.NOT_FOUND));

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem item : items) {
            if (item.getDish() != null && item.getDish().getId().equals(dishId)) {
                orderItemRepository.delete(item);
                break;
            }
        }

        recalculateOrderTotal(order);
        List<OrderItem> updatedItems = orderItemRepository.findByOrderId(orderId);
        return mapToDTO(order, updatedItems);
    }

    @Override
    public OrderHistoryDTO updateItemQuantity(Long orderId, Long dishId, Integer quantity, String note) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng #" + orderId, HttpStatus.NOT_FOUND));

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem item : items) {
            if (item.getDish() != null && item.getDish().getId().equals(dishId)) {
                if (quantity != null && quantity > 0) {
                    item.setQuantity(quantity);
                }
                if (note != null) {
                    item.setNote(note);
                }
                orderItemRepository.save(item);
                break;
            }
        }

        recalculateOrderTotal(order);
        List<OrderItem> updatedItems = orderItemRepository.findByOrderId(orderId);
        return mapToDTO(order, updatedItems);
    }

    @Override
    public OrderHistoryDTO sendToKitchen(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng #" + orderId, HttpStatus.NOT_FOUND));

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem item : items) {
            if ("PENDING".equalsIgnoreCase(item.getCookingStatus())) {
                item.setCookingStatus("COOKING");
                orderItemRepository.save(item);
            }
        }

        if ("PENDING".equalsIgnoreCase(order.getStatus())) {
            order.setStatus("COOKING");
            orderRepository.save(order);
        }

        return mapToDTO(order, items);
    }

    private void recalculateOrderTotal(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        BigDecimal total = items.stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(total);
        orderRepository.save(order);
    }

    private OrderHistoryDTO mapToDTO(Order order, List<OrderItem> items) {
        List<OrderHistoryDTO.OrderItemDetail> itemDetails = items.stream()
                .map(i -> OrderHistoryDTO.OrderItemDetail.builder()
                        .dishId(i.getDish() != null ? i.getDish().getId() : null)
                        .dishName(i.getDish() != null ? i.getDish().getName() : "Món ăn")
                        .image(i.getDish() != null ? i.getDish().getImage() : null)
                        .quantity(i.getQuantity())
                        .price(i.getPrice())
                        .note(i.getNote())
                        .lineTotal(i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                        .build())
                .collect(Collectors.toList());

        String cName = order.getCustomer() != null ? order.getCustomer().getFullName() : "Khách tại bàn";
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
                .build();
    }
}
