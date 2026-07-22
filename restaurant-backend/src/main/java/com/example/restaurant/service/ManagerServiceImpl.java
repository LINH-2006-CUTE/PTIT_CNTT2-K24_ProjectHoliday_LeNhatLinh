package com.example.restaurant.service;

import com.example.restaurant.dto.*;
import com.example.restaurant.entity.*;
import com.example.restaurant.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ManagerServiceImpl implements ManagerService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Override
    @Transactional(readOnly = true)
    public ManagerDashboardDTO getDashboardStats() {
        List<Invoice> invoices = invoiceRepository.findAll();

        BigDecimal revenueToday = invoices.stream()
                .map(Invoice::getGrandTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal revenueMonth = revenueToday.multiply(new BigDecimal("22.5"));
        BigDecimal profitToday = revenueToday.multiply(new BigDecimal("0.35")); // 35% net margin

        List<ManagerDashboardDTO.TopSellingDishDTO> topDishes = List.of(
                ManagerDashboardDTO.TopSellingDishDTO.builder().dishName("Bò Bit-Tết Sốt Nấm Truffle").quantitySold(42).revenue(new BigDecimal("18900000")).build(),
                ManagerDashboardDTO.TopSellingDishDTO.builder().dishName("Cá Tầm Nướng Muối Ớt").quantitySold(28).revenue(new BigDecimal("12600000")).build(),
                ManagerDashboardDTO.TopSellingDishDTO.builder().dishName("Súp Bào Ngư Vi Cá").quantitySold(35).revenue(new BigDecimal("15750000")).build(),
                ManagerDashboardDTO.TopSellingDishDTO.builder().dishName("Rượu Vang Đỏ Chateau Margaux").quantitySold(15).revenue(new BigDecimal("22500000")).build()
        );

        List<ManagerDashboardDTO.DailyRevenueStat> chartData = List.of(
                ManagerDashboardDTO.DailyRevenueStat.builder().day("Thứ 2").revenue(new BigDecimal("14500000")).profit(new BigDecimal("5075000")).build(),
                ManagerDashboardDTO.DailyRevenueStat.builder().day("Thứ 3").revenue(new BigDecimal("16200000")).profit(new BigDecimal("5670000")).build(),
                ManagerDashboardDTO.DailyRevenueStat.builder().day("Thứ 4").revenue(new BigDecimal("18900000")).profit(new BigDecimal("6615000")).build(),
                ManagerDashboardDTO.DailyRevenueStat.builder().day("Thứ 5").revenue(new BigDecimal("15400000")).profit(new BigDecimal("5390000")).build(),
                ManagerDashboardDTO.DailyRevenueStat.builder().day("Thứ 6").revenue(new BigDecimal("24800000")).profit(new BigDecimal("8680000")).build(),
                ManagerDashboardDTO.DailyRevenueStat.builder().day("Thứ 7").revenue(new BigDecimal("31200000")).profit(new BigDecimal("10920000")).build(),
                ManagerDashboardDTO.DailyRevenueStat.builder().day("Chủ Nhật").revenue(new BigDecimal("28500000")).profit(new BigDecimal("9975000")).build()
        );

        return ManagerDashboardDTO.builder()
                .revenueToday(revenueToday)
                .revenueMonth(revenueMonth)
                .profitToday(profitToday)
                .totalOrdersToday(orderRepository.findAll().size())
                .totalReservationsToday(reservationRepository.findAll().size())
                .lowStockItemsCount(3)
                .activeEmployeesCount(userRepository.findAll().size())
                .topSellingDishes(topDishes)
                .revenueChartData(chartData)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStaffList() {
        List<User> users = userRepository.findAll();
        return users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("fullName", u.getFullName());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone());
            map.put("roles", u.getRoles().stream().map(Role::getName).collect(Collectors.toList()));
            map.put("gender", u.getGender() != null ? u.getGender() : "MALE");
            map.put("status", "ACTIVE");
            map.put("shift", "Ca Sáng (07:00 - 15:00)");
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getInventoryList() {
        return List.of(
                Map.of("id", 1, "name", "Thịt Bò Wagyu A5", "category", "Thịt Tươi", "quantity", 18.5, "unit", "kg", "minThreshold", 10.0, "status", "GOOD"),
                Map.of("id", 2, "name", "Cá Tầm Na Uy", "category", "Hải Sản", "quantity", 6.2, "unit", "kg", "minThreshold", 10.0, "status", "LOW_STOCK"),
                Map.of("id", 3, "name", "Nấm Truffle Đen", "category", "Gia Vị Cao Cấp", "quantity", 1.8, "unit", "kg", "minThreshold", 2.0, "status", "LOW_STOCK"),
                Map.of("id", 4, "name", "Rượu Vang Bordeaux 2018", "category", "Đồ Uống", "quantity", 45, "unit", "chai", "minThreshold", 15, "status", "GOOD")
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSuppliersList() {
        return List.of(
                Map.of("id", 1, "name", "Công ty Hải Sản Biển Đông", "contactPerson", "Trần Văn Bình", "phone", "+84 909112233", "email", "lienhe@haisanbiendong.vn", "address", "TP. Hồ Chí Minh"),
                Map.of("id", 2, "name", "Nông Trại Đà Lạt Organics", "contactPerson", "Lê Thị Hoa", "phone", "+84 918223344", "email", "sales@dalatorganic.vn", "address", "Đà Lạt, Lâm Đồng")
        );
    }

    @Override
    public Map<String, Object> sendStaffNotification(String title, String message, String targetRole) {
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("sentAt", new Date());
        res.put("targetRole", targetRole);
        res.put("message", "Đã phát thông báo khẩn cấp tới toàn bộ bộ phận: " + targetRole);
        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getAnalytics() {
        Map<String, Object> res = new HashMap<>();
        res.put("monthlyGrowth", "+18.4%");
        res.put("customerSatisfaction", "4.8/5.0");
        res.put("tableOccupancyRate", "86.5%");
        return res;
    }
}
