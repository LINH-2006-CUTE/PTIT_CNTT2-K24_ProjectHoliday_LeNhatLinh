package com.example.restaurant.service;

public interface MailService {
    void sendOtpEmail(String toEmail, String otpCode);
}
