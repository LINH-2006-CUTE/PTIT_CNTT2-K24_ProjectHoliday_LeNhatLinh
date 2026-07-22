# BẢNG BÁO GIÁ VÀ KẾ HOẠCH CHI PHÍ DỰ ÁN (PROJECT COST & EFFORT ESTIMATION)
## DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ HÀNG (RESTAURANT MANAGEMENT SYSTEM)

---

### THÔNG TIN DỰ ÁN

| Mục | Thông tin chi tiết |
| :--- | :--- |
| **Đơn vị thực hiện (Công ty)** | Bộ môn Công nghệ Phần mềm (CNPM) |
| **Tên dự án** | Restaurant Management System (RMS) |
| **Khách hàng** | CÔNG TY YYY |
| **Thời gian bắt đầu** | 08/07/2026 |
| **Thời gian hoàn thành** | 22/07/2026 |
| **Quy định thời gian làm việc** | Giờ hành chính từ Thứ 2 đến Thứ 6. Công việc rơi vào Thứ 7 & Chủ Nhật được tính là **OT (Overtime)** |
| **Lịch làm việc chi tiết** | - **Tuần 1**: 08/07 (T4), 09/07 (T5), 10/07 (T6)<br>- **Cuối tuần 1 (OT)**: 11/07 (T7), 12/07 (CN)<br>- **Tuần 2**: 13/07 (T2), 14/07 (T3), 15/07 (T4), 16/07 (T5), 17/07 (T6)<br>- **Cuối tuần 2 (OT)**: 18/07 (T7), 19/07 (CN)<br>- **Tuần 3**: 20/07 (T2), 21/07 (T3), 22/07 (T4) |

---

### DANH SÁCH NHÂN SỰ VÀ ĐƠN GIÁ NGÀY CÔNG (MANDAY RATE)

| STT | Họ và tên | Vai trò trong dự án | Đơn giá chuẩn (VNĐ/Manday) | Đơn giá OT (150% VNĐ/Manday) | Ghi chú |
| :---: | :--- | :--- | :---: | :---: | :--- |
| 1 | **Lê Nhật Linh** | Trưởng nhóm dự án / BA / Solution Architect | 1,500,000 | 2,250,000 | Quản lý dự án, Phân tích nghiệp vụ, Kiểm soát chi phí |
| 2 | **Trần Nguyên** | Senior Backend Developer | 1,200,000 | 1,800,000 | Xây dựng Spring Boot REST API, CSDL MySQL, Bảo mật JWT |
| 3 | **Phạm Hồng** | Frontend & UI/UX Developer | 1,200,000 | 1,800,000 | Thiết kế UI/UX React SPA, Tailwind CSS, Tích hợp API |
| 4 | **Nguyễn Văn Test** | Quality Assurance (QA / Tester) | 800,000 | 1,200,000 | Kiểm thử chức năng, Kiểm thử hiệu năng, System Test |
| 5 | **Toàn bộ nhóm** | Đội ngũ Phát triển Dự án | N/A | N/A | Phối hợp nghiệm thu và bàn giao sản phẩm |

---

## BẢNG CHI TIẾT CÔNG VIỆC, KHỐI LƯỢNG (EFFORT) VÀ CHI PHÍ (COST)

| STT | Nội dung công việc | Nhân sự phụ trách | Thời gian thực hiện | Effort (Manday) | Đơn giá (VNĐ) | Thành tiền (VNĐ) | Trạng thái | Comment / Ghi chú chi phí |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **I** | **PHÂN TÍCH THIẾT KẾ** | | | **25.0** | | **32,850,000** | **HOÀN THÀNH** | **Tổng chi phí giai đoạn Phân tích Thiết kế** |
| 1 | Khởi động dự án, thu thập yêu cầu | Lê Nhật Linh | 08/07 | 1.0 | 1,500,000 | 1,500,000 | Hoàn thành | Họp lấy yêu cầu với khách hàng CÔNG TY YYY |
| 2 | Phân tích nghiệp vụ, Use Case | Lê Nhật Linh | 08/07 - 09/07 | 2.0 | 1,500,000 | 3,000,000 | Hoàn thành | Xây dựng Đặc tả Use Case & Luồng nghiệp vụ |
| 3 | Thiết kế CSDL (ERD), Database MySQL | Lê Nhật Linh + Trần Nguyên | 09/07 | 2.0 | 1,350,000 | 2,700,000 | Hoàn thành | Thiết kế 24 Thực thể CSDL & Chuẩn hóa dữ liệu |
| 4 | Thiết kế UI/UX tổng thể | Phạm Hồng | 09/07 - 10/07 | 2.0 | 1,200,000 | 2,400,000 | Hoàn thành | Xây dựng Design Token, Wireframe & Prototype |
| 5 | Khởi tạo Backend Spring Boot | Trần Nguyên | 10/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Cấu hình Spring Boot 3, JPA, Maven, MySQL Connection |
| 6 | Khởi tạo Frontend React | Phạm Hồng | 10/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Cấu hình React 18 SPA, Vite, Axios Client |
| 7 | Xây dựng Authentication (Đăng nhập, Đăng ký, JWT, Phân quyền) | Trần Nguyên + Phạm Hồng | 10/07 - 11/07 | 3.0 | 1,500,000 | 4,500,000 | Hoàn thành | Gồm **OT Thứ 7 (11/07)** nhân hệ số 1.5 chi phí |
| 8 | Phát triển Dashboard Admin | Phạm Hồng | 11/07 | 1.0 | 1,800,000 | 1,800,000 | Hoàn thành | **OT Thứ 7 (11/07)**: Thiết kế Layout Admin Dashboard |
| 9 | Phát triển các chức năng Admin | Trần Nguyên + Phạm Hồng | 11/07 - 15/07 | 5.0 | 1,440,000 | 7,200,000 | Hoàn thành | Gồm 2 ngày **OT (11-12/07)** làm các module Admin |
| 10 | Phát triển chức năng Customer | Trần Nguyên + Phạm Hồng | 13/07 - 16/07 | 4.0 | 1,200,000 | 4,800,000 | Hoàn thành | Phát triển Cổng thông tin Khách hàng |
| 11 | Phát triển chức năng Waiter | Trần Nguyên | 15/07 - 16/07 | 2.0 | 1,200,000 | 2,400,000 | Hoàn thành | Xây dựng module Phục vụ tại bàn |
| 12 | Phát triển chức năng Chef | Trần Nguyên | 16/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Xây dựng Màn hình Bếp KDS |
| 13 | Phát triển chức năng Cashier | Trần Nguyên + Phạm Hồng | 16/07 - 17/07 | 2.0 | 1,200,000 | 2,400,000 | Hoàn thành | Phát triển POS Thu ngân & Xuất hóa đơn |
| 14 | Phát triển chức năng Manager | Trần Nguyên + Phạm Hồng | 17/07 - 18/07 | 3.0 | 1,400,000 | 4,200,000 | Hoàn thành | Gồm **OT Thứ 7 (18/07)** phát triển Dashboard Quản lý |
| 15 | Tích hợp Frontend với Backend | Trần Nguyên + Phạm Hồng | 18/07 - 19/07 | 3.0 | 1,800,000 | 5,400,000 | Hoàn thành | **OT Thứ 7 & Chủ Nhật (18-19/07)** Tích hợp API E2E |
| 16 | Kiểm thử chức năng (Functional Testing) | Nguyễn Văn Test | 19/07 - 20/07 | 2.0 | 1,000,000 | 2,000,000 | Hoàn thành | Gồm **OT Chủ Nhật (19/07)** chạy Test Case |
| 17 | Sửa lỗi theo kết quả kiểm thử | Trần Nguyên + Phạm Hồng | 20/07 - 21/07 | 2.0 | 1,200,000 | 2,400,000 | Hoàn thành | Fix bug danh mục lỗi phát hiện bởi QA |
| 18 | Kiểm thử lần cuối (Regression Test) | Nguyễn Văn Test | 21/07 | 1.0 | 800,000 | 800,000 | Hoàn thành | Kiểm thử hồi quy toàn hệ thống |
| 19 | Hoàn thiện tài liệu, báo cáo, hướng dẫn sử dụng | Lê Nhật Linh | 21/07 - 22/07 | 2.0 | 1,500,000 | 3,000,000 | Hoàn thành | Biên soạn Báo cáo SRS & Tài liệu hướng dẫn |
| 20 | Nghiệm thu và bàn giao | Toàn bộ nhóm | 22/07 | 1.0 | 1,500,000 | 1,500,000 | Hoàn thành | Bàn giao source code, CSDL & nghiệm thu dự án |
| **II** | **PHÁT TRUYỂN VÀ XÂY DỰNG** | | | **85.0** | | **110,650,000** | | **Chi tiết từng module tính năng** |
| **1** | **Authentication & Authorization** | | | **6.0** | | **7,800,000** | **HOÀN THÀNH** | **Xây dựng hệ thống bảo mật & phân quyền** |
| 1.1 | Đăng ký | Trần Nguyên | 10/07 - 11/07 | 1.5 | 1,200,000 | 1,800,000 | Hoàn thành | API & UI Đăng ký tài khoản mới |
| | + Đăng ký khách hàng | Trần Nguyên | 10/07 | 0.5 | 1,200,000 | 600,000 | Hoàn thành | Form tạo tài khoản Khách hàng |
| | + Kiểm tra Email | Trần Nguyên | 10/07 | 0.5 | 1,200,000 | 600,000 | Hoàn thành | Validate email không trùng lặp |
| | + Mã OTP (nếu có) | Trần Nguyên | 11/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | **OT Thứ 7**: Tích hợp mã xác thực OTP qua Email |
| 1.2 | Đăng nhập | Trần Nguyên | 11/07 | 2.0 | 1,500,000 | 3,000,000 | Hoàn thành | Gồm **OT Thứ 7 (11/07)** xác thực đăng nhập |
| | + Đăng nhập | Trần Nguyên | 11/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | Form Đăng nhập Username/Password |
| | + JWT Authentication | Trần Nguyên | 11/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | Sinh chuỗi mã hóa Bearer Token |
| | + Refresh Token | Trần Nguyên | 11/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | Cơ chế tự động làm mới Token hết hạn |
| | + Đăng xuất | Trần Nguyên | 11/07 | 0.5 | 1,200,000 | 600,000 | Hoàn thành | Vô hiệu hóa Token & Xóa Session |
| 1.3 | Quên mật khẩu | Trần Nguyên | 12/07 | 1.5 | 1,800,000 | 2,700,000 | Hoàn thành | **OT Chủ Nhật (12/07)**: Quy trình khôi phục mật khẩu |
| | + Gửi Email | Trần Nguyên | 12/07 | 0.75 | 1,800,000 | 1,350,000 | Hoàn thành | **OT Chủ Nhật**: Gửi link reset mật khẩu qua Email |
| | + Đổi mật khẩu | Trần Nguyên | 12/07 | 0.75 | 1,800,000 | 1,350,000 | Hoàn thành | **OT Chủ Nhật**: Nhập mật khẩu mới & hash BCrypt |
| 1.4 | Phân quyền (RBAC) | Trần Nguyên | 11/07 - 12/07 | 1.0 | 1,800,000 | 1,800,000 | Hoàn thành | **OT Cuối tuần**: Ma trận phân quyền 6 Vai trò |
| | + ROLE_ADMIN | Trần Nguyên | 11/07 | 0.2 | 1,800,000 | 360,000 | Hoàn thành | Toàn quyền cấu hình hệ thống |
| | + ROLE_MANAGER | Trần Nguyên | 11/07 | 0.2 | 1,800,000 | 360,000 | Hoàn thành | Quyền quản lý kinh doanh & báo cáo |
| | + ROLE_WAITER | Trần Nguyên | 12/07 | 0.2 | 1,800,000 | 360,000 | Hoàn thành | Quyền thao tác sơ đồ bàn & order |
| | + ROLE_CHEF | Trần Nguyên | 12/07 | 0.2 | 1,800,000 | 360,000 | Hoàn thành | Quyền điều hành bếp KDS |
| | + ROLE_CASHIER | Trần Nguyên | 12/07 | 0.1 | 1,800,000 | 180,000 | Hoàn thành | Quyền POS thanh toán & xuất hóa đơn |
| | + ROLE_CUSTOMER | Trần Nguyên | 12/07 | 0.1 | 1,800,000 | 180,000 | Hoàn thành | Quyền đặt bàn, chọn món cá nhân |
| **2** | **Admin Dashboard** | Phạm Hồng | 11/07 - 15/07 | **20.0** | | **25,800,000** | **HOÀN THÀNH** | **Giao diện & Chức năng Quản trị hệ thống Admin** |
| 2.1 | Dashboard tổng quan | Phạm Hồng | 11/07 | 2.0 | 1,800,000 | 3,600,000 | Hoàn thành | **OT Thứ 7**: Trang Dashboard thông kê tổng quan |
| | + Tổng doanh thu | Phạm Hồng | 11/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | Thẻ hiển thị tổng số tiền thu về |
| | + Đơn hàng | Phạm Hồng | 11/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | Đếm số lượng đơn hàng theo trạng thái |
| | + Biểu đồ | Phạm Hồng | 11/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | Biểu đồ đường/cột Chart.js tăng trưởng |
| | + Top món bán chạy | Phạm Hồng | 11/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | Bảng xếp hạng món ăn được gọi nhiều nhất |
| 2.2 | User Management | Phạm Hồng | 12/07 - 13/07 | 2.0 | 1,500,000 | 3,000,000 | Hoàn thành | Gồm **OT Chủ Nhật (12/07)** quản lý người dùng |
| | + CRUD User | Phạm Hồng | 12/07 | 1.0 | 1,800,000 | 1,800,000 | Hoàn thành | Thêm, xem, sửa thông tin tài khoản |
| | + Khóa tài khoản | Phạm Hồng | 13/07 | 0.5 | 1,200,000 | 600,000 | Hoàn thành | Đổi trạng thái `active = false` |
| | + Phân quyền | Phạm Hồng | 13/07 | 0.5 | 1,200,000 | 600,000 | Hoàn thành | Gán danh sách vai trò cho tài khoản |
| 2.3 | Employee Management | Phạm Hồng | 13/07 | 1.5 | 1,200,000 | 1,800,000 | Hoàn thành | Quản lý nhân sự nhà hàng |
| | + CRUD Nhân viên | Phạm Hồng | 13/07 | 1.5 | 1,200,000 | 1,800,000 | Hoàn thành | Mã nhân viên, vị trí, lương, ngày vào làm |
| 2.4 | Category Management | Phạm Hồng | 14/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Quản lý danh mục món ăn |
| | + CRUD Danh mục | Phạm Hồng | 14/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Thêm/Sửa danh mục Khai vị, Món chính... |
| 2.5 | Menu Management | Phạm Hồng | 14/07 | 2.0 | 1,200,000 | 2,400,000 | Hoàn thành | Quản lý thực đơn nhà hàng |
| | + CRUD Món ăn | Phạm Hồng | 14/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Tên món, giá bán, mô tả, trạng thái |
| | + Upload ảnh | Phạm Hồng | 14/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Tải ảnh món ăn lên máy chủ / Cloud |
| 2.6 | Table Management | Phạm Hồng | 15/07 | 2.0 | 1,200,000 | 2,400,000 | Hoàn thành | Quản lý sơ đồ bàn ăn |
| | + CRUD Bàn | Phạm Hồng | 15/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Số bàn, sức chứa, vị trí |
| | + Ghép bàn | Phạm Hồng | 15/07 | 0.5 | 1,200,000 | 600,000 | Hoàn thành | Ghép nhiều bàn nhỏ cho đoàn khách |
| | + Tách bàn | Phạm Hồng | 15/07 | 0.5 | 1,200,000 | 600,000 | Hoàn thành | Tách bàn khi khách muốn ngồi riêng |
| 2.7 | Reservation Management | Phạm Hồng | 15/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Tiếp nhận & duyệt phiếu đặt bàn trước |
| | + Quản lý đặt bàn | Phạm Hồng | 15/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Duyệt `CONFIRMED` hoặc Hủy đặt bàn |
| 2.8 | Order Management | Phạm Hồng | 16/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Quản lý đơn hàng toàn hệ thống |
| | + Quản lý Order | Phạm Hồng | 16/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Tra cứu danh sách đơn hàng theo bàn/ngày |
| 2.9 | Kitchen Management | Phạm Hồng | 16/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Màn hình theo dõi tiến độ bếp |
| | + Theo dõi bếp | Phạm Hồng | 16/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Giám sát các món đang chế biến |
| 2.10 | Inventory | Phạm Hồng | 17/07 | 1.5 | 1,200,000 | 1,800,000 | Hoàn thành | Quản lý kho nguyên vật liệu |
| | + Kho | Phạm Hồng | 17/07 | 0.5 | 1,200,000 | 600,000 | Hoàn thành | Theo dõi số lượng tồn kho nguyên liệu |
| | + Nhập | Phạm Hồng | 17/07 | 0.5 | 1,200,000 | 600,000 | Hoàn thành | Lập phiếu nhập kho nguyên liệu |
| | + Xuất | Phạm Hồng | 17/07 | 0.5 | 1,200,000 | 600,000 | Hoàn thành | Trừ nguyên liệu xuất kho chế biến |
| 2.11 | Supplier Management | Phạm Hồng | 17/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Quản lý Nhà cung cấp thực phẩm |
| | + CRUD Supplier | Phạm Hồng | 17/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Tên NCC, người liên hệ, SĐT, Email |
| 2.12 | Promotion Management | Phạm Hồng | 18/07 | 1.5 | 1,800,000 | 2,700,000 | Hoàn thành | **OT Thứ 7 (18/07)**: Quản lý chương trình khuyến mãi |
| | + Voucher | Phạm Hồng | 18/07 | 0.75 | 1,800,000 | 1,350,000 | Hoàn thành | Tạo mã giảm giá phần trăm / tiền mặt |
| | + Coupon | Phạm Hồng | 18/07 | 0.75 | 1,800,000 | 1,350,000 | Hoàn thành | Mã ưu đãi cho khách hàng thân thiết |
| 2.13 | Customer Management | Phạm Hồng | 18/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | **OT Thứ 7**: Danh sách & tích điểm khách hàng |
| | + Quản lý khách | Phạm Hồng | 18/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | Xem điểm thưởng & hạng thành viên |
| 2.14 | Review Management | Phạm Hồng | 18/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | **OT Thứ 7**: Quản lý phản hồi đánh giá món |
| | + Quản lý đánh giá | Phạm Hồng | 18/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | Lọc nhận xét & duyệt phản hồi khách |
| 2.15 | Payment Management | Phạm Hồng | 19/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | **OT Chủ Nhật (19/07)**: Theo dõi giao dịch thanh toán |
| | + Thanh toán | Phạm Hồng | 19/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | Lịch sử tiền mặt, VNPay, Thẻ |
| 2.16 | Report Management | Phạm Hồng | 19/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | **OT Chủ Nhật**: Báo cáo tổng hợp Admin |
| | + Báo cáo | Phạm Hồng | 19/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | Trích xuất báo cáo doanh thu PDF/Excel |
| 2.17 | Notification | Phạm Hồng | 19/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | **OT Chủ Nhật**: Hệ thống gửi thông báo Admin |
| 2.18 | Profile | Phạm Hồng | 19/07 | 0.25 | 1,800,000 | 450,000 | Hoàn thành | **OT Chủ Nhật**: Cập nhật hồ sơ Admin |
| 2.19 | System Setting | Phạm Hồng | 19/07 | 0.25 | 1,800,000 | 450,000 | Hoàn thành | **OT Chủ Nhật**: Cấu hình tham số hệ thống |
| **3** | **Customer Module** | Lê Nhật Linh | 13/07 - 16/07 | **13.0** | | **19,500,000** | **HOÀN THÀNH** | **Giao diện & Chức năng Cổng Khách hàng (Trưởng nhóm phụ trách)** |
| 3.1 | Trang chủ | Lê Nhật Linh | 13/07 | 1.0 | 1,500,000 | 1,500,000 | Hoàn thành | Trang Home banner, món nổi bật, giới thiệu |
| 3.2 | Xem Menu | Lê Nhật Linh | 13/07 | 1.0 | 1,500,000 | 1,500,000 | Hoàn thành | Danh sách món ăn kèm bộ lọc danh mục/giá |
| 3.3 | Chi tiết món | Lê Nhật Linh | 13/07 | 1.0 | 1,500,000 | 1,500,000 | Hoàn thành | Mô tả chi tiết món, giá, thành phần, đánh giá |
| 3.4 | Giỏ hàng | Lê Nhật Linh | 14/07 | 1.0 | 1,500,000 | 1,500,000 | Hoàn thành | Quản lý giỏ hàng tạm, tăng giảm số lượng món |
| 3.5 | Đặt món | Lê Nhật Linh | 14/07 | 1.5 | 1,500,000 | 2,250,000 | Hoàn thành | Chọn ăn tại chỗ / mang về, nhập ghi chú bếp |
| 3.6 | Đặt bàn | Lê Nhật Linh | 14/07 | 1.5 | 1,500,000 | 2,250,000 | Hoàn thành | Form đặt giữ bàn trước theo giờ & số khách |
| 3.7 | Thanh toán | Lê Nhật Linh | 15/07 | 1.5 | 1,500,000 | 2,250,000 | Hoàn thành | Thanh toán trực tuyến VNPay / Thẻ ngân hàng |
| 3.8 | Lịch sử đơn hàng | Lê Nhật Linh | 15/07 | 1.0 | 1,500,000 | 1,500,000 | Hoàn thành | Tra cứu danh sách đơn hàng đã gọi |
| 3.9 | Lịch sử đặt bàn | Lê Nhật Linh | 15/07 | 1.0 | 1,500,000 | 1,500,000 | Hoàn thành | Xem phiếu đặt bàn & trạng thái duyệt |
| 3.10 | Đánh giá | Lê Nhật Linh | 16/07 | 1.0 | 1,500,000 | 1,500,000 | Hoàn thành | Đánh giá số sao (1-5 sao) & nhận xét món ăn |
| 3.11 | Yêu thích | Lê Nhật Linh | 16/07 | 0.5 | 1,500,000 | 750,000 | Hoàn thành | Lưu món ăn yêu thích vào danh sách |
| 3.12 | Hồ sơ cá nhân | Lê Nhật Linh | 16/07 | 0.5 | 1,500,000 | 750,000 | Hoàn thành | Cập nhật thông tin cá nhân & điểm tích lũy |
| 3.13 | Thông báo | Lê Nhật Linh | 16/07 | 0.5 | 1,500,000 | 750,000 | Hoàn thành | Nhận thông báo xác nhận đặt bàn & đơn món |
| **4** | **Waiter Module** | Trần Nguyên | 15/07 - 16/07 | **9.0** | | **10,800,000** | **HOÀN THÀNH** | **Giao diện & Chức năng Phục vụ tại bàn** |
| 4.1 | Dashboard Phục vụ | Trần Nguyên | 15/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Tổng quan sơ đồ bàn & thông báo trong ca |
| 4.2 | Quản lý bàn | Trần Nguyên | 15/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Sơ đồ bàn realtime, đổi trạng thái dọn dẹp |
| 4.3 | Tạo Order | Trần Nguyên | 15/07 | 1.5 | 1,200,000 | 1,800,000 | Hoàn thành | Tạo đơn món mới cho bàn khách ngồi |
| 4.4 | Thêm món | Trần Nguyên | 16/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Thêm món ăn phát sinh vào đơn sẵn có |
| 4.5 | Chuyển bàn | Trần Nguyên | 16/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Chuyển toàn bộ món từ bàn X sang bàn Y |
| 4.6 | Ghép bàn | Trần Nguyên | 16/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Gộp nhiều đơn món khi ghép bàn |
| 4.7 | Reservation | Trần Nguyên | 16/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Tiếp nhận khách đặt trước đến nhận bàn |
| 4.8 | Notification | Trần Nguyên | 16/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Nhận thông báo món `READY` từ Bếp |
| 4.9 | Profile Phục vụ | Trần Nguyên | 16/07 | 0.5 | 1,200,000 | 600,000 | Hoàn thành | Hồ sơ cá nhân & ca làm việc |
| **5** | **Chef Module (KDS)** | Phạm Hồng | 16/07 | **6.0** | | **7,200,000** | **HOÀN THÀNH** | **Màn hình Điều hành Bếp KDS** |
| 5.1 | Dashboard Bếp | Phạm Hồng | 16/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Thống kê món cần làm & thời gian trung bình |
| 5.2 | Kitchen Queue | Phạm Hồng | 16/07 | 1.5 | 1,200,000 | 1,800,000 | Hoàn thành | Màn hình hiển thị hàng đợi món ăn đếm ngược |
| 5.3 | Cooking | Phạm Hồng | 16/07 | 1.5 | 1,200,000 | 1,800,000 | Hoàn thành | Chuyển trạng thái món sang `IN_PREPARATION` |
| 5.4 | Completed Order | Phạm Hồng | 16/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Đánh giá món `READY` & lưu lịch sử món hoàn thành |
| 5.5 | Notification | Phạm Hồng | 16/07 | 0.5 | 1,200,000 | 600,000 | Hoàn thành | Phát chuông cảnh báo khi có đơn món mới |
| 5.6 | Profile Đầu bếp | Phạm Hồng | 16/07 | 0.5 | 1,200,000 | 600,000 | Hoàn thành | Hồ sơ cá nhân Đầu bếp |
| **6** | **Cashier Module (POS)** | Lê Nhật Linh | 16/07 - 17/07 | **7.0** | | **10,500,000** | **HOÀN THÀNH** | **Màn hình Thu ngân POS & In hóa đơn (Trưởng nhóm phụ trách)** |
| 6.1 | Dashboard Thu ngân | Lê Nhật Linh | 16/07 | 1.0 | 1,500,000 | 1,500,000 | Hoàn thành | Quản lý danh sách bàn chờ thanh toán |
| 6.2 | Payment POS | Lê Nhật Linh | 17/07 | 1.5 | 1,500,000 | 2,250,000 | Hoàn thành | Giao diện tính tiền, chọn Cash / QR / Card |
| 6.3 | Invoice | Lê Nhật Linh | 17/07 | 1.5 | 1,500,000 | 2,250,000 | Hoàn thành | Tính VAT, tổng tiền & kết nối máy in hóa đơn |
| 6.4 | Voucher / Promo | Lê Nhật Linh | 17/07 | 1.0 | 1,500,000 | 1,500,000 | Hoàn thành | Nhập mã giảm giá & trừ tiền chiết khấu |
| 6.5 | Membership Point | Lê Nhật Linh | 17/07 | 1.0 | 1,500,000 | 1,500,000 | Hoàn thành | Tích điểm thưởng & quy đổi điểm trừ tiền |
| 6.6 | Report Ca trực | Lê Nhật Linh | 17/07 | 0.5 | 1,500,000 | 750,000 | Hoàn thành | Chốt sổ ca làm việc & đối soát tiền mặt/chuyển khoản |
| 6.7 | Profile Thu ngân | Lê Nhật Linh | 17/07 | 0.5 | 1,500,000 | 750,000 | Hoàn thành | Hồ sơ cá nhân Thu ngân |
| **7** | **Manager Module** | Trần Nguyên | 17/07 - 18/07 | **13.0** | | **18,600,000** | **HOÀN THÀNH** | **Báo cáo & Thống kê dành cho Quản lý** |
| 7.1 | Dashboard Quản lý | Trần Nguyên | 17/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Trang điều hành tình hình kinh doanh tổng thể |
| 7.2 | Employee Management | Trần Nguyên | 17/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Theo dõi ca làm việc & bảng lương nhân sự |
| 7.3 | Reservation | Trần Nguyên | 17/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Giám sát mật độ đặt bàn trước |
| 7.4 | Order Management | Trần Nguyên | 17/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Theo dõi thời gian chế biến & phục vụ |
| 7.5 | Inventory | Trần Nguyên | 17/07 | 1.5 | 1,200,000 | 1,800,000 | Hoàn thành | Cảnh báo nguyên liệu sắp hết & lập đơn PO |
| 7.6 | Supplier | Trần Nguyên | 17/07 | 1.0 | 1,200,000 | 1,200,000 | Hoàn thành | Quản lý thông tin & lịch sử giao dịch NCC |
| 7.7 | Promotion | Trần Nguyên | 18/07 | 1.5 | 1,800,000 | 2,700,000 | Hoàn thành | **OT Thứ 7 (18/07)**: Thiết lập chiến dịch khuyến mãi |
| 7.8 | Customer | Trần Nguyên | 18/07 | 1.0 | 1,800,000 | 1,800,000 | Hoàn thành | **OT Thứ 7**: Phân nhóm khách hàng & ưu đãi |
| 7.9 | Analytics | Trần Nguyên | 18/07 | 1.5 | 1,800,000 | 2,700,000 | Hoàn thành | **OT Thứ 7**: Biểu đồ phân tích doanh thu & lợi nhuận |
| 7.10 | Report | Trần Nguyên | 18/07 | 1.5 | 1,800,000 | 2,700,000 | Hoàn thành | **OT Thứ 7**: Trích xuất báo cáo kinh doanh |
| 7.11 | Notification | Trần Nguyên | 18/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | **OT Thứ 7**: Nhận cảnh báo doanh thu & tồn kho |
| 7.12 | Profile Manager | Trần Nguyên | 18/07 | 0.5 | 1,800,000 | 900,000 | Hoàn thành | **OT Thứ 7**: Hồ sơ cá nhân Quản lý |
| **8** | **TÍCH HỢP MỞ RỘNG** | Trần Nguyên + Phạm Hồng | 18/07 - 19/07 | **10.0** | | **15,000,000** | **HOÀN THÀNH** | **Tích hợp các dịch vụ bên thứ ba & Đa ngôn ngữ** |
| 8.1 | Tích hợp email | Trần Nguyên | 18/07 | 2.5 | 1,800,000 | 4,500,000 | Hoàn thành | **OT Thứ 7**: Tích hợp Spring Mail (Xác thực, OTP, Hóa đơn) |
| 8.2 | Tích hợp Google Map & Google Analytics | Phạm Hồng | 18/07 | 2.5 | 1,800,000 | 4,500,000 | Hoàn thành | **OT Thứ 7**: Định vị nhà hàng & theo dõi lượng truy cập |
| 8.3 | Tích hợp Notification OneSignal | Trần Nguyên | 19/07 | 2.5 | 1,800,000 | 4,500,000 | Hoàn thành | **OT Chủ Nhật (19/07)**: Gửi Push Notification thời gian thực |
| 8.4 | Đa ngôn ngữ (Vi, En) | Phạm Hồng | 19/07 | 2.5 | 1,800,000 | 4,500,000 | Hoàn thành | **OT Chủ Nhật**: Tích hợp React i18next hỗ trợ Tiếng Việt & Tiếng Anh |
| | **TỔNG CỘNG HẠNG MỤC PHÁT TRUYỂN** | | | **85.0** | | **110,650,000** | | **Tổng chi phí giai đoạn Phát triển & Tích hợp** |

---

## BẢNG TỔNG HỢP CHI PHÍ DỰ ÁN (PROJECT COST SUMMARY)

| STT | Hạng mục công việc | Effort (Manday) | Chi phí thành tiền (VNĐ) | Tỷ trọng | Ghi chú |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **I** | **Giai đoạn I: Phân tích & Thiết kế Hệ thống** | **25.0** | **32,850,000** | **22.9%** | Thu thập yêu cầu, ERD, UI/UX, Prototype, Kiểm thử & Nghiệm thu |
| **II** | **Giai đoạn II: Phát triển & Xây dựng Chức năng** | **85.0** | **110,650,000** | **77.1%** | Lập trình Backend Spring Boot, Frontend React SPA & Tích hợp API |
| | - *1. Authentication & Authorization* | *6.0* | *7,800,000* | *5.4%* | JWT, Refresh Token, OTP Email, Phân quyền RBAC 6 Vai trò |
| | - *2. Admin Dashboard* | *20.0* | *25,800,000* | *18.0%* | Quản trị User, Nhân sự, Thực đơn, Bàn ăn, Kho, Khuyến mãi, Báo cáo |
| | - *3. Customer Module* | *13.0* | *19,500,000* | *13.6%* | Trang chủ, Xem thực đơn, Giỏ hàng, Đặt bàn, Thanh toán VNPay, Đánh giá |
| | - *4. Waiter Module* | *9.0* | *10,800,000* | *7.5%* | Sơ đồ bàn realtime, Gọi món tại bàn, Chuyển/Ghép bàn, Nhận thông báo món |
| | - *5. Chef Module (KDS)* | *6.0* | *7,200,000* | *5.0%* | Màn hình hiển thị bếp KDS, đổi trạng thái chế biến, đếm ngược thời gian |
| | - *6. Cashier Module (POS)* | *7.0* | *10,500,000* | *7.3%* | POS tính tiền, áp mã voucher, tích điểm thành viên, kết nối máy in hóa đơn |
| | - *7. Manager Module* | *13.0* | *18,600,000* | *13.0%* | Báo cáo doanh thu, phân tích lợi nhuận, quản lý tồn kho & nhà cung cấp |
| | - *8. Tích hợp mở rộng* | *10.0* | *15,000,000* | *10.5%* | Email OTP, Google Map/Analytics, OneSignal Notification, Đa ngôn ngữ Vi/En |
| **TỔNG** | **TỔNG CHI PHÍ DỰ ÁN (CHƯA THUẾ VAT)** | **110.0** | **143,500,000** | **100.0%** | **Một trăm bốn mươi ba triệu năm trăm nghìn đồng chẵn** |
| | **Thuế VAT (8%)** | | **11,480,000** | | Thuế giá trị gia tăng theo quy định nhà nước |
| **TỔNG** | **TỔNG CHI PHÍ NGUYÊN TỆ (ĐÃ BAO GỒM VAT 8%)** | | **154,980,000** | | **Một trăm năm mươi tư triệu chín trăm tám mươi nghìn đồng chẵn** |

---

### GHI CHÚ VỀ CÁCH TÍNH GIÁ VÀ ĐIỀU KHOẢN THANH TOÁN

1. **Cơ sở tính toán Chi phí**:
   - Chi phí được tính toán dựa trên khối lượng ngày công thực tế (**Effort Manday**) của nhân sự.
   - Các ngày công phát sinh vào **Thứ 7 & Chủ Nhật** (như giai đoạn 11/07 - 12/07 và 18/07 - 19/07) được tính theo hình thức **OT (Overtime)** với hệ số đơn giá **150%** so với ngày thường để đảm bảo hoàn thành dự án đúng hạn 22/07/2026.
   - Trưởng nhóm **Lê Nhật Linh** chịu trách nhiệm điều phối tổng thể, phân tích nghiệp vụ, trực tiếp xây dựng cổng Khách hàng & Thu ngân POS và kiểm soát chất lượng bàn giao.

2. **Tiến độ Thanh toán**:
   - **Đợt 1 (Tạm ứng 30%)**: **46,494,000 VNĐ** ngay sau khi ký kết hợp đồng và khởi động dự án (08/07/2026).
   - **Đợt 2 (Thanh toán 40%)**: **61,992,000 VNĐ** sau khi hoàn thành chạy demo các phân hệ Customer, Waiter, Chef & POS Thu ngân (17/07/2026).
   - **Đợt 3 (Thanh toán 30% còn lại)**: **46,494,000 VNĐ** sau khi bàn giao toàn bộ CSDL, Mã nguồn, Tài liệu SRS và Nghiệm thu chính thức (22/07/2026).
