package com.example.restaurant.service;

import com.example.restaurant.entity.Notification;
import com.example.restaurant.exception.ApiException;
import com.example.restaurant.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Override
    public Notification createNotification(String email, String title, String message, String type) {
        Notification notification = Notification.builder()
                .customerEmail(email.trim().toLowerCase())
                .title(title)
                .message(message)
                .type(type != null ? type : "SYSTEM")
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getNotifications(String email) {
        return notificationRepository.findByCustomerEmailOrderByCreatedAtDesc(email.trim().toLowerCase());
    }

    @Override
    public Notification markAsRead(Long id) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ApiException("Không tìm thấy thông báo #" + id, HttpStatus.NOT_FOUND));
        notif.setIsRead(true);
        return notificationRepository.save(notif);
    }

    @Override
    public void markAllAsRead(String email) {
        List<Notification> list = notificationRepository.findByCustomerEmailOrderByCreatedAtDesc(email.trim().toLowerCase());
        list.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(list);
    }

    @Override
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }
}
