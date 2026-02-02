package com.hms.common.dto.event;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventEnvelope<T> {

  @Builder.Default
  private String eventId = UUID.randomUUID().toString();

  private String eventType;

  @Builder.Default
  private String version = "v1";

  @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
  @Builder.Default
  private LocalDateTime occurredAt = LocalDateTime.now();

  private String correlationId;

  private T payload;

  // Factory method para facilitar a criação
  public static <T> EventEnvelope<T> create(String eventType, String correlationId, T payload) {
    return EventEnvelope.<T>builder()
      .eventType(eventType)
      .correlationId(correlationId)
      .payload(payload)
      .build();
  }
}