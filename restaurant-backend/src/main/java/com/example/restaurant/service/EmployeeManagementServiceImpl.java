package com.example.restaurant.service;

import com.example.restaurant.dto.EmployeeCreateRequest;
import com.example.restaurant.dto.EmployeeResponse;
import com.example.restaurant.dto.EmployeeUpdateRequest;
import com.example.restaurant.entity.Employee;
import com.example.restaurant.entity.Role;
import com.example.restaurant.entity.User;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.EmployeeRepository;
import com.example.restaurant.repository.RoleRepository;
import com.example.restaurant.repository.UserRepository;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EmployeeManagementServiceImpl implements EmployeeManagementService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String UPLOAD_DIR = "uploads";

    @Override
    @Transactional
    public Page<EmployeeResponse> searchEmployees(String search, String roleName, String status, Pageable pageable) {
        // Auto-sync missing Employee profiles for staff users
        List<User> allUsers = userRepository.findAll();
        for (User u : allUsers) {
            boolean isStaff = u.getRoles().stream().anyMatch(r -> !r.getName().equals("ROLE_CUSTOMER"));
            if (isStaff && !employeeRepository.existsByUserId(u.getId())) {
                String empCode = "EMP-" + String.format("%04d", u.getId());
                Employee employee = Employee.builder()
                        .employeeCode(empCode)
                        .user(u)
                        .status(u.isEnabled() ? "ACTIVE" : "INACTIVE")
                        .salary(new BigDecimal("1500.00"))
                        .hireDate(LocalDate.now())
                        .build();
                employeeRepository.save(employee);
            }
        }

        String searchParam = (search == null || search.trim().isEmpty()) ? null : search.trim();
        String roleParam = (roleName == null || roleName.trim().isEmpty() || roleName.equalsIgnoreCase("All")) ? null : roleName.trim();
        String statusParam = (status == null || status.trim().isEmpty() || status.equalsIgnoreCase("All")) ? null : status.trim();

        Page<Employee> empPage = employeeRepository.searchEmployees(searchParam, roleParam, statusParam, pageable);
        return empPage.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ApiException("Employee profile not found", HttpStatus.NOT_FOUND));
        return mapToResponse(emp);
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException("Email is already in use", HttpStatus.BAD_REQUEST);
        }

        if (employeeRepository.existsByEmployeeCode(request.getEmployeeCode())) {
            throw new ApiException("Employee code already exists", HttpStatus.BAD_REQUEST);
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new ApiException("Role not found: " + request.getRole(), HttpStatus.BAD_REQUEST));

        Set<Role> roles = new HashSet<>();
        roles.add(role);

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .roles(roles)
                .enabled(true)
                .build();

        Employee employee = Employee.builder()
                .employeeCode(request.getEmployeeCode())
                .user(user)
                .birthday(request.getBirthday())
                .gender(request.getGender())
                .address(request.getAddress())
                .salary(request.getSalary())
                .hireDate(request.getHireDate())
                .status(request.getStatus())
                .avatar(request.getAvatar())
                .build();

        Employee saved = employeeRepository.save(employee);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeUpdateRequest request) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ApiException("Employee profile not found", HttpStatus.NOT_FOUND));

        User user = emp.getUser();

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new ApiException("Role not found: " + request.getRole(), HttpStatus.BAD_REQUEST));

        Set<Role> roles = new HashSet<>();
        roles.add(role);

        if (request.getStatus() != null) {
            boolean isEnabled = "ACTIVE".equalsIgnoreCase(request.getStatus());
            user.setEnabled(isEnabled);
        }
        userRepository.save(user);

        emp.setBirthday(request.getBirthday());
        emp.setGender(request.getGender());
        emp.setAddress(request.getAddress());
        emp.setSalary(request.getSalary());
        emp.setHireDate(request.getHireDate());
        emp.setStatus(request.getStatus());
        emp.setAvatar(request.getAvatar());

        Employee updated = employeeRepository.save(emp);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id, String currentAdminEmail) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new ApiException("Employee profile not found", HttpStatus.NOT_FOUND));

        if (emp.getUser().getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new ApiException("You cannot delete your own employee profile", HttpStatus.BAD_REQUEST);
        }

        // Deleting the employee will cascade delete the User entity
        employeeRepository.delete(emp);
    }

    @Override
    public String uploadAvatar(MultipartFile file) {
        if (file.isEmpty()) {
            throw new ApiException("File is empty", HttpStatus.BAD_REQUEST);
        }

        try {
            File uploadFolder = new File(UPLOAD_DIR);
            if (!uploadFolder.exists()) {
                uploadFolder.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String uniqueFilename = System.currentTimeMillis() + "_" + UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(UPLOAD_DIR, uniqueFilename);
            Files.write(filePath, file.getBytes());

            return "/uploads/" + uniqueFilename;
        } catch (IOException e) {
            throw new ApiException("Failed to save avatar image file on server: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportExcel() {
        List<Employee> employees = employeeRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Employees");

            // Header Font & Style
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_RED.getIndex()); // Matching #4A121A
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Create Header Row
            String[] columns = {"Code", "Full Name", "Email", "Phone", "Birthday", "Gender", "Address", "Salary", "Hire Date", "Status", "Role"};
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create Data Rows
            int rowIdx = 1;
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            for (Employee emp : employees) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(emp.getEmployeeCode());
                row.createCell(1).setCellValue(emp.getUser().getFullName());
                row.createCell(2).setCellValue(emp.getUser().getEmail());
                row.createCell(3).setCellValue(emp.getUser().getPhone() != null ? emp.getUser().getPhone() : "");
                row.createCell(4).setCellValue(emp.getBirthday() != null ? emp.getBirthday().format(dateFormatter) : "");
                row.createCell(5).setCellValue(emp.getGender() != null ? emp.getGender() : "");
                row.createCell(6).setCellValue(emp.getAddress() != null ? emp.getAddress() : "");
                
                org.apache.poi.ss.usermodel.Cell salaryCell = row.createCell(7);
                salaryCell.setCellValue(emp.getSalary() != null ? emp.getSalary().doubleValue() : 0.0);
                
                row.createCell(8).setCellValue(emp.getHireDate() != null ? emp.getHireDate().format(dateFormatter) : "");
                row.createCell(9).setCellValue(emp.getStatus());
                
                String roleStr = emp.getUser().getRoles().stream()
                        .map(Role::getName)
                        .map(name -> name.replace("ROLE_", ""))
                        .collect(Collectors.joining(", "));
                row.createCell(10).setCellValue(roleStr);
            }

            // Auto-fit columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new ApiException("Failed to generate Excel sheet", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportPdf() {
        List<Employee> employees = employeeRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document document = new Document(PageSize.A4);
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new java.awt.Color(74, 18, 26)); // Burgundy
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, java.awt.Color.GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, java.awt.Color.WHITE);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 8, java.awt.Color.DARK_GRAY);

            // Title
            Paragraph title = new Paragraph("L'ETOILE RESTAURANT - EMPLOYEES REPORT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(4);
            document.add(title);

            // Date
            String formattedDate = LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            Paragraph subtitle = new Paragraph("Generated on: " + formattedDate, subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(18);
            document.add(subtitle);

            // Table Setup
            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.0f, 2.0f, 2.2f, 1.3f, 1.2f, 1.2f, 1.1f}); // relative widths

            // Table Headers
            String[] headers = {"Code", "Name", "Email", "Phone", "Role", "Status", "Salary"};
            for (String columnTitle : headers) {
                PdfPCell header = new PdfPCell(new Phrase(columnTitle, headerFont));
                header.setBackgroundColor(new java.awt.Color(74, 18, 26)); // Burgundy
                header.setHorizontalAlignment(Element.ALIGN_CENTER);
                header.setPadding(6);
                table.addCell(header);
            }

            // Table Rows
            for (Employee emp : employees) {
                table.addCell(new PdfPCell(new Phrase(emp.getEmployeeCode(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(emp.getUser().getFullName(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(emp.getUser().getEmail(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(emp.getUser().getPhone() != null ? emp.getUser().getPhone() : "", bodyFont)));
                
                String roleStr = emp.getUser().getRoles().stream()
                        .map(Role::getName)
                        .map(name -> name.replace("ROLE_", ""))
                        .collect(Collectors.joining(", "));
                table.addCell(new PdfPCell(new Phrase(roleStr, bodyFont)));
                table.addCell(new PdfPCell(new Phrase(emp.getStatus(), bodyFont)));
                
                String salaryStr = emp.getSalary() != null ? "$" + emp.getSalary().toString() : "$0.00";
                PdfPCell salaryCell = new PdfPCell(new Phrase(salaryStr, bodyFont));
                salaryCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                table.addCell(salaryCell);
            }

            document.add(table);
            document.close();
        } catch (DocumentException e) {
            throw new ApiException("Failed to generate PDF document: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private EmployeeResponse mapToResponse(Employee emp) {
        String roleStr = emp.getUser().getRoles().stream()
                .map(Role::getName)
                .findFirst()
                .orElse("ROLE_CUSTOMER");

        return EmployeeResponse.builder()
                .id(emp.getId())
                .employeeCode(emp.getEmployeeCode())
                .email(emp.getUser().getEmail())
                .fullName(emp.getUser().getFullName())
                .phone(emp.getUser().getPhone())
                .birthday(emp.getBirthday())
                .gender(emp.getGender())
                .address(emp.getAddress())
                .salary(emp.getSalary())
                .hireDate(emp.getHireDate())
                .status(emp.getStatus())
                .role(roleStr)
                .avatar(emp.getAvatar())
                .build();
    }
}
