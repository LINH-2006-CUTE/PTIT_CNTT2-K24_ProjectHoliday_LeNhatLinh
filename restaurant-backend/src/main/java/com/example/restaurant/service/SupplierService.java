package com.example.restaurant.service;

import com.example.restaurant.entity.Supplier;
import com.example.restaurant.entity.PurchaseOrder;
import com.example.restaurant.dto.SupplierRequest;
import com.example.restaurant.dto.PurchaseOrderRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SupplierService {

    Page<Supplier> getSuppliers(String search, Pageable pageable);

    Supplier getSupplierById(Long id);

    Supplier createSupplier(SupplierRequest request);

    Supplier updateSupplier(Long id, SupplierRequest request);

    void deleteSupplier(Long id);

    Page<PurchaseOrder> getPurchaseOrders(String search, Pageable pageable);

    PurchaseOrder getPurchaseOrderById(Long id);

    PurchaseOrder createPurchaseOrder(PurchaseOrderRequest request);

    PurchaseOrder updatePurchaseOrderStatus(Long id, String status);
}
