package com.hms.pharmacy.dto.request;

import java.io.Serializable;

public record EmailRequest(
  String to,
  String subject,
  String body
) implements Serializable {}