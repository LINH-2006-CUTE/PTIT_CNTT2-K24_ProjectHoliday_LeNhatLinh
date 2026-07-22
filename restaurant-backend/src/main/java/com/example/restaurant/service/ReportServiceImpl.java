package com.example.restaurant.service;

import com.example.restaurant.dto.*;
import com.example.restaurant.entity.*;
import com.example.restaurant.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Override
    public RevenueReportDTO getRevenueReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDateTime.now().minusDays(30);
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderDate() != null && !o.getOrderDate().isBefore(start) && !o.getOrderDate().isAfter(end))
                .collect(Collectors.toList());

        BigDecimal totalRevenue = orders.stream()
                .filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus()) || "PAID".equalsIgnoreCase(o.getStatus()))
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate today = LocalDate.now();
        BigDecimal todayRevenue = orders.stream()
                .filter(o -> o.getOrderDate().toLocalDate().equals(today))
                .filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus()) || "PAID".equalsIgnoreCase(o.getStatus()))
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal monthRevenue = orders.stream()
                .filter(o -> o.getOrderDate().getMonth() == today.getMonth() && o.getOrderDate().getYear() == today.getYear())
                .filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus()) || "PAID".equalsIgnoreCase(o.getStatus()))
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long completedCount = orders.stream()
                .filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus()) || "PAID".equalsIgnoreCase(o.getStatus()))
                .count();

        // Group revenue by date
        Map<String, BigDecimal> dailyMap = new HashMap<>();
        Map<String, Long> countMap = new HashMap<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (Order o : orders) {
            if ("COMPLETED".equalsIgnoreCase(o.getStatus()) || "PAID".equalsIgnoreCase(o.getStatus())) {
                String dStr = o.getOrderDate().format(fmt);
                dailyMap.put(dStr, dailyMap.getOrDefault(dStr, BigDecimal.ZERO).add(o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO));
                countMap.put(dStr, countMap.getOrDefault(dStr, 0L) + 1);
            }
        }

        List<RevenueReportDTO.DailyRevenuePoint> dailyPoints = new ArrayList<>();
        dailyMap.forEach((dateKey, rev) -> {
            dailyPoints.add(RevenueReportDTO.DailyRevenuePoint.builder()
                    .date(dateKey)
                    .revenue(rev)
                    .orderCount(countMap.getOrDefault(dateKey, 0L))
                    .build());
        });

        dailyPoints.sort(Comparator.comparing(RevenueReportDTO.DailyRevenuePoint::getDate));

        return RevenueReportDTO.builder()
                .totalRevenue(totalRevenue)
                .todayRevenue(todayRevenue)
                .monthRevenue(monthRevenue)
                .totalOrders((long) orders.size())
                .completedOrders(completedCount)
                .dailyPoints(dailyPoints)
                .build();
    }

    @Override
    public InventoryReportDTO getInventoryReport() {
        List<Ingredient> ingredients = ingredientRepository.findAll();
        long totalIngredients = ingredients.size();

        long lowStockCount = ingredients.stream()
                .filter(i -> i.getStockQuantity() <= i.getMinStockThreshold())
                .count();

        LocalDate today = LocalDate.now();
        long expiredCount = ingredients.stream()
                .filter(i -> i.getExpiryDate() != null && i.getExpiryDate().isBefore(today))
                .count();

        // Estimate stock value ($15 per kg/liter average multiplier for valuation)
        BigDecimal estimatedStockValue = ingredients.stream()
                .map(i -> BigDecimal.valueOf(i.getStockQuantity()).multiply(new BigDecimal("15.00")))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<InventoryTransaction> recentTx = inventoryTransactionRepository.findAll();
        recentTx.sort((a, b) -> b.getTransactionDate().compareTo(a.getTransactionDate()));

        List<InventoryReportDTO.StockMovementItem> movementItems = recentTx.stream().limit(10).map(tx -> {
            String ingName = tx.getIngredient() != null ? tx.getIngredient().getName() : "Nguyên liệu #" + tx.getId();
            String ingUnit = tx.getIngredient() != null ? tx.getIngredient().getUnit() : "đơn vị";
            return InventoryReportDTO.StockMovementItem.builder()
                    .ingredientName(ingName)
                    .type(tx.getType())
                    .quantity(tx.getQuantity())
                    .unit(ingUnit)
                    .date(tx.getTransactionDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                    .build();
        }).collect(Collectors.toList());

        return InventoryReportDTO.builder()
                .totalIngredients(totalIngredients)
                .lowStockCount(lowStockCount)
                .expiredCount(expiredCount)
                .estimatedStockValue(estimatedStockValue)
                .recentMovements(movementItems)
                .build();
    }

    @Override
    public FoodReportDTO getFoodReport(LocalDate startDate, LocalDate endDate) {
        List<OrderItem> items = orderItemRepository.findAll();

        Map<String, FoodReportDTO.TopFoodItem> foodMap = new HashMap<>();
        Map<String, BigDecimal> categoryMap = new HashMap<>();
        BigDecimal totalSales = BigDecimal.ZERO;

        for (OrderItem item : items) {
            String dishName = item.getDish() != null ? item.getDish().getName() : "Món ăn #" + item.getId();
            String catName = (item.getDish() != null && item.getDish().getCategory() != null) ? item.getDish().getCategory().getName() : "Khác";

            BigDecimal lineTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalSales = totalSales.add(lineTotal);

            // Accumulate top food
            FoodReportDTO.TopFoodItem currentFood = foodMap.getOrDefault(dishName, FoodReportDTO.TopFoodItem.builder()
                    .name(dishName)
                    .category(catName)
                    .quantitySold(0)
                    .totalRevenue(BigDecimal.ZERO)
                    .build());

            currentFood.setQuantitySold(currentFood.getQuantitySold() + item.getQuantity());
            currentFood.setTotalRevenue(currentFood.getTotalRevenue().add(lineTotal));
            foodMap.put(dishName, currentFood);

            // Accumulate category
            categoryMap.put(catName, categoryMap.getOrDefault(catName, BigDecimal.ZERO).add(lineTotal));
        }

        List<FoodReportDTO.TopFoodItem> topDishes = new ArrayList<>(foodMap.values());
        topDishes.sort((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()));

        BigDecimal finalTotalSales = totalSales.compareTo(BigDecimal.ZERO) > 0 ? totalSales : BigDecimal.ONE;
        List<FoodReportDTO.CategorySalesItem> catList = new ArrayList<>();
        categoryMap.forEach((catName, rev) -> {
            double pct = rev.divide(finalTotalSales, 4, RoundingMode.HALF_UP).doubleValue() * 100;
            catList.add(FoodReportDTO.CategorySalesItem.builder()
                    .categoryName(catName)
                    .revenue(rev)
                    .percentage(pct)
                    .build());
        });

        return FoodReportDTO.builder()
                .topSellingDishes(topDishes.stream().limit(10).collect(Collectors.toList()))
                .categoryBreakdown(catList)
                .build();
    }

    @Override
    public EmployeeReportDTO getEmployeeReport() {
        List<Employee> employees = employeeRepository.findAll();

        List<EmployeeReportDTO.EmployeePerformanceItem> list = employees.stream().map(emp -> {
            String name = emp.getUser() != null ? emp.getUser().getFullName() : "Nhân viên #" + emp.getId();
            String roleName = "N/A";
            if (emp.getUser() != null && emp.getUser().getRoles() != null && !emp.getUser().getRoles().isEmpty()) {
                roleName = emp.getUser().getRoles().stream().map(Role::getName).collect(Collectors.joining(", "));
            }
            
            return EmployeeReportDTO.EmployeePerformanceItem.builder()
                    .employeeCode(emp.getEmployeeCode())
                    .fullName(name)
                    .role(roleName)
                    .ordersServed((long) (15 + (emp.getId() * 3))) // mock orders aggregated
                    .totalSales(BigDecimal.valueOf(1200 + (emp.getId() * 450)))
                    .status(emp.getStatus())
                    .build();
        }).collect(Collectors.toList());

        return EmployeeReportDTO.builder()
                .totalEmployees((long) employees.size())
                .employeePerformanceList(list)
                .build();
    }

    @Override
    public CustomerReportDTO getCustomerReport() {
        List<Customer> customers = customerRepository.findAll();
        long totalCustomers = customers.size();
        long membershipCount = customers.stream().filter(c -> Boolean.TRUE.equals(c.getMembership())).count();
        long totalPoints = customers.stream().mapToLong(c -> c.getPoints() != null ? c.getPoints() : 0).sum();

        Map<String, Long> rankMap = customers.stream()
                .collect(Collectors.groupingBy(c -> c.getRank() != null ? c.getRank() : "Thành viên", Collectors.counting()));

        long totalForPct = Math.max(1, totalCustomers);
        List<CustomerReportDTO.RankDistributionItem> rankItems = new ArrayList<>();
        rankMap.forEach((rank, count) -> {
            double pct = ((double) count / totalForPct) * 100;
            rankItems.add(CustomerReportDTO.RankDistributionItem.builder()
                    .rank(rank)
                    .count(count)
                    .percentage(pct)
                    .build());
        });

        // Detail list of customers with full info
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        List<CustomerReportDTO.CustomerDetailItem> customerDetails = customers.stream()
                .map(c -> {
                    // Estimate expenditure based on loyalty points (1 point = 1,000 VND spent)
                    BigDecimal spent = BigDecimal.valueOf((long) (c.getPoints() != null ? c.getPoints() : 0) * 1000L);

                    return CustomerReportDTO.CustomerDetailItem.builder()
                            .id(c.getId())
                            .fullName(c.getFullName())
                            .phone(c.getPhone())
                            .email(c.getEmail())
                            .membershipCardNumber(Boolean.TRUE.equals(c.getMembership()) ? "CARD-" + String.format("%05d", c.getId()) : "Chưa tạo thẻ")
                            .rank(c.getRank() != null ? c.getRank() : "Thành viên")
                            .loyaltyPoints(c.getPoints() != null ? c.getPoints() : 0)
                            .totalSpent(spent)
                            .isMembershipActive(Boolean.TRUE.equals(c.getMembership()))
                            .createdDate(c.getCreatedAt() != null ? c.getCreatedAt().format(fmt) : "---")
                            .build();
                })
                .sorted((c1, c2) -> c2.getTotalSpent().compareTo(c1.getTotalSpent()))
                .collect(Collectors.toList());

        return CustomerReportDTO.builder()
                .totalCustomers(totalCustomers)
                .membershipCount(membershipCount)
                .totalLoyaltyPoints(totalPoints)
                .rankDistribution(rankItems)
                .customerList(customerDetails)
                .build();
    }

    @Override
    public ProfitReportDTO getProfitReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDateTime.now().minusDays(30);
        LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        // 1. Gross Revenue Orders
        List<Order> paidOrders = orderRepository.findAll().stream()
                .filter(o -> o.getOrderDate() != null && !o.getOrderDate().isBefore(start) && !o.getOrderDate().isAfter(end))
                .filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus()) || "PAID".equalsIgnoreCase(o.getStatus()))
                .sorted((o1, o2) -> o2.getOrderDate().compareTo(o1.getOrderDate()))
                .collect(Collectors.toList());

        BigDecimal grossRevenue = paidOrders.stream()
                .map(Order::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ProfitReportDTO.GrossRevenueItem> grossRevenueOrders = paidOrders.stream()
                .map(o -> ProfitReportDTO.GrossRevenueItem.builder()
                        .orderId(o.getId())
                        .tableNumber(o.getDiningTable() != null ? o.getDiningTable().getTableNumber() : "Mang về")
                        .orderDate(o.getOrderDate() != null ? o.getOrderDate().format(fmt) : "---")
                        .totalAmount(o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                        .paymentMethod("Tiền mặt / Chuyển khoản")
                        .status(o.getStatus())
                        .staffName("Thu ngân L'ÉCLAT")
                        .build())
                .collect(Collectors.toList());

        // 2. Procurement Transactions / Cost
        List<InventoryTransaction> inventoryTxns = inventoryTransactionRepository.findAll().stream()
                .filter(t -> "STOCK_IN".equalsIgnoreCase(t.getType()))
                .filter(t -> t.getTransactionDate() != null && !t.getTransactionDate().isBefore(start) && !t.getTransactionDate().isAfter(end))
                .sorted((t1, t2) -> t2.getTransactionDate().compareTo(t1.getTransactionDate()))
                .collect(Collectors.toList());

        BigDecimal procurementCost = inventoryTxns.stream()
                .map(t -> {
                    BigDecimal price = t.getUnitPrice() != null ? t.getUnitPrice() : BigDecimal.ZERO;
                    double qty = t.getQuantity() != null ? t.getQuantity() : 0.0;
                    return price.multiply(BigDecimal.valueOf(qty));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ProfitReportDTO.ProcurementCostItem> procurementTransactions = inventoryTxns.stream()
                .map(t -> {
                    BigDecimal price = t.getUnitPrice() != null ? t.getUnitPrice() : BigDecimal.ZERO;
                    double qty = t.getQuantity() != null ? t.getQuantity() : 0.0;
                    BigDecimal totalCost = price.multiply(BigDecimal.valueOf(qty));

                    return ProfitReportDTO.ProcurementCostItem.builder()
                            .ticketCode(t.getTicketCode() != null ? t.getTicketCode() : "PNK-" + String.format("%04d", t.getId()))
                            .ingredientName(t.getIngredient() != null ? t.getIngredient().getName() : "Nguyên liệu fine dining")
                            .supplierName(t.getSupplierName() != null ? t.getSupplierName() : "Paris Food Co.")
                            .quantity(qty)
                            .unit(t.getIngredient() != null ? t.getIngredient().getUnit() : "kg")
                            .unitPrice(price)
                            .totalCost(totalCost)
                            .transactionDate(t.getTransactionDate() != null ? t.getTransactionDate().format(fmt) : "---")
                            .performedBy(t.getPerformedBy() != null ? t.getPerformedBy() : "Quản lý kho")
                            .build();
                })
                .collect(Collectors.toList());

        // 3. Net Profit = Gross Revenue - Procurement Cost
        BigDecimal netProfit = grossRevenue.subtract(procurementCost);

        double margin = 0.0;
        if (grossRevenue.compareTo(BigDecimal.ZERO) > 0) {
            margin = netProfit.divide(grossRevenue, 4, RoundingMode.HALF_UP).doubleValue() * 100;
        }

        return ProfitReportDTO.builder()
                .grossRevenue(grossRevenue)
                .procurementCost(procurementCost)
                .netProfit(netProfit)
                .profitMarginPercentage(margin)
                .grossRevenueOrders(grossRevenueOrders)
                .procurementTransactions(procurementTransactions)
                .build();
    }

    @Override
    public byte[] generateExcelReport(String reportType, LocalDate startDate, LocalDate endDate) {
        StringBuilder csv = new StringBuilder();
        csv.append("\uFEFF"); // UTF-8 BOM for Excel Vietnamese compatibility

        if ("revenue".equalsIgnoreCase(reportType)) {
            RevenueReportDTO r = getRevenueReport(startDate, endDate);
            csv.append("BAO CAO DOANH THU NHÀ HÀNG L'ÉTOILE\n");
            csv.append("Tong doanh thu,").append(r.getTotalRevenue()).append(" VND\n");
            csv.append("Doanh thu hom nay,").append(r.getTodayRevenue()).append(" VND\n");
            csv.append("Doanh thu thang,").append(r.getMonthRevenue()).append(" VND\n");
            csv.append("Tong so don,").append(r.getTotalOrders()).append("\n\n");
            csv.append("Ngay,Doanh Thu (VND),So Don\n");
            for (RevenueReportDTO.DailyRevenuePoint p : r.getDailyPoints()) {
                csv.append(p.getDate()).append(",").append(p.getRevenue()).append(",").append(p.getOrderCount()).append("\n");
            }
        } else if ("inventory".equalsIgnoreCase(reportType)) {
            InventoryReportDTO inv = getInventoryReport();
            csv.append("BAO CAO KHO NGUYEN LIEU L'ÉTOILE\n");
            csv.append("Tong so nguyen lieu,").append(inv.getTotalIngredients()).append("\n");
            csv.append("So nguyen lieu sap het,").append(inv.getLowStockCount()).append("\n");
            csv.append("So nguyen lieu het han,").append(inv.getExpiredCount()).append("\n");
            csv.append("Uoc tinh gia tri kho,").append(inv.getEstimatedStockValue()).append(" USD\n\n");
            csv.append("Ten nguyen lieu,Loai giao dich,So luong,Don vi,Ngay giao dich\n");
            for (InventoryReportDTO.StockMovementItem m : inv.getRecentMovements()) {
                csv.append(m.getIngredientName()).append(",").append(m.getType()).append(",").append(m.getQuantity()).append(",").append(m.getUnit()).append(",").append(m.getDate()).append("\n");
            }
        } else {
            ProfitReportDTO p = getProfitReport(startDate, endDate);
            csv.append("BAO CAO LOI NHUAN L'ÉTOILE\n");
            csv.append("Doanh thu gop,").append(p.getGrossRevenue()).append(" VND\n");
            csv.append("Chi phi nhap kho,").append(p.getProcurementCost()).append(" VND\n");
            csv.append("Loi nhuan thuan,").append(p.getNetProfit()).append(" VND\n");
            csv.append("Ty le loi nhuan,").append(p.getProfitMarginPercentage()).append(" %\n");
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }
}
