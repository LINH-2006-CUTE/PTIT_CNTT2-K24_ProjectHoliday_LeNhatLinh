package com.example.restaurant.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class MailServiceImpl implements MailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        log.info("=========================================");
        log.info("OTP FOR EMAIL {}: {}", toEmail, otpCode);
        log.info("=========================================");

        if (mailSender == null) {
            log.warn("JavaMailSender bean is not active. OTP email sending skipped.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Restaurant Management System - Password Reset OTP");
            message.setText("Dear Customer,\n\nYour OTP for resetting your password is: " + otpCode + 
                "\nThis OTP is valid for 5 minutes.\n\nBest regards,\nRestaurant Management System");
            mailSender.send(message);
            log.info("OTP email successfully sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}. (See the OTP logged above to continue testing)", toEmail, e.getMessage());
        }
    }
}
