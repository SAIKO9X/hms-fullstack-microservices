package com.hms.notification.services;

import com.hms.notification.entities.Notification;
import com.hms.notification.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

  private final NotificationRepository notificationRepository;

  public List<Notification> getUserNotifications(Long userId) {
    return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
  }

  @Transactional
  public void markAsRead(Long notificationId) {
    notificationRepository.findById(notificationId).ifPresent(notification -> {
      notification.setRead(true);
      notificationRepository.save(notification);
    });
  }

  @Transactional
  public void markAllAsRead(Long userId) {
    List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    list.forEach(n -> n.setRead(true));
    notificationRepository.saveAll(list);
  }
}