package com.hms.appointment.docs;

import com.hms.appointment.dto.request.AppointmentCreateRequest;
import com.hms.appointment.dto.response.AppointmentResponse;
import com.hms.appointment.dto.response.AppointmentStatsResponse;
import com.hms.appointment.repositories.DoctorSummaryProjection;
import com.hms.common.dto.response.PagedResponse;
import com.hms.common.dto.response.ResponseWrapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Tag(name = "Consultas do Paciente", description = "Endpoints para agendamento e gerenciamento de consultas pelo paciente (Requer PATIENT)")
@SecurityRequirement(name = "bearerAuth")
@ApiResponses({
  @ApiResponse(responseCode = "401", description = "Não autorizado (Token ausente ou inválido)", content = @Content),
  @ApiResponse(responseCode = "403", description = "Proibido (Sem permissão para esta ação)", content = @Content),
  @ApiResponse(responseCode = "500", description = "Erro interno no servidor", content = @Content)
})
public interface PatientAppointmentControllerDocs {

  @Operation(summary = "Agendar consulta", description = "Cria um novo agendamento de consulta para o paciente autenticado.")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "Consulta agendada com sucesso"),
    @ApiResponse(responseCode = "400", description = "Dados inválidos de requisição", content = @Content),
    @ApiResponse(responseCode = "404", description = "Médico ou horário não encontrado", content = @Content),
    @ApiResponse(responseCode = "409", description = "Conflito de horário", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AppointmentResponse>> createAppointment(
    @Parameter(hidden = true) Authentication authentication,
    @Valid @RequestBody AppointmentCreateRequest request
  );

  @Operation(summary = "Listar meus médicos", description = "Retorna a lista de médicos com quem o paciente autenticado já teve consultas.")
  @ApiResponse(responseCode = "200", description = "Lista de médicos retornada com sucesso")
  ResponseEntity<ResponseWrapper<List<DoctorSummaryProjection>>> getMyDoctors(
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Listar minhas consultas", description = "Retorna o histórico paginado de consultas do paciente autenticado.")
  @ApiResponse(responseCode = "200", description = "Lista de consultas retornada com sucesso")
  ResponseEntity<ResponseWrapper<PagedResponse<AppointmentResponse>>> getMyAppointments(
    @Parameter(hidden = true) Authentication authentication,
    @Parameter(hidden = true) Pageable pageable
  );

  @Operation(summary = "Próxima consulta", description = "Retorna a próxima consulta agendada do paciente autenticado.")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Próxima consulta retornada com sucesso"),
    @ApiResponse(responseCode = "404", description = "Nenhuma consulta futura encontrada", content = @Content)
  })
  ResponseEntity<ResponseWrapper<AppointmentResponse>> getNextAppointment(
    @Parameter(hidden = true) Authentication authentication
  );

  @Operation(summary = "Estatísticas de consultas", description = "Retorna um resumo estatístico das consultas do paciente autenticado.")
  @ApiResponse(responseCode = "200", description = "Estatísticas retornadas com sucesso")
  ResponseEntity<ResponseWrapper<AppointmentStatsResponse>> getAppointmentStats(
    @Parameter(hidden = true) Authentication authentication
  );
}
