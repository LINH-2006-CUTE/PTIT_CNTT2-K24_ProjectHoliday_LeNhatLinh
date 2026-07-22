package com.example.restaurant.service;

import com.example.restaurant.dto.OrderHistoryDTO;
import com.example.restaurant.entity.Order;
import com.example.restaurant.entity.OrderItem;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.OrderItemRepository;
import com.example.restaurant.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChefKitchenServiceImpl implements ChefKitchenService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderHistoryDTO> getKitchenOrders(String cookingStatus) {
        List<Order> orders = orderRepository.findAll();

        return orders.stream()
                .filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()) && !"PAID".equalsIgnoreCase(o.getStatus()))
                .map(o -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(o.getId());
                    if (cookingStatus != null && !cookingStatus.isEmpty() && !"ALL".equalsIgnoreCase(cookingStatus)) {
                        items = items.stream()
                                .filter(i -> cookingStatus.equalsIgnoreCase(i.getCookingStatus()))
                                .collect(Collectors.toList());
                    }
                    return mapToDTO(o, items);
                })
                .filter(dto -> dto.getItems() != null && !dto.getItems().isEmpty())
                .sorted((o1, o2) -> o1.getOrderDate().compareTo(o2.getOrderDate())) // Oldest first for KDS Queue
                .limit(5)
                .collect(Collectors.toList());
    }

    @Override
    public OrderHistoryDTO updateItemCookingStatus(Long orderItemId, String cookingStatus) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ApiException("Không tìm thấy món ăn trong đơn #" + orderItemId, HttpStatus.NOT_FOUND));

        item.setCookingStatus(cookingStatus);
        orderItemRepository.save(item);

        Order order = item.getOrder();
        List<OrderItem> allItems = orderItemRepository.findByOrderId(order.getId());

        // Check if all items are READY or COMPLETED
        boolean allReady = allItems.stream().allMatch(i -> "READY".equalsIgnoreCase(i.getCookingStatus()) || "COMPLETED".equalsIgnoreCase(i.getCookingStatus()));
        if (allReady) {
            order.setStatus("READY");
            orderRepository.save(order);
        } else if ("COOKING".equalsIgnoreCase(cookingStatus) && !"COOKING".equalsIgnoreCase(order.getStatus())) {
            order.setStatus("COOKING");
            orderRepository.save(order);
        }

        return mapToDTO(order, allItems);
    }

    @Override
    public OrderHistoryDTO notifyWaiter(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng #" + orderId, HttpStatus.NOT_FOUND));
        order.setStatus("READY");
        orderRepository.save(order);

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem i : items) {
            if ("COOKING".equalsIgnoreCase(i.getCookingStatus()) || "PENDING".equalsIgnoreCase(i.getCookingStatus())) {
                i.setCookingStatus("READY");
                orderItemRepository.save(i);
            }
        }
        return mapToDTO(order, items);
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
        String tName = order.getDiningTable() != null ? order.getDiningTable().getTableNumber() : "Mang về";

        return OrderHistoryDTO.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .customerName(cName)
                .tableName(tName)
                .items(itemDetails)
                .build();
    }
}
