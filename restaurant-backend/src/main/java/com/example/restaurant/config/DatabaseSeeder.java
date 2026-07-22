package com.example.restaurant.config;

import com.example.restaurant.entity.*;
import com.example.restaurant.repository.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.*;

@Component
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DishRepository dishRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private DiningTableRepository diningTableRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private PurchaseOrderItemRepository purchaseOrderItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private CustomerReviewRepository customerReviewRepository;

    @Autowired
    private DishRecipeRepository dishRecipeRepository;

    @Autowired
    private com.example.restaurant.repository.StaffNotificationRepository staffNotificationRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Checking database state for seeding...");

        // 0. Seed Complete Fine Dining RBAC Permissions
        Permission readDashboard = seedPermissionIfMissing("DASHBOARD_READ", "Xem báo cáo thống kê & chỉ số điều hành");
        Permission manageUsers = seedPermissionIfMissing("USER_MANAGE", "Quản lý tài khoản người dùng hệ thống");
        Permission manageEmployees = seedPermissionIfMissing("EMPLOYEE_MANAGE", "Quản lý hồ sơ nhân viên, phân ca & lương");
        Permission manageRoles = seedPermissionIfMissing("ROLE_MANAGE", "Cấu hình vai trò & phân quyền RBAC");
        Permission manageMenu = seedPermissionIfMissing("MENU_MANAGE", "Quản lý danh mục & món ăn Fine Dining");
        Permission manageOrders = seedPermissionIfMissing("ORDER_MANAGE", "Phục vụ bàn, tạo đơn & gọi món ăn");
        Permission manageKitchen = seedPermissionIfMissing("KITCHEN_MANAGE", "Màn hình điều phối bếp & chế biến KDS");
        Permission manageCashier = seedPermissionIfMissing("CASHIER_MANAGE", "Thu ngân, thanh toán & in hóa đơn");
        Permission manageInventory = seedPermissionIfMissing("INVENTORY_MANAGE", "Quản lý kho nguyên liệu & nhập/xuất kho");
        Permission manageCustomers = seedPermissionIfMissing("CUSTOMER_MANAGE", "Quản lý thực khách & thẻ thành viên VIP");
        Permission managePromotions = seedPermissionIfMissing("PROMOTION_MANAGE", "Quản lý chương trình khuyến mãi & giảm giá");
        Permission manageReports = seedPermissionIfMissing("REPORT_MANAGE", "Xem & xuất báo cáo doanh thu, kho & nhân sự");

        // 1. Seed System Roles
        Role adminRole = seedRoleIfMissing("ROLE_ADMIN");
        Role managerRole = seedRoleIfMissing("ROLE_MANAGER");
        Role staffRole = seedRoleIfMissing("ROLE_STAFF");
        Role waiterRole = seedRoleIfMissing("ROLE_WAITER");
        Role chefRole = seedRoleIfMissing("ROLE_CHEF");
        Role cashierRole = seedRoleIfMissing("ROLE_CASHIER");
        Role customerRole = seedRoleIfMissing("ROLE_CUSTOMER");

        // Assign Permissions to Roles
        adminRole.setPermissions(new HashSet<>(Set.of(
                readDashboard, manageUsers, manageEmployees, manageRoles, manageMenu,
                manageOrders, manageKitchen, manageCashier, manageInventory, manageCustomers, managePromotions, manageReports
        )));
        roleRepository.save(adminRole);

        managerRole.setPermissions(new HashSet<>(Set.of(
                readDashboard, manageEmployees, manageRoles, manageMenu, manageOrders,
                manageKitchen, manageCashier, manageInventory, manageCustomers, managePromotions, manageReports
        )));
        roleRepository.save(managerRole);

        staffRole.setPermissions(new HashSet<>(Set.of(readDashboard, manageKitchen, manageOrders)));
        roleRepository.save(staffRole);

        waiterRole.setPermissions(new HashSet<>(Set.of(readDashboard, manageOrders, manageCustomers)));
        roleRepository.save(waiterRole);

        chefRole.setPermissions(new HashSet<>(Set.of(readDashboard, manageKitchen, manageInventory)));
        roleRepository.save(chefRole);

        cashierRole.setPermissions(new HashSet<>(Set.of(readDashboard, manageCashier, manageOrders, manageCustomers)));
        roleRepository.save(cashierRole);

        // 2. Seed Users
        User adminUser = null;
        User customer1 = null;
        User customer2 = null;
        User staffUser = null;
        User waiterUser = null;

        if (userRepository.count() == 0) {
            log.info("Seeding default users...");

            // Admin
            adminUser = User.builder()
                    .email("admin@restaurant.com")
                    .password(passwordEncoder.encode("adminpassword"))
                    .fullName("System Administrator")
                    .phone("+84 901234567")
                    .roles(Set.of(adminRole))
                    .enabled(true)
                    .build();
            userRepository.save(adminUser);

            // Waiter User
            waiterUser = User.builder()
                    .email("waiter@restaurant.com")
                    .password(passwordEncoder.encode("waiterpassword"))
                    .fullName("Lê Nhật Linh (Phục Vụ)")
                    .phone("+84 988776655")
                    .roles(Set.of(waiterRole))
                    .enabled(true)
                    .build();
            userRepository.save(waiterUser);

            // Staff
            staffUser = User.builder()
                    .email("staff1@restaurant.com")
                    .password(passwordEncoder.encode("staffpassword"))
                    .fullName("Chef Alex")
                    .phone("+84 901234568")
                    .roles(Set.of(staffRole))
                    .enabled(true)
                    .build();
            userRepository.save(staffUser);

            // Customers
            customer1 = User.builder()
                    .email("customer1@gmail.com")
                    .password(passwordEncoder.encode("password"))
                    .fullName("David Beckham")
                    .phone("+84 987654321")
                    .roles(Set.of(customerRole))
                    .enabled(true)
                    .build();
            userRepository.save(customer1);

            customer2 = User.builder()
                    .email("customer2@gmail.com")
                    .password(passwordEncoder.encode("password"))
                    .fullName("Victoria Beckham")
                    .phone("+84 987654322")
                    .roles(Set.of(customerRole))
                    .enabled(true)
                    .build();
            userRepository.save(customer2);

            log.info("Default users seeded.");
        }

        // Ensure Waiter User is ALWAYS created if missing
        if (userRepository.findByEmail("waiter@restaurant.com").isEmpty()) {
            waiterUser = User.builder()
                    .email("waiter@restaurant.com")
                    .password(passwordEncoder.encode("waiterpassword"))
                    .fullName("Lê Nhật Linh (Phục Vụ)")
                    .phone("+84 988776655")
                    .roles(Set.of(waiterRole))
                    .enabled(true)
                    .build();
            userRepository.save(waiterUser);
            log.info("Waiter user seeded successfully.");
        } else {
            waiterUser = userRepository.findByEmail("waiter@restaurant.com").get();
        }

        adminUser = userRepository.findByEmail("admin@restaurant.com").orElse(null);
        staffUser = userRepository.findByEmail("staff1@restaurant.com").orElse(null);
        customer1 = userRepository.findByEmail("customer1@gmail.com").orElse(null);
        customer2 = userRepository.findByEmail("customer2@gmail.com").orElse(null);

        // 2.5 Seed Employees
        if (employeeRepository.count() == 0) {
            log.info("Seeding employees profiles...");
            if (adminUser != null) {
                employeeRepository.save(Employee.builder()
                        .employeeCode("EMP-0000")
                        .user(adminUser)
                        .birthday(LocalDate.of(1985, 10, 20))
                        .gender("MALE")
                        .address("101 Corporate Blvd, New York")
                        .salary(new BigDecimal("5000.00"))
                        .hireDate(LocalDate.of(2023, 6, 1))
                        .status("ACTIVE")
                        .build());
            }
            if (staffUser != null) {
                employeeRepository.save(Employee.builder()
                        .employeeCode("EMP-0001")
                        .user(staffUser)
                        .birthday(LocalDate.of(1992, 4, 15))
                        .gender("MALE")
                        .address("456 Chef Lane, Hanoi")
                        .salary(new BigDecimal("1800.00"))
                        .hireDate(LocalDate.of(2024, 1, 10))
                        .status("ACTIVE")
                        .build());
            }
            log.info("Employees profiles seeded.");
        }

        // 2.7 Seed Categories
        Category mainCat = seedCategoryIfMissing("Main", "Thăn nội bò Wagyu, Steak Úc nướng đá & các món chính Fine Dining", "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80");
        Category appetizerCat = seedCategoryIfMissing("Appetizer", "Cá hồi Carpaccio, Truffle fries & các món khai vị phong cách Pháp", "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80");
        Category dessertCat = seedCategoryIfMissing("Dessert", "Crème Brûlée, Tiramisu, Chocolate Lava & Bánh ngọt Pháp", "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80");
        Category drinkCat = seedCategoryIfMissing("Drink", "Rượu vang đỏ Bordeaux, Champagne Dom Pérignon & Cocktail Signature", "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80");
        Category seafoodCat = seedCategoryIfMissing("Seafood", "Tôm hùm Alaska đút lò phô mai, Sò điệp Hokkaido & Cá tuyết hấp", "https://images.unsplash.com/photo-1553240799-36bbf332a5c3?auto=format&fit=crop&w=600&q=80");
        Category pastaCat = seedCategoryIfMissing("Pasta & Risotto", "Spaghetti hải sản sốt Truffle & Cơm Ý Risotto nấm đen", "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80");
        Category soupSaladCat = seedCategoryIfMissing("Soup & Salad", "Salad Caesar ức gà nướng, Salad bò Mỹ & Súp hải sản Bouillabaisse", "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80");
        Category setMenuCat = seedCategoryIfMissing("Set Menu", "Thực đơn trọn gói Fine Dining thượng hạng dành cho tiệc riêng & cặp đôi", "https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?auto=format&fit=crop&w=600&q=80");

        // 3. Seed Dishes (Menu Items - 40 Fine Dining Dishes)
        List<Dish> dishes = new ArrayList<>();
        log.info("Seeding / Syncing fine dining dishes with categories...");
        
        // --- MÓN CHÍNH (MAIN COURSE) ---
        dishes.add(saveDish("Filet Mignon Bò Wagyu", new BigDecimal("580000"), "Thăn nội bò Wagyu sốt vang đỏ Bordeaux và nấm Truffle đen.", "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", new BigDecimal("10"), mainCat));
        dishes.add(saveDish("Ribeye Steak Sốt Thảo Mộc", new BigDecimal("620000"), "Thăn ngoại bò Úc nướng đá than hoa kèm bơ thảo mộc Pháp.", "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80", new BigDecimal("15"), mainCat));
        dishes.add(saveDish("Cừu Nướng Sốt Bạc Hà", new BigDecimal("520000"), "Sườn cừu New Zealand đút lò thảo mộc Rosemary kèm khoai tây nghiền.", "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, mainCat));
        dishes.add(saveDish("Ức Vịt Sốt Cam Grand Marnier", new BigDecimal("450000"), "Ức vịt Pháp áp chảo da giòn sốt cam ngâm rượu Grand Marnier.", "https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, mainCat));

        // --- HẢI SẢN (SEAFOOD) ---
        dishes.add(saveDish("Lobster Thermidor", new BigDecimal("750000"), "Tôm hùm Alaska đút lò phô mai Gruyère & kem mù tạt Dijonnaise.", "https://images.unsplash.com/photo-1553240799-36bbf332a5c3?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, seafoodCat));
        dishes.add(saveDish("Cá Hồi Nướng Sốt Bơ Chanh", new BigDecimal("420000"), "Filet cá hồi Na Uy áp chảo sốt bơ chanh vàng và măng tây tươi.", "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80", new BigDecimal("5"), seafoodCat));
        dishes.add(saveDish("Cá Tuyết Hấp Sốt Nấm", new BigDecimal("680000"), "Cá tuyết Đại Tây Dương hấp nấm Đông Cô & gừng sợi thơm nồng.", "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80", new BigDecimal("20"), seafoodCat));
        dishes.add(saveDish("Tôm Nướng Sốt Bơ Tỏi", new BigDecimal("220000"), "Tôm sú tươi nướng bơ tỏi vị thảo mộc đút lò thơm lừng.", "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, seafoodCat));
        dishes.add(saveDish("Sò Điệp Hokkaido Áp Chảo", new BigDecimal("290000"), "Sò điệp Nhật áp chảo kem bơ nghệ tây và trứng cá hồi cao cấp.", "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, seafoodCat));

        // --- PASTA & RISOTTO ---
        dishes.add(saveDish("Mì Ý Hải Sản Truffle", new BigDecimal("380000"), "Mì Spaghetti thủ công sốt kem nấm Truffle, sò điệp & tôm bóc vỏ.", "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, pastaCat));
        dishes.add(saveDish("Risotto Nấm Truffle & Sò Điệp", new BigDecimal("410000"), "Cơm Ý nấm Truffle đen kết hợp sò điệp Hokkaido nướng xém.", "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, pastaCat));

        // --- SET MENU ---
        dishes.add(saveDish("Bò Wellington Hoàng Gia", new BigDecimal("850000"), "Thăn bò cuốn nấm Truffle & pate gan ngỗng bọc bột ngàn lớp nướng vàng.", "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", new BigDecimal("10"), setMenuCat));

        // --- SÚP & SALAD (SOUP & SALAD) ---
        dishes.add(saveDish("Súp Nấm Truffle Hoàng Gia", new BigDecimal("180000"), "Súp kem nấm Truffle dùng kèm bánh mì giòn tỏi tây thượng hạng.", "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80", new BigDecimal("10"), soupSaladCat));
        dishes.add(saveDish("Salad Caesar Gà Nướng", new BigDecimal("160000"), "Salad romaine tươi, ức gà nướng, bánh mì giòn & phô mai Parmesan.", "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, soupSaladCat));
        dishes.add(saveDish("Salad Bò Nướng Thái", new BigDecimal("190000"), "Salad bò Mỹ nướng chín vừa sốt chua cay thảo mộc thanh mát.", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, soupSaladCat));
        dishes.add(saveDish("Súp Hải Sản Bouillabaisse", new BigDecimal("260000"), "Súp hải sản Pháp hầm từ tôm, mực, cá tuyết & nghệ tây.", "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, soupSaladCat));

        // --- KHAI VỊ (APPETIZER) ---
        dishes.add(saveDish("Salmon Carpaccio", new BigDecimal("240000"), "Cá hồi Na Uy thái mỏng ướp chanh ngâm dầu ô liu & hạt caper.", "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, appetizerCat));
        dishes.add(saveDish("Gan Ngỗng Áp Chảo Foie Gras", new BigDecimal("350000"), "Gan ngỗng Pháp áp chảo sốt quả mâm xôi & bánh mì Brioche.", "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", new BigDecimal("15"), appetizerCat));
        dishes.add(saveDish("Truffle Fries Phô Mai", new BigDecimal("130000"), "Khoai tây chiên giòn sốt nấm Truffle & phô mai bào mịn.", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80", new BigDecimal("5"), appetizerCat));
        dishes.add(saveDish("Tartare Bò Mỹ Thượng Hạng", new BigDecimal("280000"), "Bò Mỹ tươi băm nhỏ ngâm lòng đỏ trứng gà ta & gia vị Pháp.", "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, appetizerCat));

        // --- TRÁNG MIỆNG (DESSERT) ---
        dishes.add(saveDish("Crème Brûlée Truyền Thống", new BigDecimal("140000"), "Bánh kem trứng nướng đường cháy caramen giòn kiểu Pháp.", "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, dessertCat));
        dishes.add(saveDish("Chocolate Lava Cake", new BigDecimal("160000"), "Bánh sô-cô-la nướng nóng nhân nham thạch chảy ăn kèm kem tươi.", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80", new BigDecimal("10"), dessertCat));
        dishes.add(saveDish("Tiramisu Ý Thượng Hạng", new BigDecimal("150000"), "Bánh Tiramisu phô mai Mascarpone ngâm cà phê Espresso & Kahlua.", "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, dessertCat));
        dishes.add(saveDish("Bánh Tart Chanh Vàng", new BigDecimal("135000"), "Bánh tart chanh tươi ngâm mật ong bọc lớp kem trứng nướng.", "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, dessertCat));
        dishes.add(saveDish("Macaron Collection 6 Vị", new BigDecimal("180000"), "Bộ sưu tập bánh Macaron Pháp 6 hương vị tinh tế chọn lọc.", "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80", new BigDecimal("15"), dessertCat));
        dishes.add(saveDish("Panna Cotta Sốt Dâu Tây", new BigDecimal("125000"), "Kem Ý Panna Cotta mềm mịn phủ sốt mâm xôi & dâu tây tươi.", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, dessertCat));
        dishes.add(saveDish("Bánh Phô Mai Basque Burnt", new BigDecimal("145000"), "Cheesecake nướng cháy kiểu Tây Ban Nha béo ngậy thơm lừng.", "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, dessertCat));
        dishes.add(saveDish("Kem Gelato Ý Đủ Vị", new BigDecimal("110000"), "3 viên kem Gelato tự chọn (Pistachio, Salted Caramel, Dark Choco).", "https://images.unsplash.com/photo-1560008511-11c63416e52d?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, dessertCat));
        dishes.add(saveDish("Bánh Mille-Feuille Ngàn Lớp", new BigDecimal("155000"), "Bánh bột ngàn lớp giòn rụm kẹp kem vani Bourbon Madagascar.", "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, dessertCat));
        dishes.add(saveDish("Bánh Soufflé Vani Nướng Nóng", new BigDecimal("165000"), "Bánh Soufflé nở xốp bồng bềnh nướng tươi tại chỗ kèm sốt sô-cô-la.", "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80", new BigDecimal("10"), dessertCat));

        // --- ĐỒ UỐNG (DRINK) ---
        dishes.add(saveDish("Vang Đỏ Bordeaux Grand Cru", new BigDecimal("1250000"), "Vang đỏ cao cấp nhập khẩu nguyên chai từ vùng Bordeaux Pháp.", "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80", new BigDecimal("10"), drinkCat));
        dishes.add(saveDish("Vang Trắng Sauvignon Blanc", new BigDecimal("850000"), "Vang trắng New Zealand hương hoa quả nhiệt đới tươi mát.", "https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, drinkCat));
        dishes.add(saveDish("Champagne Dom Pérignon", new BigDecimal("4500000"), "Sâm-panh Pháp sang trọng chuyên dùng cho các bữa tiệc Fine Dining.", "https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=600&q=80", new BigDecimal("5"), drinkCat));
        dishes.add(saveDish("Cocktail L'ÉCLAT Signature", new BigDecimal("220000"), "Cocktail độc quyền pha chế từ Gin, syrup hoa hồng & chanh ngâm.", "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, drinkCat));
        dishes.add(saveDish("Classic Mojito Bạc Hà", new BigDecimal("140000"), "Rượu Rum trắng pha chanh tươi, bạc hà & soda mát lạnh sảng khoái.", "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, drinkCat));
        dishes.add(saveDish("Cà Phê Espresso Ý", new BigDecimal("75000"), "Cà phê chiết xuất đậm đà hạt Arabica nướng nguyên chất.", "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, drinkCat));
        dishes.add(saveDish("Trà Earl Grey Hoàng Gia", new BigDecimal("85000"), "Trà đen Anh Quốc ướp hương cam Bergamot dùng kèm mật ong.", "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, drinkCat));
        dishes.add(saveDish("Nước Ép Trái Cây Nguyên Chất", new BigDecimal("95000"), "Nước ép tươi ngâm lạnh (Cam vàng, Táo xanh, Dưa hấu, Chanh dây).", "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, drinkCat));
        dishes.add(saveDish("Mocktail Tropic Sunset", new BigDecimal("130000"), "Đồ uống không cồn kết hợp xoài, dâu tây & soda sủi bọt thanh mát.", "https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, drinkCat));
        dishes.add(saveDish("Nước Khoáng San Pellegrino 750ml", new BigDecimal("120000"), "Nước khoáng có ga tự nhiên đóng chai thủy tinh nhập từ Ý.", "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80", BigDecimal.ZERO, drinkCat));
            
        log.info("40 dishes seeded/synced successfully.");

        // 4. Seed & Sync Ingredients (20 sample items covering fine dining meats, seafood, dairy, produce & spices)
        log.info("Seeding/Syncing 20 ingredients with full categories and attributes for Inventory Management...");
        LocalDate todayDate = LocalDate.now();
        saveIngredient("ING-001", "Thịt Thăn Bò Mỹ Wagyu A5", "Thịt & Hải sản", 18.5, 5.0, "kg", new BigDecimal("850000"), "Paris Food Co.", "Kho đông Tầng 1 (Khay A-01)", todayDate.plusDays(12), "Thăn bò Wagyu nhập khẩu Nhật/Mỹ");
        saveIngredient("ING-002", "Thịt Bò Úc Black Angus Ribeye", "Thịt & Hải sản", 25.0, 8.0, "kg", new BigDecimal("450000"), "Paris Food Co.", "Kho đông Tầng 1 (Khay A-02)", todayDate.plusDays(15), "Thịt bò Úc tươi bảo quản mát");
        saveIngredient("ING-003", "Cá Hồi Na Uy Tươi Nhập Khẩu", "Thịt & Hải sản", 14.0, 6.0, "kg", new BigDecimal("380000"), "Fresh Farm Produce", "Kho đông Tầng 1 (Bể mát)", todayDate.plusDays(4), "Cá hồi phi lê tươi nguyên con");
        saveIngredient("ING-004", "Tôm Hùm Alaska Nhập Khẩu", "Thịt & Hải sản", 3.0, 10.0, "kg", new BigDecimal("1200000"), "Fresh Farm Produce", "Kho đông Tầng 1 (Tủ đông 2)", todayDate.plusDays(5), "Tôm hùm Alaska nguyên con - Cần nhập thêm");
        saveIngredient("ING-005", "Ức Vịt Pháp Sốt Cam", "Thịt & Hải sản", 12.0, 4.0, "kg", new BigDecimal("280000"), "Paris Food Co.", "Kho đông Tầng 1 (Khay B-01)", todayDate.plusDays(8), "Ức vịt Pháp chăn nuôi thả vườn");
        saveIngredient("ING-006", "Sườn Cừu New Zealand", "Thịt & Hải sản", 9.0, 5.0, "kg", new BigDecimal("520000"), "Paris Food Co.", "Kho đông Tầng 1 (Khay B-02)", todayDate.plusDays(10), "Sườn cừu cắt thanh tiêu chuẩn Fine Dining");
        saveIngredient("ING-007", "Nấm Truffle Đen Ý Premium", "Rau củ & Gia vị", 0.2, 0.5, "kg", new BigDecimal("35000000"), "Paris Food Co.", "Kệ mát bảo quản cao cấp", todayDate.minusDays(1), "Nấm Truffle đen nhập trực tiếp từ Ý");
        saveIngredient("ING-008", "Bơ Lạt Thụy Sĩ Président", "Bơ sữa & Phô mai", 15.0, 5.0, "kg", new BigDecimal("160000"), "Fresh Farm Produce", "Tủ mát chế biến Tầng 1", todayDate.plusDays(25), "Bơ lạt nướng bánh và chế biến sốt");
        saveIngredient("ING-009", "Phô Mai Mozzarella Ý", "Bơ sữa & Phô mai", 8.0, 4.0, "kg", new BigDecimal("220000"), "Fresh Farm Produce", "Tủ mát chế biến Tầng 1", todayDate.plusDays(14), "Phô mai kéo sợi cao cấp");
        saveIngredient("ING-010", "Kem Tươi Anchor Fresh Cream", "Bơ sữa & Phô mai", 4.0, 10.0, "liters", new BigDecimal("110000"), "Fresh Farm Produce", "Tủ mát chế biến Tầng 1", todayDate.minusDays(2), "Kem tươi dùng cho tráng miệng & súp");
        saveIngredient("ING-011", "Dầu Oliu Extra Virgin Borghes", "Rau củ & Gia vị", 30.0, 10.0, "liters", new BigDecimal("240000"), "Paris Food Co.", "Kho khô Tầng 1 (Kệ C-01)", todayDate.plusDays(120), "Dầu Oliu ép lạnh nguyên chất");
        saveIngredient("ING-012", "Mì Ý Barilla Spaghetti", "Nông sản & Thô", 45.0, 15.0, "kg", new BigDecimal("65000"), "Paris Food Co.", "Kho khô Tầng 1 (Kệ C-02)", todayDate.plusDays(180), "Mì Ý Barilla sợi số 5");
        saveIngredient("ING-013", "Gạo Nhật Koshihikari Premium", "Nông sản & Thô", 80.0, 20.0, "kg", new BigDecimal("95000"), "Fresh Farm Produce", "Kho khô Tầng 1 (Kệ C-03)", todayDate.plusDays(90), "Gạo Nhật dẻo thơm chuyên nấu cơm bento & sushi");
        saveIngredient("ING-014", "Rượu Vang Đỏ Bordeaux Grand Cru", "Đồ uống & Vang", 24.0, 6.0, "bottles", new BigDecimal("850000"), "Paris Food Co.", "Tủ bảo quản Vang Tầng 2", todayDate.plusDays(365), "Vang đỏ nguyên chai nhập khẩu Pháp");
        saveIngredient("ING-015", "Rượu Rum Trắng Bacardi Superior", "Đồ uống & Vang", 12.0, 4.0, "bottles", new BigDecimal("320000"), "Paris Food Co.", "Quầy pha chế Bar Tầng 1", todayDate.plusDays(365), "Rượu Rum trắng chuyên pha Mojito & Cocktail");
        saveIngredient("ING-016", "Trứng Gà Hữu Cơ OMEGA-3", "Nông sản & Thô", 150.0, 50.0, "pieces", new BigDecimal("4500"), "Fresh Farm Produce", "Tủ mát nguyên liệu tươi", todayDate.plusDays(10), "Trứng gà hữu cơ sạch đạt chuẩn OMEGA-3");
        saveIngredient("ING-017", "Rau Xà Lách Romain Đà Lạt", "Rau củ & Gia vị", 2.0, 8.0, "kg", new BigDecimal("35000"), "Fresh Farm Produce", "Tủ mát rau củ quả", todayDate.plusDays(3), "Rau xà lách tươi hái trong ngày");
        saveIngredient("ING-018", "Cà Rốt Hữu Cơ Đà Lạt", "Rau củ & Gia vị", 18.0, 5.0, "kg", new BigDecimal("25000"), "Fresh Farm Produce", "Kho rau củ quả Tầng 1", todayDate.plusDays(7), "Cà rốt hữu cơ dùng trang trí & nấu súp");
        saveIngredient("ING-019", "Tỏi Lý Sơn Ngâm Chua Ngọt", "Rau củ & Gia vị", 6.0, 2.0, "kg", new BigDecimal("120000"), "Fresh Farm Produce", "Kho khô Tầng 1 (Kệ D-01)", todayDate.plusDays(45), "Tỏi cô đơn Lý Sơn đặc sản");
        saveIngredient("ING-020", "Muối Biển Pink Himalaya", "Rau củ & Gia vị", 12.0, 3.0, "kg", new BigDecimal("85000"), "Paris Food Co.", "Kho khô Tầng 1 (Kệ D-02)", todayDate.plusDays(500), "Muối hồng Himalaya tinh khiết");
        log.info("20 ingredients seeded & synced successfully.");

        // 4.1 Seed Dish Recipes
        if (dishRecipeRepository.count() == 0) {
            Ingredient wagyu = ingredientRepository.findByName("Thịt Thăn Bò Mỹ Wagyu A5").orElse(null);
            Ingredient truffle = ingredientRepository.findByName("Nấm Truffle Đen Ý Premium").orElse(null);
            Ingredient butter = ingredientRepository.findByName("Bơ Lạt Thụy Sĩ Président").orElse(null);
            Ingredient salmon = ingredientRepository.findByName("Cá Hồi Na Uy Tươi Nhập Khẩu").orElse(null);
            Ingredient lettuce = ingredientRepository.findByName("Rau Xà Lách Romain Đà Lạt").orElse(null);
            
            Dish steakDish = dishRepository.findAll().stream().filter(d -> d.getName().contains("Wagyu") || d.getName().contains("Bít Tết") || d.getName().contains("Bò")).findFirst().orElse(null);
            Dish salmonDish = dishRepository.findAll().stream().filter(d -> d.getName().contains("Hồi")).findFirst().orElse(null);

            if (steakDish != null && wagyu != null) {
                dishRecipeRepository.save(DishRecipe.builder().dish(steakDish).ingredient(wagyu).quantityRequired(0.250).unit("kg").build());
                if (truffle != null) dishRecipeRepository.save(DishRecipe.builder().dish(steakDish).ingredient(truffle).quantityRequired(0.015).unit("kg").build());
                if (butter != null) dishRecipeRepository.save(DishRecipe.builder().dish(steakDish).ingredient(butter).quantityRequired(0.030).unit("kg").build());
            }

            if (salmonDish != null && salmon != null) {
                dishRecipeRepository.save(DishRecipe.builder().dish(salmonDish).ingredient(salmon).quantityRequired(0.200).unit("kg").build());
                if (lettuce != null) dishRecipeRepository.save(DishRecipe.builder().dish(salmonDish).ingredient(lettuce).quantityRequired(0.050).unit("kg").build());
            }
            log.info("Dish recipes seeded.");
        }

        // 4.5 Seed Dining Tables (Covering all 7 statuses: AVAILABLE, RESERVED, OCCUPIED, DIRTY, CLEANING, MAINTENANCE, OUT_OF_SERVICE)
        DiningTable t101 = seedTableIfMissing("TBL-101", "Bàn 101", "Tầng 1 (Main Hall)", 2, "Thường", "Gần lối đi chính", "Nguyễn Văn A (Bồi bàn)", "Lê Nhất Linh - 0987654321", null, null, "OCCUPIED");
        DiningTable t102 = seedTableIfMissing("TBL-102", "Bàn 102", "Tầng 1 (Main Hall)", 4, "Thường", "Gần cửa sổ lớn", null, "Trần Thị Minh B - 0912345678", "2026-07-23 19:30", "Khách yêu cầu nến sinh nhật", "RESERVED");
        DiningTable t103 = seedTableIfMissing("TBL-103", "Bàn 103", "Tầng 1 (Main Hall)", 6, "Thường", "Bàn sofa giữa sảnh", null, null, null, null, "AVAILABLE");
        DiningTable t104 = seedTableIfMissing("TBL-104", "Bàn 104", "Tầng 1 (Main Hall)", 4, "Thường", "Gần quầy pha chế", null, null, null, null, "DIRTY");
        DiningTable t105 = seedTableIfMissing("TBL-105", "Bàn 105", "Tầng 1 (Main Hall)", 2, "Thường", "Bàn đôi riêng tư", "Hoàng Kim - Vệ sinh", null, null, null, "CLEANING");

        DiningTable t201 = seedTableIfMissing("TBL-201", "Bàn 201", "Tầng 2 (Sân thượng)", 4, "Ngoài trời", "View nhìn ra sông thành phố", "Phạm Quốc C (Waiter)", "Đoàn Anh Tuấn - 0933445566", null, null, "OCCUPIED");
        DiningTable t202 = seedTableIfMissing("TBL-202", "Bàn 202", "Tầng 2 (Sân thượng)", 2, "Ngoài trời", "Bàn góc lãng mạn", null, null, null, null, "AVAILABLE");
        DiningTable t203 = seedTableIfMissing("TBL-203", "Bàn 203", "Tầng 2 (Sân thượng)", 8, "Ngoài trời", "Bàn tròn lớn ngắm cảnh", null, "Vũ Thanh Hằng - 0909887766", "2026-07-23 20:00", "Đặt tiệc kỷ niệm ngày cưới", "RESERVED");

        DiningTable t301 = seedTableIfMissing("VIP-301", "Bàn VIP 301", "Phòng VIP 1", 8, "Phòng riêng", "Phòng có máy chiếu & Karaoke", null, null, null, null, "AVAILABLE");
        DiningTable t302 = seedTableIfMissing("VIP-302", "Bàn VIP 302", "Phòng VIP 1", 12, "Phòng riêng", "Bảo trì máy lạnh phòng VIP", null, null, null, null, "MAINTENANCE");
        DiningTable t303 = seedTableIfMissing("VIP-303", "Bàn VIP 303", "Phòng VIP 1", 10, "Phòng riêng", "Tiệc đối tác doanh nghiệp", "Trần Đức Nam (VIP Staff)", "Công ty Công nghệ PTIT", null, "Trang trí hoa hồng đỏ", "OCCUPIED");

        DiningTable t401 = seedTableIfMissing("GARDEN-401", "Bàn Sân Vườn 401", "Khu Sân Vườn", 4, "Ngoài trời", "Tạm khóa do trời mưa", null, null, null, null, "OUT_OF_SERVICE");
        DiningTable t402 = seedTableIfMissing("GARDEN-402", "Bàn Sân Vườn 402", "Khu Sân Vườn", 6, "Ngoài trời", "Bàn dưới bóng cây cổ thụ", null, null, null, null, "AVAILABLE");
        log.info("13 Dining tables seeded with all 7 statuses and full attributes.");

        // 4.6 Seed Reservations
        if (reservationRepository.count() == 0) {
            LocalDateTime nowTime = LocalDateTime.now();
            reservationRepository.save(Reservation.builder()
                    .customerName("John Doe")
                    .customerPhone("0901234567")
                    .customerEmail("john@example.com")
                    .numberOfPeople(4)
                    .reservationTime(nowTime.plusHours(2))
                    .diningTable(t102)
                    .status("APPROVED")
                    .notes("Customer requested near window")
                    .build());

            reservationRepository.save(Reservation.builder()
                    .customerName("Jane Smith")
                    .customerPhone("0911234567")
                    .customerEmail("jane@example.com")
                    .numberOfPeople(2)
                    .reservationTime(nowTime.plusHours(4))
                    .diningTable(null)
                    .status("PENDING")
                    .notes("First time visitor")
                    .build());

            reservationRepository.save(Reservation.builder()
                    .customerName("Alice Johnson")
                    .customerPhone("0921234567")
                    .customerEmail("alice@example.com")
                    .numberOfPeople(6)
                    .reservationTime(nowTime.minusDays(1).withHour(19).withMinute(0))
                    .diningTable(t103)
                    .status("CHECKED_OUT")
                    .notes("Anniversary dinner")
                    .build());
            log.info("Reservations seeded.");
        }

        // 4.6.5 Clean up any old dummy sample orders without order items
        List<Order> oldOrders = orderRepository.findAll();
        for (Order o : oldOrders) {
            if (orderItemRepository.findByOrderId(o.getId()).isEmpty()) {
                invoiceRepository.findByOrderId(o.getId()).ifPresent(inv -> invoiceRepository.delete(inv));
                orderRepository.delete(o);
            }
        }

        // 4.6.6 Seed Staff Notifications
        if (staffNotificationRepository.count() == 0) {
            log.info("Seeding initial staff notifications...");
            staffNotificationRepository.save(com.example.restaurant.entity.StaffNotification.builder()
                    .title("Khẩn cấp - Chuẩn bị họp giao ca 14h00 tại sảnh chính")
                    .message("Yêu cầu toàn bộ nhân viên ca sáng và ca chiều tập trung tại sảnh chính lúc 14h00 để họp giao ban ca và rà soát doanh thu.")
                    .targetRole("ALL")
                    .senderName("Trần Hoàng Nam (Quản Lý)")
                    .senderRole("ROLE_MANAGER")
                    .urgent(true)
                    .isRead(false)
                    .isConfirmed(false)
                    .createdAt(LocalDateTime.now().minusHours(2))
                    .build());

            staffNotificationRepository.save(com.example.restaurant.entity.StaffNotification.builder()
                    .title("Bảo trì hệ thống thanh toán QR MoMo từ 23:00 - 01:00")
                    .message("Cổng thanh toán QR MoMo sẽ tạm thời bảo trì để nâng cấp bảo mật. Vui lòng chuyển hướng khách hàng sang thanh toán VNPay hoặc Thẻ POS.")
                    .targetRole("ROLE_CASHIER")
                    .senderName("Trần Hoàng Nam (Quản Lý)")
                    .senderRole("ROLE_MANAGER")
                    .urgent(false)
                    .isRead(true)
                    .isConfirmed(true)
                    .confirmedByName("Nguyễn Văn Thu Ngân (Thu Ngân)")
                    .confirmedByEmail("cashier@restaurant.com")
                    .confirmedAt(LocalDateTime.now().minusHours(1))
                    .createdAt(LocalDateTime.now().minusHours(3))
                    .build());

            log.info("Staff notifications seeded.");
        }

        // 4.7 Seed Suppliers
        Supplier supplier1 = null;
        if (supplierRepository.count() == 0) {
            supplier1 = supplierRepository.save(Supplier.builder()
                    .company("Paris Food Co.")
                    .phone("0909111222")
                    .email("contact@parisfood.com")
                    .address("12 Rue de la Paix, Paris")
                    .build());
            supplierRepository.save(Supplier.builder()
                    .company("Fresh Farm Produce")
                    .phone("0918222333")
                    .email("sales@freshfarm.vn")
                    .address("Da Lat, Lam Dong")
                    .build());
            log.info("Suppliers seeded.");
        } else {
            supplier1 = supplierRepository.findAll().get(0);
        }

        // 4.8 Seed Purchase Orders
        if (purchaseOrderRepository.count() == 0 && supplier1 != null) {
            Ingredient beef = ingredientRepository.findAll().stream().filter(i -> i.getName().equals("Beef Tenderloin")).findFirst().orElse(null);
            Ingredient salmon = ingredientRepository.findAll().stream().filter(i -> i.getName().equals("Atlantic Salmon")).findFirst().orElse(null);
            
            if (beef != null && salmon != null) {
                PurchaseOrder po = PurchaseOrder.builder()
                        .supplier(supplier1)
                        .orderDate(LocalDateTime.now().minusDays(3))
                        .status("DELIVERED")
                        .totalAmount(new BigDecimal("930.00"))
                        .items(new ArrayList<>())
                        .build();
                po = purchaseOrderRepository.save(po);

                PurchaseOrderItem item1 = PurchaseOrderItem.builder()
                        .purchaseOrder(po)
                        .ingredient(beef)
                        .quantity(10.0)
                        .price(new BigDecimal("45.00"))
                        .build();
                PurchaseOrderItem item2 = PurchaseOrderItem.builder()
                        .purchaseOrder(po)
                        .ingredient(salmon)
                        .quantity(20.0)
                        .price(new BigDecimal("24.00"))
                        .build();
                purchaseOrderItemRepository.save(item1);
                purchaseOrderItemRepository.save(item2);
                po.getItems().add(item1);
                po.getItems().add(item2);
                purchaseOrderRepository.save(po);

                // Seed inventory transaction history
                inventoryTransactionRepository.save(InventoryTransaction.builder()
                        .ingredient(beef)
                        .type("STOCK_IN")
                        .quantity(10.0)
                        .transactionDate(LocalDateTime.now().minusDays(3))
                        .expiryDate(LocalDate.now().plusDays(10))
                        .note("Nhập kho tự động từ Đơn mua hàng PO-" + po.getId())
                        .build());
                inventoryTransactionRepository.save(InventoryTransaction.builder()
                        .ingredient(salmon)
                        .type("STOCK_IN")
                        .quantity(20.0)
                        .transactionDate(LocalDateTime.now().minusDays(3))
                        .expiryDate(LocalDate.now().plusDays(5))
                        .note("Nhập kho tự động từ Đơn mua hàng PO-" + po.getId())
                        .build());

                // Seed a pending Purchase Order
                PurchaseOrder poPending = PurchaseOrder.builder()
                        .supplier(supplier1)
                        .orderDate(LocalDateTime.now().minusHours(4))
                        .status("PENDING")
                        .totalAmount(new BigDecimal("450.00"))
                        .items(new ArrayList<>())
                        .build();
                poPending = purchaseOrderRepository.save(poPending);
                PurchaseOrderItem itemPending = PurchaseOrderItem.builder()
                        .purchaseOrder(poPending)
                        .ingredient(beef)
                        .quantity(10.0)
                        .price(new BigDecimal("45.00"))
                        .build();
                purchaseOrderItemRepository.save(itemPending);
                poPending.getItems().add(itemPending);
                purchaseOrderRepository.save(poPending);
            }
            log.info("Purchase orders seeded.");
        }

        // 4.9 Seed Customers
        if (customerRepository.count() == 0) {
            customerRepository.save(Customer.builder()
                    .fullName("Alex Mercer")
                    .phone("0987654321")
                    .email("alex@mercer.com")
                    .membership(true)
                    .points(650)
                    .rank("GOLD")
                    .build());
            customerRepository.save(Customer.builder()
                    .fullName("Bruce Wayne")
                    .phone("0909090909")
                    .email("bruce@waynecorp.com")
                    .membership(true)
                    .points(2500)
                    .rank("DIAMOND")
                    .build());
            customerRepository.save(Customer.builder()
                    .fullName("Clark Kent")
                    .phone("0912121212")
                    .email("clark@dailyplanet.com")
                    .membership(false)
                    .points(50)
                    .rank("MEMBER")
                    .build());
            log.info("Customers seeded.");
        }

        // 4.10 Seed Promotions & Vouchers
        if (promotionRepository.count() == 0) {
            LocalDateTime nowTime = LocalDateTime.now();
            promotionRepository.save(Promotion.builder()
                    .code("WELCOME10")
                    .description("Giảm 10% cho khách hàng lần đầu dùng bữa tại L'Étoile")
                    .discountType("PERCENTAGE")
                    .discountValue(new BigDecimal("10.00"))
                    .minOrderValue(new BigDecimal("50.00"))
                    .maxDiscountAmount(new BigDecimal("20.00"))
                    .usageLimit(100)
                    .usedCount(12)
                    .startDate(nowTime.minusDays(10))
                    .endDate(nowTime.plusDays(60))
                    .status("ACTIVE")
                    .build());

            promotionRepository.save(Promotion.builder()
                    .code("GOLDVIP50")
                    .description("Voucher quà tặng 50 USD cho thành viên hạng GOLD & DIAMOND")
                    .discountType("FIXED_AMOUNT")
                    .discountValue(new BigDecimal("50.00"))
                    .minOrderValue(new BigDecimal("200.00"))
                    .usageLimit(50)
                    .usedCount(8)
                    .startDate(nowTime.minusDays(5))
                    .endDate(nowTime.plusDays(30))
                    .status("ACTIVE")
                    .build());

            promotionRepository.save(Promotion.builder()
                    .code("SUMMER2025")
                    .description("Chương trình khuyến mãi hè 15% tất cả hóa đơn")
                    .discountType("PERCENTAGE")
                    .discountValue(new BigDecimal("15.00"))
                    .minOrderValue(new BigDecimal("30.00"))
                    .usageLimit(200)
                    .usedCount(200)
                    .startDate(nowTime.minusDays(60))
                    .endDate(nowTime.minusDays(5))
                    .status("EXPIRED")
                    .build());

            log.info("Promotions & Vouchers seeded.");
        }

        // 4.11 Seed Customer Reviews & Testimonials
        if (customerReviewRepository.count() == 0) {
            customerReviewRepository.save(CustomerReview.builder()
                    .customerName("Ông Nguyễn Văn Hoàng")
                    .avatar("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80")
                    .rating(5)
                    .comment("Bữa tối tuyệt vời nhất tôi từng thưởng thức tại Hà Nội. Món Filet Mignon mềm tan trong miệng, rượu vang Pháp kết hợp hoàn hảo và phong cách phục vụ của nhân viên đạt chuẩn 5 sao!")
                    .featured(true)
                    .build());

            customerReviewRepository.save(CustomerReview.builder()
                    .customerName("Bà Sophie Laurent")
                    .avatar("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80")
                    .rating(5)
                    .comment("L'Étoile mang lại cho tôi cảm giác như đang dùng bữa tại một nhà hàng cao cấp ngay giữa lòng Paris. Không gian ấm cúng, sang trọng và nhạc nền rất tinh tế.")
                    .featured(true)
                    .build());

            customerReviewRepository.save(CustomerReview.builder()
                    .customerName("Anh Trần Minh Tuấn")
                    .avatar("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80")
                    .rating(5)
                    .comment("Tối qua tôi đã đặt bàn VIP tổ chức kỷ niệm ngày cưới tại L'Étoile. Vợ tôi cực kỳ ấn tượng với cách trang trí nến và món Lobster Thermidor thơm ngậy. Chắc chắn sẽ quay lại!")
                    .featured(true)
                    .build());

            log.info("Customer reviews seeded.");
        }

        // 5. Seed Orders (spread across past 6 months to construct mock visual charts)
        if (orderRepository.count() == 0 && !dishes.isEmpty() && customer1 != null && customer2 != null) {
            log.info("Seeding order history...");
            LocalDateTime now = LocalDateTime.now();
            Random rand = new Random();
            List<DiningTable> allTables = diningTableRepository.findAll();

            // Populate monthly records for the past 6 months
            for (int i = 5; i >= 0; i--) {
                LocalDateTime monthTime = now.minusMonths(i);
                int year = monthTime.getYear();
                int month = monthTime.getMonthValue();
                
                // Determine baseline target revenue per month
                int targetRevenue = switch (i) {
                    case 5 -> 4200; // 5 months ago
                    case 4 -> 5100; // 4 months ago
                    case 3 -> 6300; // 3 months ago
                    case 2 -> 5800; // 2 months ago
                    case 1 -> 7200; // 1 month ago
                    case 0 -> 9400; // Current month
                    default -> 3000;
                };

                // Generate orders to reach approximate target revenue
                int currentSum = 0;
                while (currentSum < targetRevenue) {
                    // Random customer
                    User customer = rand.nextBoolean() ? customer1 : customer2;
                    
                    // Random date within that month
                    int day = rand.nextInt(27) + 1; // avoid calendar overflow
                    int hour = rand.nextInt(12) + 11; // dining hours 11:00 - 22:00
                    LocalDateTime orderDate = LocalDateTime.of(year, month, day, hour, 0);
                    
                    // Don't generate future orders
                    if (orderDate.isAfter(now)) {
                        break;
                    }

                    DiningTable orderTable = allTables.get(rand.nextInt(allTables.size()));

                    // Create Order
                    Order order = Order.builder()
                            .customer(customer)
                            .orderDate(orderDate)
                            .status("COMPLETED")
                            .totalAmount(BigDecimal.ZERO)
                            .diningTable(orderTable)
                            .build();
                    order = orderRepository.save(order);

                    // Add items
                    BigDecimal orderSum = BigDecimal.ZERO;
                    int itemCount = rand.nextInt(3) + 1; // 1 to 3 items
                    for (int k = 0; k < itemCount; k++) {
                        Dish dish = dishes.get(rand.nextInt(dishes.size()));
                        int qty = rand.nextInt(2) + 1; // 1 or 2
                        BigDecimal price = dish.getPrice();
                        BigDecimal lineTotal = price.multiply(new BigDecimal(qty));
                        orderSum = orderSum.add(lineTotal);

                        OrderItem item = OrderItem.builder()
                                .order(order)
                                .dish(dish)
                                .quantity(qty)
                                .price(price)
                                .cookingStatus("COMPLETED")
                                .build();
                        orderItemRepository.save(item);
                    }

                    order.setTotalAmount(orderSum);
                    orderRepository.save(order);

                    currentSum += orderSum.intValue();
                }
            }

            // Seed active orders for today (e.g. IN_SERVICE)
            // Active order 1 at Table 101 (Occupied)
            Order activeOrder1 = Order.builder()
                    .customer(customer1)
                    .orderDate(now.minusHours(1))
                    .status("IN_SERVICE")
                    .totalAmount(new BigDecimal("70.00"))
                    .diningTable(t101)
                    .build();
            activeOrder1 = orderRepository.save(activeOrder1);
            
            orderItemRepository.save(OrderItem.builder()
                    .order(activeOrder1)
                    .dish(dishes.stream().filter(d -> d.getName().equals("Filet Mignon")).findFirst().orElse(dishes.get(0)))
                    .quantity(1)
                    .price(new BigDecimal("45.00"))
                    .cookingStatus("COOKING")
                    .build());
            
            orderItemRepository.save(OrderItem.builder()
                    .order(activeOrder1)
                    .dish(dishes.stream().filter(d -> d.getName().contains("Bordeaux")).findFirst().orElse(dishes.get(8)))
                    .quantity(1)
                    .price(new BigDecimal("25.00"))
                    .cookingStatus("COMPLETED")
                    .build());

            // Active order 2 at Table 201 (Occupied)
            Order activeOrder2 = Order.builder()
                    .customer(customer2)
                    .orderDate(now.minusMinutes(30))
                    .status("IN_SERVICE")
                    .totalAmount(new BigDecimal("46.00"))
                    .diningTable(t201)
                    .build();
            activeOrder2 = orderRepository.save(activeOrder2);

            orderItemRepository.save(OrderItem.builder()
                    .order(activeOrder2)
                    .dish(dishes.stream().filter(d -> d.getName().equals("Caesar Salad")).findFirst().orElse(dishes.get(4)))
                    .quantity(2)
                    .price(new BigDecimal("15.00"))
                    .cookingStatus("PENDING")
                    .build());

            orderItemRepository.save(OrderItem.builder()
                    .order(activeOrder2)
                    .dish(dishes.stream().filter(d -> d.getName().equals("Chocolate Fondant")).findFirst().orElse(dishes.get(7)))
                    .quantity(1)
                    .price(new BigDecimal("16.00"))
                    .cookingStatus("READY")
                    .build());

            // Active Order PENDING
            Order pendingOrder = Order.builder()
                    .customer(customer1)
                    .orderDate(now.minusMinutes(10))
                    .status("PENDING")
                    .totalAmount(new BigDecimal("48.00"))
                    .diningTable(t101)
                    .build();
            pendingOrder = orderRepository.save(pendingOrder);
            orderItemRepository.save(OrderItem.builder()
                    .order(pendingOrder)
                    .dish(dishes.get(0))
                    .quantity(1)
                    .price(new BigDecimal("48.00"))
                    .cookingStatus("PENDING")
                    .build());

            // Active Order COOKING
            Order cookingOrder = Order.builder()
                    .customer(customer2)
                    .orderDate(now.minusMinutes(20))
                    .status("COOKING")
                    .totalAmount(new BigDecimal("36.00"))
                    .diningTable(t201)
                    .build();
            cookingOrder = orderRepository.save(cookingOrder);
            orderItemRepository.save(OrderItem.builder()
                    .order(cookingOrder)
                    .dish(dishes.get(1))
                    .quantity(1)
                    .price(new BigDecimal("36.00"))
                    .cookingStatus("COOKING")
                    .build());

            // Active Order READY
            Order readyOrder = Order.builder()
                    .customer(customer1)
                    .orderDate(now.minusMinutes(15))
                    .status("READY")
                    .totalAmount(new BigDecimal("22.00"))
                    .diningTable(t101)
                    .build();
            readyOrder = orderRepository.save(readyOrder);
            orderItemRepository.save(OrderItem.builder()
                    .order(readyOrder)
                    .dish(dishes.get(3))
                    .quantity(1)
                    .price(new BigDecimal("22.00"))
                    .cookingStatus("READY")
                    .build());

            // Active Order CANCELLED
            Order cancelledOrder = Order.builder()
                    .customer(customer2)
                    .orderDate(now.minusHours(2))
                    .status("CANCELLED")
                    .totalAmount(new BigDecimal("15.00"))
                    .diningTable(t201)
                    .build();
            cancelledOrder = orderRepository.save(cancelledOrder);
            orderItemRepository.save(OrderItem.builder()
                    .order(cancelledOrder)
                    .dish(dishes.get(4))
                    .quantity(1)
                    .price(new BigDecimal("15.00"))
                    .cookingStatus("CANCELLED")
                    .build());

            log.info("Historical and active orders seeded successfully.");
        }
    }

    private Role seedRoleIfMissing(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(Role.builder().name(name).build()));
    }

    private Permission seedPermissionIfMissing(String name, String description) {
        return permissionRepository.findByName(name)
                .orElseGet(() -> permissionRepository.save(Permission.builder().name(name).description(description).build()));
    }

    private Dish saveDish(String name, BigDecimal price, String description, String image, BigDecimal discount, Category category) {
        return dishRepository.findByName(name)
                .map(d -> {
                    if (category != null && (d.getCategory() == null || !d.getCategory().getId().equals(category.getId()))) {
                        d.setCategory(category);
                        return dishRepository.save(d);
                    }
                    return d;
                })
                .orElseGet(() -> dishRepository.save(Dish.builder()
                        .name(name)
                        .price(price)
                        .description(description)
                        .image(image)
                        .discount(discount != null ? discount : BigDecimal.ZERO)
                        .category(category)
                        .status("ACTIVE")
                        .available(true)
                        .build()));
    }

    private Category seedCategoryIfMissing(String name, String description, String image) {
        return categoryRepository.findByName(name)
                .map(cat -> {
                    if (cat.getCreatedAt() == null) {
                        cat.setCreatedAt(LocalDateTime.now().minusDays((long)(Math.random() * 30 + 1)));
                    }
                    if (cat.getCreatedBy() == null) {
                        cat.setCreatedBy("Quản trị viên (Admin)");
                    }
                    if ((cat.getImage() == null || cat.getImage().isEmpty()) && image != null) {
                        cat.setImage(image);
                    }
                    return categoryRepository.save(cat);
                })
                .orElseGet(() -> categoryRepository.save(Category.builder()
                        .name(name)
                        .description(description)
                        .image(image)
                        .createdAt(LocalDateTime.now().minusDays((long)(Math.random() * 30 + 1)))
                        .createdBy("Quản trị viên (Admin)")
                        .build()));
    }

    private Ingredient saveIngredient(String code, String name, String category, Double qty, Double threshold, String unit, BigDecimal importPrice, String supplierName, String storageLocation, LocalDate expiryDate, String notes) {
        return ingredientRepository.findByName(name)
                .map(ing -> {
                    ing.setCode(code);
                    ing.setCategory(category);
                    ing.setImportPrice(importPrice);
                    ing.setSupplierName(supplierName);
                    ing.setStorageLocation(storageLocation);
                    ing.setNotes(notes);
                    return ingredientRepository.save(ing);
                })
                .orElseGet(() -> ingredientRepository.save(Ingredient.builder()
                        .code(code)
                        .name(name)
                        .category(category)
                        .stockQuantity(qty)
                        .minStockThreshold(threshold)
                        .unit(unit)
                        .importPrice(importPrice)
                        .supplierName(supplierName)
                        .storageLocation(storageLocation)
                        .expiryDate(expiryDate)
                        .notes(notes)
                        .build()));
    }

    private DiningTable seedTableIfMissing(String tableCode, String tableNumber, String area, Integer capacity, String tableType, String notes, String assignedStaff, String currentCustomer, String reservationTime, String specialRequests, String status) {
        return diningTableRepository.findByTableNumber(tableNumber)
                .map(t -> {
                    t.setTableCode(tableCode);
                    t.setTableType(tableType);
                    t.setNotes(notes);
                    t.setAssignedStaff(assignedStaff);
                    t.setCurrentCustomer(currentCustomer);
                    t.setReservationTime(reservationTime);
                    t.setSpecialRequests(specialRequests);
                    t.setStatus(status);
                    return diningTableRepository.save(t);
                })
                .orElseGet(() -> diningTableRepository.save(DiningTable.builder()
                        .tableCode(tableCode)
                        .tableNumber(tableNumber)
                        .area(area)
                        .capacity(capacity)
                        .tableType(tableType)
                        .notes(notes)
                        .assignedStaff(assignedStaff)
                        .currentCustomer(currentCustomer)
                        .reservationTime(reservationTime)
                        .specialRequests(specialRequests)
                        .status(status)
                        .build()));
    }
}
