package com.hms.appointment;

import com.hms.appointment.services.AppointmentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;

import java.util.Objects;

import static com.github.tomakehurst.wiremock.client.WireMock.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

public class AppointmentCacheIntegrationTest extends BaseIntegrationTest {

  @Autowired
  private AppointmentService appointmentService;

  @Autowired
  private CacheManager cacheManager;

  @Test
  void shouldEvictCache_WhenAppointmentStatusIsUpdated() {
    String cacheName = "appointments";
    Long doctorUserId = 1L;
    Long appointmentId = 99L;

    stubFor(get(urlEqualTo("/profile/doctors/by-user/" + doctorUserId))
      .willReturn(aResponse()
        .withStatus(200)
        .withHeader("Content-Type", "application/json")
        .withBody("""
              {
                  "success": true,
                  "message": "Doctor retrieved successfully",
                  "data": {
                      "id": 100,
                      "userId": 1,
                      "name": "Dr. Gregory House",
                      "specialization": "Diagnóstico"
                  }
              }
          """)));

    appointmentService.getAppointmentDetailsForDoctor(doctorUserId, "all");

    assertNotNull(cacheManager.getCache(cacheName));

    try {
      appointmentService.completeAppointment(appointmentId, "Consulta finalizada", doctorUserId);
    } catch (Exception e) {
      // ignora a exceção pois o agendamento 99 não existe no BD de teste.
    }

    assertNull(Objects.requireNonNull(cacheManager.getCache(cacheName)).get(doctorUserId));
  }
}