package com.hms.common.dto.event;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventEnvelope<T> {
  private String eventId;
  private String eventType;
  private String version;
  private LocalDateTime occurredAt;
  private String correlationId;
  private T payload;

  // Factory method para criar envelopes de forma consistente
  public static <T> EventEnvelope<T> create(String eventType, String correlationId, T payload) {
    return EventEnvelope.<T>builder()
      .eventId(UUID.randomUUID().toString())
      .eventType(eventType)
      .version("v1")
      .occurredAt(LocalDateTime.now())
      .correlationId(correlationId != null ? correlationId : UUID.randomUUID().toString())
      .payload(payload)
      .build();
  }
}