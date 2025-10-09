package com.hms.user.util;

import java.time.LocalDateTime;

public record ErrorInfo(Long errorCode, String errorMessage, LocalDateTime timestamp) {
}