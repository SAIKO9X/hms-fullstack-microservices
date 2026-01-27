package com.hms.notification.controllers;

import com.hms.notification.entities.Notification;
import com.hms.notification.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

  private final NotificationService notificationService;

  @GetMapping("/user/{userId}")
  public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
    return ResponseEntity.ok(notificationService.getUserNotifications(userId));
  }

  @PatchMapping("/{id}/read")
  public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
    notificationService.markAsRead(id);
    return ResponseEntity.noContent().build();
  }

  @PatchMapping("/user/{userId}/read-all")
  public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
    notificationService.markAllAsRead(userId);
    return ResponseEntity.noContent().build();
  }
}