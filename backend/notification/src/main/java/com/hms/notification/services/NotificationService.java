package com.hms.notification.services;

import com.hms.common.exceptions.ResourceNotFoundException;
import com.hms.notification.dto.response.NotificationResponse;
import com.hms.notification.entities.Notification;
import com.hms.notification.repositories.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

  private final NotificationRepository notificationRepository;

  public void sendNotification(Notification notification) {
    notificationRepository.save(notification);
  }

  public List<NotificationResponse> getUserNotifications(String recipientId) {
    return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId)
      .stream()
      .map(this::mapToResponse)
      .collect(Collectors.toList());
  }

  @Transactional
  public void markAsRead(Long notificationId) {
    Notification notification = notificationRepository.findById(notificationId)
      .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));

    notification.setRead(true);
    notificationRepository.save(notification);
  }

  @Transactional
  public void markAllAsRead(String recipientId) {
    List<Notification> list = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(recipientId);
    list.forEach(n -> n.setRead(true));
    notificationRepository.saveAll(list);
  }

  private NotificationResponse mapToResponse(Notification notification) {
    return new NotificationResponse(
      notification.getId(),
      notification.getTitle(),
      notification.getMessage(),
      notification.getType(),
      notification.isRead(),
      notification.getCreatedAt()
    );
  }
}