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
            message.setSubject("L'ÉCLAT Restaurant - Mã OTP Đặt Lại Mật Khẩu");
            message.setText(
                "Kính gửi Quý khách,\n\n" +
                "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại L'ÉCLAT Restaurant.\n\n" +
                "Mã OTP xác minh của bạn là:\n\n" +
                "    " + otpCode + "\n\n" +
                "Mã này có hiệu lực trong 5 phút.\n\n" +
                "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n" +
                "Mật khẩu của bạn sẽ không bị thay đổi.\n\n" +
                "Trân trọng,\n" +
                "Đội ngũ hỗ trợ L'ÉCLAT Restaurant"
            );
            mailSender.send(message);
            log.info("Email OTP đã được gửi thành công đến {}", toEmail);
        } catch (Exception e) {
            log.error("Không thể gửi email OTP đến {}: {}. (Xem mã OTP trong log bên trên để tiếp tục kiểm tra)", toEmail, e.getMessage());
        }
    }
}
