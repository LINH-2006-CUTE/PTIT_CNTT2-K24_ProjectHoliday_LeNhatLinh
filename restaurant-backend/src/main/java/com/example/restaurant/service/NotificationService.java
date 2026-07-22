package com.example.restaurant.service;

import com.example.restaurant.entity.Notification;

import java.util.List;

public interface NotificationService {

    Notification createNotification(String email, String title, String message, String type);

    List<Notification> getNotifications(String email);

    Notification markAsRead(Long id);

    void markAllAsRead(String email);

    void deleteNotification(Long id);
}
