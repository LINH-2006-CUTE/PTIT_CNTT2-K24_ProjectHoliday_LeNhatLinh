package com.example.restaurant.service;

import com.example.restaurant.entity.Customer;
import com.example.restaurant.dto.CustomerRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

    Page<Customer> getCustomers(String search, Pageable pageable);

    Customer getCustomerById(Long id);

    Customer getCustomerByPhone(String phone);

    Customer createCustomer(CustomerRequest request);

    Customer updateCustomer(Long id, CustomerRequest request);

    void deleteCustomer(Long id);

    Customer addPoints(Long id, Integer points);
}
