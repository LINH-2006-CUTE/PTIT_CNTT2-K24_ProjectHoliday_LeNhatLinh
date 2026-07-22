package com.example.restaurant.service;

import com.example.restaurant.dto.CustomerHomeDTO;
import com.example.restaurant.dto.CustomerReviewRequest;
import com.example.restaurant.entity.CustomerReview;

public interface CustomerHomeService {

    CustomerHomeDTO getHomePageData();

    CustomerReview submitReview(CustomerReviewRequest request);
}
