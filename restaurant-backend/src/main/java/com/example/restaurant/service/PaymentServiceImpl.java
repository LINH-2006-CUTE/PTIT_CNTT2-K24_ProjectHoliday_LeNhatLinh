package com.example.restaurant.service;

import com.example.restaurant.dto.InvoiceDTO;
import com.example.restaurant.dto.PaymentRequest;
import com.example.restaurant.entity.*;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private PromotionService promotionService;

    @Autowired
    private DiningTableRepository diningTableRepository;

    @Override
    public InvoiceDTO processPayment(PaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ApiException("Không tìm thấy đơn hàng #" + request.getOrderId(), HttpStatus.NOT_FOUND));

        if ("CANCELLED".equalsIgnoreCase(order.getStatus())) {
            throw new ApiException("Không thể thanh toán đơn hàng đã bị hủy", HttpStatus.BAD_REQUEST);
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        BigDecimal subtotal = items.stream()
                .map(i -> i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Voucher Calculation
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            try {
                discountAmount = promotionService.calculateDiscount(request.getVoucherCode().trim(), subtotal);
            } catch (Exception e) {
                discountAmount = BigDecimal.ZERO;
            }
        }

        BigDecimal taxableAmount = subtotal.subtract(discountAmount);
        if (taxableAmount.compareTo(BigDecimal.ZERO) < 0) taxableAmount = BigDecimal.ZERO;

        // 5% Service Fee
        BigDecimal serviceFee = taxableAmount.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        // 8% VAT Tax
        BigDecimal vatAmount = taxableAmount.multiply(new BigDecimal("0.08")).setScale(2, RoundingMode.HALF_UP);

        BigDecimal grandTotal = taxableAmount.add(serviceFee).add(vatAmount);

        // Save Payment record
        String txnId = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(request.getPaymentMethod())
                .amount(grandTotal)
                .transactionId(txnId)
                .paymentStatus("SUCCESS")
                .paymentTime(LocalDateTime.now())
                .notes(request.getNotes())
                .build();
        paymentRepository.save(payment);

        // Update Order status
        order.setStatus("PAID");
        orderRepository.save(order);

        // Auto release table status back to AVAILABLE upon payment completion
        if (order.getDiningTable() != null) {
            DiningTable t = order.getDiningTable();
            t.setStatus("AVAILABLE");
            diningTableRepository.save(t);
        }

        // Generate Invoice
        String invNumber = "INV-" + LocalDateTime.now().getYear() + "-" + String.format("%06d", order.getId());
        String custName = order.getCustomer() != null ? order.getCustomer().getFullName() : "Khách hàng";
        String custPhone = order.getCustomer() != null ? order.getCustomer().getPhone() : "";

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invNumber)
                .order(order)
                .customerName(custName)
                .customerPhone(custPhone)
                .subtotal(subtotal)
                .discountAmount(discountAmount)
                .serviceFee(serviceFee)
                .vatAmount(vatAmount)
                .grandTotal(grandTotal)
                .paymentMethod(request.getPaymentMethod())
                .issuedAt(LocalDateTime.now())
                .build();

        invoice = invoiceRepository.save(invoice);

        List<InvoiceDTO.InvoiceItemDTO> itemDTOs = items.stream()
                .map(i -> {
                    BigDecimal lineTot = i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity()));
                    return InvoiceDTO.InvoiceItemDTO.builder()
                            .dishName(i.getDish() != null ? i.getDish().getName() : "Món ăn")
                            .quantity(i.getQuantity())
                            .unitPrice(i.getPrice())
                            .lineTotal(lineTot)
                            .note(i.getNote())
                            .build();
                })
                .collect(Collectors.toList());

        return InvoiceDTO.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .orderId(order.getId())
                .customerName(invoice.getCustomerName())
                .customerPhone(invoice.getCustomerPhone())
                .subtotal(invoice.getSubtotal())
                .discountAmount(invoice.getDiscountAmount())
                .serviceFee(invoice.getServiceFee())
                .vatAmount(invoice.getVatAmount())
                .grandTotal(invoice.getGrandTotal())
                .paymentMethod(invoice.getPaymentMethod())
                .issuedAt(invoice.getIssuedAt())
                .items(itemDTOs)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceDTO getInvoiceByOrderId(Long orderId) {
        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ApiException("Chưa có hóa đơn Invoice cho đơn hàng #" + orderId, HttpStatus.NOT_FOUND));

        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        List<InvoiceDTO.InvoiceItemDTO> itemDTOs = items.stream()
                .map(i -> {
                    BigDecimal lineTot = i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity()));
                    return InvoiceDTO.InvoiceItemDTO.builder()
                            .dishName(i.getDish() != null ? i.getDish().getName() : "Món ăn")
                            .quantity(i.getQuantity())
                            .unitPrice(i.getPrice())
                            .lineTotal(lineTot)
                            .note(i.getNote())
                            .build();
                })
                .collect(Collectors.toList());

        return InvoiceDTO.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .orderId(orderId)
                .customerName(invoice.getCustomerName())
                .customerPhone(invoice.getCustomerPhone())
                .subtotal(invoice.getSubtotal())
                .discountAmount(invoice.getDiscountAmount())
                .serviceFee(invoice.getServiceFee())
                .vatAmount(invoice.getVatAmount())
                .grandTotal(invoice.getGrandTotal())
                .paymentMethod(invoice.getPaymentMethod())
                .issuedAt(invoice.getIssuedAt())
                .items(itemDTOs)
                .build();
    }
}
