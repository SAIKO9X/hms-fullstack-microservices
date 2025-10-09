package com.hms.user.utilities;

import java.time.LocalDateTime;

public record ErrorInfo(Long errorCode, String errorMessage, LocalDateTime timestamp) {
}