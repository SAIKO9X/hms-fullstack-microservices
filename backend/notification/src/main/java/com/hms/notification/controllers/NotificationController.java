package com.hms.notification.controllers;

import com.hms.common.dto.response.ApiResponse;
import com.hms.notification.dto.response.NotificationResponse;
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
  public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUserNotifications(@PathVariable String userId) {
    return ResponseEntity.ok(ApiResponse.success(notificationService.getUserNotifications(userId)));
  }

  @PatchMapping("/{id}/read")
  public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
    notificationService.markAsRead(id);
    return ResponseEntity.ok(ApiResponse.success(null, "Notificação marcada como lida."));
  }

  @PatchMapping("/user/{userId}/read-all")
  public ResponseEntity<ApiResponse<Void>> markAllAsRead(@PathVariable String userId) {
    notificationService.markAllAsRead(userId);
    return ResponseEntity.ok(ApiResponse.success(null, "Todas as notificações marcadas como lidas."));
  }
}