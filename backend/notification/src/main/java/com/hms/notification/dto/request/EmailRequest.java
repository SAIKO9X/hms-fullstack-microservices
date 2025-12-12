package com.hms.notification.dto.request;

import java.io.Serializable;

public record EmailRequest(
  String to,
  String subject,
  String body
) implements Serializable {
}