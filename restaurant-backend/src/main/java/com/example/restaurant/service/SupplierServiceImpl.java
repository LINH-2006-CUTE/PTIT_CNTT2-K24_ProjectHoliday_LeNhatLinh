package com.example.restaurant.service;

import com.example.restaurant.entity.Supplier;
import com.example.restaurant.entity.PurchaseOrder;
import com.example.restaurant.entity.PurchaseOrderItem;
import com.example.restaurant.entity.Ingredient;
import com.example.restaurant.dto.SupplierRequest;
import com.example.restaurant.dto.PurchaseOrderRequest;
import com.example.restaurant.dto.PurchaseOrderItemRequest;
import com.example.restaurant.dto.IngredientStockRequest;
import com.example.restaurant.repository.SupplierRepository;
import com.example.restaurant.repository.PurchaseOrderRepository;
import com.example.restaurant.repository.PurchaseOrderItemRepository;
import com.example.restaurant.repository.IngredientRepository;
import com.example.restaurant.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;

@Service
@Transactional
public class SupplierServiceImpl implements SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private PurchaseOrderItemRepository purchaseOrderItemRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    @Autowired
    private InventoryService inventoryService;

    @Override
    @Transactional(readOnly = true)
    public Page<Supplier> getSuppliers(String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            return supplierRepository.searchSuppliers(search.trim(), pageable);
        }
        return supplierRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ApiException("Nhà cung cấp không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));
    }

    @Override
    public Supplier createSupplier(SupplierRequest request) {
        if (supplierRepository.findByCompany(request.getCompany()).isPresent()) {
            throw new IllegalArgumentException("Nhà cung cấp này đã tồn tại: " + request.getCompany());
        }
        Supplier supplier = Supplier.builder()
                .company(request.getCompany())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .build();
        return supplierRepository.save(supplier);
    }

    @Override
    public Supplier updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = getSupplierById(id);
        
        supplierRepository.findByCompany(request.getCompany()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Tên công ty/nhà cung cấp đã trùng lặp.");
            }
        });

        supplier.setCompany(request.getCompany());
        supplier.setPhone(request.getPhone());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        return supplierRepository.save(supplier);
    }

    @Override
    public void deleteSupplier(Long id) {
        Supplier supplier = getSupplierById(id);
        supplierRepository.delete(supplier);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseOrder> getPurchaseOrders(String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            return purchaseOrderRepository.searchPurchaseOrders(search.trim(), pageable);
        }
        return purchaseOrderRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrder getPurchaseOrderById(Long id) {
        return purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ApiException("Đơn mua hàng không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));
    }

    @Override
    public PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request) {
        Supplier supplier = getSupplierById(request.getSupplierId());

        PurchaseOrder po = PurchaseOrder.builder()
                .supplier(supplier)
                .orderDate(LocalDateTime.now())
                .status("PENDING")
                .totalAmount(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        po = purchaseOrderRepository.save(po);

        BigDecimal sum = BigDecimal.ZERO;
        for (PurchaseOrderItemRequest itemReq : request.getItems()) {
            Ingredient ing = ingredientRepository.findById(itemReq.getIngredientId())
                    .orElseThrow(() -> new ApiException("Nguyên liệu không tồn tại: " + itemReq.getIngredientId(), HttpStatus.NOT_FOUND));

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(po)
                    .ingredient(ing)
                    .quantity(itemReq.getQuantity())
                    .price(itemReq.getPrice())
                    .build();

            purchaseOrderItemRepository.save(item);
            po.getItems().add(item);

            BigDecimal linePrice = itemReq.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
            sum = sum.add(linePrice);
        }

        po.setTotalAmount(sum);
        return purchaseOrderRepository.save(po);
    }

    @Override
    public PurchaseOrder updatePurchaseOrderStatus(Long id, String status) {
        PurchaseOrder po = getPurchaseOrderById(id);
        String oldStatus = po.getStatus();

        if (oldStatus.equals(status)) {
            return po;
        }

        po.setStatus(status);
        po = purchaseOrderRepository.save(po);

        // Linkage flow: if transitioning to DELIVERED or COMPLETED, perform STOCK_IN automatically!
        if ((status.equalsIgnoreCase("DELIVERED") || status.equalsIgnoreCase("COMPLETED"))
                && !oldStatus.equalsIgnoreCase("DELIVERED") && !oldStatus.equalsIgnoreCase("COMPLETED")) {
            for (PurchaseOrderItem item : po.getItems()) {
                IngredientStockRequest stockInReq = IngredientStockRequest.builder()
                        .quantity(item.getQuantity())
                        .unitPrice(item.getPrice())
                        .supplierName(po.getSupplier().getCompany())
                        .note("Nhập kho tự động từ Đơn mua hàng PO-" + po.getId() + " (NCC: " + po.getSupplier().getCompany() + ")")
                        .build();
                inventoryService.stockIn(item.getIngredient().getId(), stockInReq);
            }
        }

        return po;
    }
}
