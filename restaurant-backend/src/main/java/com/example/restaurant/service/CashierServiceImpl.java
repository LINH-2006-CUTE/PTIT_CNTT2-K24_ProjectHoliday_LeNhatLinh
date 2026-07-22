package com.example.restaurant.service;

import com.example.restaurant.dto.*;
import com.example.restaurant.entity.*;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CashierServiceImpl implements CashierService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private DiningTableRepository diningTableRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderHistoryDTO> getPendingOrders() {
        List<Order> orders = orderRepository.findAll();

        return orders.stream()
                .filter(o -> {
                    String st = o.getStatus() != null ? o.getStatus().toUpperCase() : "";
                    return st.equals("PENDING") || st.equals("IN_SERVICE") || st.equals("SERVED") || st.equals("COOKING");
                })
                .sorted((o1, o2) -> Long.compare(o2.getId(), o1.getId()))
                .limit(10)
                .map(o -> {
                    List<OrderItem> items = orderItemRepository.findByOrderId(o.getId());
                    return mapToDTO(o, items);
                })
                .collect(Collectors.toList());
    }

    @Override
    public InvoiceDTO processCheckout(CashierCheckoutRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng #" + request.getOrderId(), HttpStatus.NOT_FOUND));

        BigDecimal subtotal = order.getTotalAmount();
        BigDecimal discount = BigDecimal.ZERO;

        // Process voucher discount
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            if ("VIP10".equalsIgnoreCase(request.getVoucherCode())) {
                discount = subtotal.multiply(new BigDecimal("0.10"));
            } else if ("DISCOUNT50K".equalsIgnoreCase(request.getVoucherCode())) {
                discount = new BigDecimal("50000");
            }
        }

        // Process points discount (1 point = 1,000 VND)
        if (request.getPointsToRedeem() != null && request.getPointsToRedeem() > 0) {
            BigDecimal pointsValue = BigDecimal.valueOf(request.getPointsToRedeem() * 1000L);
            discount = discount.add(pointsValue);
        }

        BigDecimal grandTotal = subtotal.subtract(discount);
        if (grandTotal.compareTo(BigDecimal.ZERO) < 0) {
            grandTotal = BigDecimal.ZERO;
        }

        // Update Order status to PAID
        order.setStatus("PAID");
        orderRepository.save(order);

        // Reset dining table to CLEANING
        if (order.getDiningTable() != null) {
            DiningTable table = order.getDiningTable();
            table.setStatus("CLEANING");
            diningTableRepository.save(table);
        }

        // Create Invoice Record
        String invNumber = "INV-" + System.currentTimeMillis() % 1000000;
        BigDecimal vatAmount = grandTotal.multiply(new BigDecimal("0.08")); // 8% VAT
        
        Invoice invoice = Invoice.builder()
                .order(order)
                .invoiceNumber(invNumber)
                .customerName(order.getCustomer() != null ? order.getCustomer().getFullName() : "Khách tại bàn")
                .customerPhone(order.getCustomer() != null ? order.getCustomer().getPhone() : "")
                .subtotal(subtotal)
                .discountAmount(discount)
                .vatAmount(vatAmount)
                .grandTotal(grandTotal)
                .paymentMethod(request.getPaymentMethod())
                .issuedAt(LocalDateTime.now())
                .build();
        invoiceRepository.save(invoice);

        // Add Loyalty points to Customer (10,000 VND = 1 point)
        if (order.getCustomer() != null) {
            Optional<Customer> custOpt = customerRepository.findByEmail(order.getCustomer().getEmail());
            if (custOpt.isPresent()) {
                Customer cust = custOpt.get();
                int earnedPoints = grandTotal.divide(new BigDecimal("10000"), 0, java.math.RoundingMode.DOWN).intValue();
                int newPoints = cust.getPoints() + earnedPoints;
                if (request.getPointsToRedeem() != null && request.getPointsToRedeem() > 0) {
                    newPoints = Math.max(0, newPoints - request.getPointsToRedeem());
                }
                cust.setPoints(newPoints);
                customerRepository.save(cust);
            }
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        List<InvoiceDTO.InvoiceItemDTO> itemDTOs = items.stream()
                .map(i -> InvoiceDTO.InvoiceItemDTO.builder()
                        .dishName(i.getDish() != null ? i.getDish().getName() : "Món ăn")
                        .quantity(i.getQuantity())
                        .unitPrice(i.getPrice())
                        .lineTotal(i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                        .note(i.getNote())
                        .build())
                .collect(Collectors.toList());

        return InvoiceDTO.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .orderId(order.getId())
                .customerName(invoice.getCustomerName())
                .customerPhone(invoice.getCustomerPhone())
                .subtotal(subtotal)
                .discountAmount(discount)
                .vatAmount(vatAmount)
                .grandTotal(grandTotal)
                .paymentMethod(request.getPaymentMethod())
                .issuedAt(invoice.getIssuedAt())
                .items(itemDTOs)
                .build();
    }

    @Override
    public Map<String, Object> applyVoucher(String voucherCode, BigDecimal orderAmount) {
        Map<String, Object> res = new HashMap<>();
        if ("VIP10".equalsIgnoreCase(voucherCode)) {
            BigDecimal discount = orderAmount.multiply(new BigDecimal("0.10"));
            res.put("valid", true);
            res.put("voucherCode", "VIP10");
            res.put("discountAmount", discount);
            res.put("message", "Áp dụng Voucher giảm 10% thành công!");
        } else if ("DISCOUNT50K".equalsIgnoreCase(voucherCode)) {
            BigDecimal discount = new BigDecimal("50000");
            res.put("valid", true);
            res.put("voucherCode", "DISCOUNT50K");
            res.put("discountAmount", discount);
            res.put("message", "Áp dụng Voucher giảm 50.000 VNĐ thành công!");
        } else {
            res.put("valid", false);
            res.put("discountAmount", BigDecimal.ZERO);
            res.put("message", "Mã Voucher không hợp lệ hoặc đã hết hạn!");
        }
        return res;
    }

    @Override
    public Map<String, Object> processCustomerPoints(String customerEmail, Integer points, String action) {
        Map<String, Object> res = new HashMap<>();
        Optional<Customer> custOpt = customerRepository.findByEmail(customerEmail);
        if (custOpt.isEmpty()) {
            throw new ApiException("Không tìm thấy thẻ thành viên khách hàng: " + customerEmail, HttpStatus.NOT_FOUND);
        }

        Customer cust = custOpt.get();
        if ("ADD".equalsIgnoreCase(action)) {
            cust.setPoints(cust.getPoints() + points);
            res.put("message", "Đã cộng +" + points + " điểm thưởng cho khách hàng " + cust.getFullName());
        } else if ("REDEEM".equalsIgnoreCase(action)) {
            if (cust.getPoints() < points) {
                throw new ApiException("Số điểm tích lũy (" + cust.getPoints() + ") không đủ để quy đổi " + points + " điểm", HttpStatus.BAD_REQUEST);
            }
            cust.setPoints(cust.getPoints() - points);
            res.put("message", "Đã quy đổi " + points + " điểm thưởng cho khách hàng " + cust.getFullName());
        }
        customerRepository.save(cust);

        res.put("customerName", cust.getFullName());
        res.put("email", cust.getEmail());
        res.put("currentPoints", cust.getPoints());
        return res;
    }

    @Override
    @Transactional(readOnly = true)
    public CashierShiftReportDTO getShiftReport(String cashierEmail) {
        List<Invoice> invoices = invoiceRepository.findAll();
        BigDecimal totalRevenue = invoices.stream()
                .map(Invoice::getGrandTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal cash = invoices.stream()
                .filter(i -> "CASH".equalsIgnoreCase(i.getPaymentMethod()))
                .map(Invoice::getGrandTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal qr = invoices.stream()
                .filter(i -> "QR".equalsIgnoreCase(i.getPaymentMethod()))
                .map(Invoice::getGrandTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal vnpay = invoices.stream()
                .filter(i -> "VNPAY".equalsIgnoreCase(i.getPaymentMethod()))
                .map(Invoice::getGrandTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal momo = invoices.stream()
                .filter(i -> "MOMO".equalsIgnoreCase(i.getPaymentMethod()))
                .map(Invoice::getGrandTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal card = invoices.stream()
                .filter(i -> "CARD".equalsIgnoreCase(i.getPaymentMethod()))
                .map(Invoice::getGrandTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CashierShiftReportDTO.builder()
                .cashierName("Nguyễn Thị Mai (Thu Ngân)")
                .totalRevenue(totalRevenue)
                .totalInvoices(invoices.size())
                .cashTotal(cash)
                .qrTotal(qr)
                .vnpayTotal(vnpay)
                .momoTotal(momo)
                .cardTotal(card)
                .shiftStartTime(LocalDateTime.now().minusHours(4))
                .build();
    }

    private OrderHistoryDTO mapToDTO(Order order, List<OrderItem> items) {
        List<OrderHistoryDTO.OrderItemDetail> itemDetails = items.stream()
                .map(i -> {
                    BigDecimal price = i.getPrice() != null ? i.getPrice() : BigDecimal.ZERO;
                    if (price.compareTo(new BigDecimal("1000")) < 0 && price.compareTo(BigDecimal.ZERO) > 0) {
                        price = price.multiply(new BigDecimal("10000")); // e.g. 45.00 -> 450,000 VND
                    }
                    BigDecimal lineTotal = price.multiply(BigDecimal.valueOf(i.getQuantity()));
                    return OrderHistoryDTO.OrderItemDetail.builder()
                            .dishId(i.getDish() != null ? i.getDish().getId() : null)
                            .dishName(i.getDish() != null ? i.getDish().getName() : "Món ăn L'Étoile")
                            .quantity(i.getQuantity())
                            .price(price)
                            .note(i.getNote())
                            .lineTotal(lineTotal)
                            .build();
                })
                .collect(Collectors.toList());

        BigDecimal totalAmt = itemDetails.stream()
                .map(OrderHistoryDTO.OrderItemDetail::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalAmt.compareTo(BigDecimal.ZERO) == 0 && order.getTotalAmount() != null) {
            totalAmt = order.getTotalAmount();
            if (totalAmt.compareTo(new BigDecimal("1000")) < 0 && totalAmt.compareTo(BigDecimal.ZERO) > 0) {
                totalAmt = totalAmt.multiply(new BigDecimal("10000"));
            }
        }

        String cName = order.getCustomer() != null ? order.getCustomer().getFullName() : "David Beckham";
        String tName = order.getDiningTable() != null ? order.getDiningTable().getTableNumber() : "Bàn 102";

        return OrderHistoryDTO.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus())
                .totalAmount(totalAmt)
                .customerName(cName)
                .tableName(tName)
                .items(itemDetails)
                .build();
    }
}
