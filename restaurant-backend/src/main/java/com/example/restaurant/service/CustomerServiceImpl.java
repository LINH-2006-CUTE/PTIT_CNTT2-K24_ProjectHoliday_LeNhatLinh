package com.example.restaurant.service;

import com.example.restaurant.entity.Customer;
import com.example.restaurant.dto.CustomerRequest;
import com.example.restaurant.repository.CustomerRepository;
import com.example.restaurant.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CustomerServiceImpl implements CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<Customer> getCustomers(String search, Pageable pageable) {
        if (search != null && !search.trim().isEmpty()) {
            return customerRepository.searchCustomers(search.trim(), pageable);
        }
        return customerRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ApiException("Khách hàng không tồn tại với ID: " + id, HttpStatus.NOT_FOUND));
    }

    @Override
    @Transactional(readOnly = true)
    public Customer getCustomerByPhone(String phone) {
        return customerRepository.findByPhone(phone.trim())
                .orElseThrow(() -> new ApiException("Khách hàng không tồn tại với SĐT: " + phone, HttpStatus.NOT_FOUND));
    }

    @Override
    public Customer createCustomer(CustomerRequest request) {
        if (customerRepository.findByPhone(request.getPhone().trim()).isPresent()) {
            throw new IllegalArgumentException("Khách hàng với số điện thoại này đã tồn tại.");
        }

        int initialPoints = request.getPoints() != null ? request.getPoints() : 0;
        Customer customer = Customer.builder()
                .fullName(request.getFullName().trim())
                .phone(request.getPhone().trim())
                .email(request.getEmail() != null ? request.getEmail().trim() : null)
                .membership(request.getMembership() != null ? request.getMembership() : false)
                .points(initialPoints)
                .rank(calculateRank(initialPoints))
                .build();

        return customerRepository.save(customer);
    }

    @Override
    public Customer updateCustomer(Long id, CustomerRequest request) {
        Customer customer = getCustomerById(id);

        customerRepository.findByPhone(request.getPhone().trim()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("Số điện thoại này đã được sử dụng bởi khách hàng khác.");
            }
        });

        customer.setFullName(request.getFullName().trim());
        customer.setPhone(request.getPhone().trim());
        customer.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        customer.setMembership(request.getMembership() != null ? request.getMembership() : false);
        
        if (request.getPoints() != null) {
            customer.setPoints(request.getPoints());
            customer.setRank(calculateRank(request.getPoints()));
        }

        return customerRepository.save(customer);
    }

    @Override
    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
    }

    @Override
    public Customer addPoints(Long id, Integer additionalPoints) {
        Customer customer = getCustomerById(id);
        int oldPoints = customer.getPoints() != null ? customer.getPoints() : 0;
        int newPoints = oldPoints + (additionalPoints != null ? additionalPoints : 0);
        if (newPoints < 0) newPoints = 0;

        customer.setPoints(newPoints);
        customer.setRank(calculateRank(newPoints));
        return customerRepository.save(customer);
    }

    private String calculateRank(int points) {
        if (points >= 2000) return "DIAMOND";
        if (points >= 500) return "GOLD";
        if (points >= 100) return "SILVER";
        return "MEMBER";
    }
}
