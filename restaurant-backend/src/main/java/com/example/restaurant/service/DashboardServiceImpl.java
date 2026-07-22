package com.example.restaurant.service;

import com.example.restaurant.dto.*;
import com.example.restaurant.entity.Ingredient;
import com.example.restaurant.entity.Order;
import com.example.restaurant.entity.User;
import com.example.restaurant.repository.IngredientRepository;
import com.example.restaurant.repository.OrderItemRepository;
import com.example.restaurant.repository.OrderRepository;
import com.example.restaurant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(DashboardQuery query) {
        LocalDateTime now = LocalDateTime.now();
        
        // 1. Calculate revenues
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        BigDecimal todayRevenue = orderRepository.calculateRevenueSince(startOfToday);
        
        LocalDateTime startOfMonth = now.toLocalDate().withDayOfMonth(1).atStartOfDay();
        BigDecimal monthRevenue = orderRepository.calculateRevenueSince(startOfMonth);

        // 2. Calculate order metrics
        Long totalOrders = orderRepository.count();
        Long activeOrders = orderRepository.countByStatus("IN_SERVICE");
        Long completedOrders = orderRepository.countByStatus("COMPLETED");

        // 3. User metrics
        List<User> allUsers = userRepository.findAll();
        Long totalCustomers = allUsers.stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_CUSTOMER")))
                .count();
        Long totalEmployees = allUsers.stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> 
                        r.getName().equals("ROLE_ADMIN") || 
                        r.getName().equals("ROLE_MANAGER") || 
                        r.getName().equals("ROLE_STAFF")
                ))
                .count();

        // 4. Top selling dishes and customers. The controller validates the requested limit.
        List<Object[]> topDishesRaw = orderItemRepository.findTopSellingDishesRaw();
        List<TopDishDto> topSellingDishes = topDishesRaw.stream()
                .limit(query.getTopLimit())
                .map(row -> TopDishDto.builder()
                        .name((String) row[0])
                        .category((String) row[1])
                        .quantitySold(((Number) row[2]).longValue())
                        .totalRevenue((BigDecimal) row[3])
                        .build()
                )
                .collect(Collectors.toList());

        // 5. Top Spending Customers (limit to 5)
        List<Object[]> topCustomersRaw = orderRepository.findTopCustomersRaw();
        List<TopCustomerDto> topCustomers = topCustomersRaw.stream()
                .limit(query.getTopLimit())
                .map(row -> TopCustomerDto.builder()
                        .email((String) row[0])
                        .fullName((String) row[1])
                        .ordersCount(((Number) row[2]).longValue())
                        .totalSpent((BigDecimal) row[3])
                        .build()
                )
                .collect(Collectors.toList());

        // 6. Low Stock Ingredients
        List<Ingredient> lowStockIngredientsRaw = ingredientRepository.findLowStockIngredients();
        List<IngredientDto> lowStockIngredients = lowStockIngredientsRaw.stream()
                .map(i -> IngredientDto.builder()
                        .name(i.getName())
                        .stockQuantity(i.getStockQuantity())
                        .minStockThreshold(i.getMinStockThreshold())
                        .unit(i.getUnit())
                        .isLowStock(true)
                        .build()
                )
                .collect(Collectors.toList());

        // 7. Chronological monthly revenue trend.
        Map<String, BigDecimal> monthlyMap = new LinkedHashMap<>();
        for (int i = query.getMonths() - 1; i >= 0; i--) {
            LocalDateTime targetMonth = now.minusMonths(i);
            String monthName = targetMonth.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            String label = monthName + " " + targetMonth.getYear();
            monthlyMap.put(label, BigDecimal.ZERO);
        }

        LocalDateTime trendStart = now.minusMonths(query.getMonths() - 1).withDayOfMonth(1).toLocalDate().atStartOfDay();
        List<Order> recentCompletedOrders = orderRepository.findByStatusAndOrderDateAfter("COMPLETED", trendStart);

        for (Order order : recentCompletedOrders) {
            String monthName = order.getOrderDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            String label = monthName + " " + order.getOrderDate().getYear();
            if (monthlyMap.containsKey(label)) {
                monthlyMap.put(label, monthlyMap.get(label).add(order.getTotalAmount()));
            }
        }

        List<MonthlyRevenueDto> monthlyRevenueData = monthlyMap.entrySet().stream()
                .map(entry -> MonthlyRevenueDto.builder()
                        .month(entry.getKey())
                        .revenue(entry.getValue())
                        .build()
                )
                .collect(Collectors.toList());

        // 8. Weekly revenue trend (last 8 weeks)
        List<MonthlyRevenueDto> weeklyRevenueData = new java.util.ArrayList<>();
        java.time.format.DateTimeFormatter dtf = java.time.format.DateTimeFormatter.ofPattern("dd/MM");
        for (int i = 7; i >= 0; i--) {
            LocalDateTime startOfWeek = now.minusWeeks(i).with(java.time.DayOfWeek.MONDAY).toLocalDate().atStartOfDay();
            LocalDateTime endOfWeek = startOfWeek.plusDays(6).toLocalDate().atTime(23, 59, 59);
            
            BigDecimal weekRev = orderRepository.calculateRevenueBetween(startOfWeek, endOfWeek);
            if (weekRev == null) weekRev = BigDecimal.ZERO;
            
            String label = "T" + (8 - i) + " (" + startOfWeek.format(dtf) + "-" + endOfWeek.format(dtf) + ")";
            weeklyRevenueData.add(MonthlyRevenueDto.builder()
                    .month(label)
                    .revenue(weekRev)
                    .build());
        }

        return DashboardStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .todayRevenue(todayRevenue)
                .monthRevenue(monthRevenue)
                .totalOrders(totalOrders)
                .activeOrders(activeOrders)
                .completedOrders(completedOrders)
                .totalCustomers(totalCustomers)
                .totalEmployees(totalEmployees)
                .topSellingDishes(topSellingDishes)
                .topCustomers(topCustomers)
                .lowStockIngredients(lowStockIngredients)
                .monthlyRevenueData(monthlyRevenueData)
                .weeklyRevenueData(weeklyRevenueData)
                .build();
    }
}
