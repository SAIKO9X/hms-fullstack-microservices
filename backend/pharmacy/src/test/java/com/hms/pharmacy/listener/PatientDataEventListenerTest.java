package com.hms.pharmacy.listener;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hms.common.dto.event.EventEnvelope;
import com.hms.pharmacy.dto.event.UserCreatedEvent;
import com.hms.pharmacy.entities.PatientReadModel;
import com.hms.pharmacy.repositories.PatientReadModelRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientDataEventListenerTest {

  @Mock
  private PatientReadModelRepository repository;

  private PatientDataEventListener listener;

  @Captor
  private ArgumentCaptor<PatientReadModel> patientCaptor;

  @BeforeEach
  void setUp() {
    // ObjectMapper real para facilitar a conversão no teste
    ObjectMapper objectMapper = new ObjectMapper();
    listener = new PatientDataEventListener(repository, objectMapper);
  }

  @Test
  @DisplayName("Deve criar um novo PatientReadModel quando receber um evento de usuário válido e ele não existir")
  void handleUserCreated_NewUser_ShouldSave() {
    Long userId = 100L;
    UserCreatedEvent eventPayload = new UserCreatedEvent(userId, "João da Silva", "paciente@teste.com", "PATIENT");

    EventEnvelope<UserCreatedEvent> envelope = new EventEnvelope<>();
    envelope.setPayload(eventPayload);

    // simulando que o usuário não existe no banco
    when(repository.findById(userId)).thenReturn(Optional.empty());

    listener.handleUserCreated(envelope);

    // captura o que foi passado para o repository.save()
    verify(repository).save(patientCaptor.capture());
    PatientReadModel savedPatient = patientCaptor.getValue();

    assertEquals(userId, savedPatient.getUserId());
    assertEquals("paciente@teste.com", savedPatient.getEmail());
    assertEquals("João da Silva", savedPatient.getName());
  }

  @Test
  @DisplayName("Deve atualizar um PatientReadModel existente quando o usuário já estiver na base")
  void handleUserCreated_ExistingUser_ShouldUpdate() {
    Long userId = 100L;
    UserCreatedEvent eventPayload = new UserCreatedEvent(userId, "João Atualizado", "novoemail@teste.com", "PATIENT");
    EventEnvelope<UserCreatedEvent> envelope = new EventEnvelope<>();
    envelope.setPayload(eventPayload);

    PatientReadModel existingPatient = new PatientReadModel();
    existingPatient.setUserId(userId);
    existingPatient.setEmail("antigo@teste.com");
    existingPatient.setName("Nome Antigo");

    // simulando que o banco achou o registro
    when(repository.findById(userId)).thenReturn(Optional.of(existingPatient));

    listener.handleUserCreated(envelope);

    verify(repository).save(patientCaptor.capture());
    PatientReadModel savedPatient = patientCaptor.getValue();

    // o objeto modificado deve ser o mesmo que já existia, mas com dados novos
    assertEquals("novoemail@teste.com", savedPatient.getEmail());
    assertEquals("João Atualizado", savedPatient.getName());
  }

  @Test
  @DisplayName("Deve ignorar a mensagem e não acessar o banco se o evento for malformado (userId null)")
  void handleUserCreated_MalformedEvent_ShouldIgnore() {
    UserCreatedEvent eventPayload = new UserCreatedEvent(null, "Nome", "teste@teste.com", "PATIENT");
    EventEnvelope<UserCreatedEvent> envelope = new EventEnvelope<>();
    envelope.setPayload(eventPayload);

    listener.handleUserCreated(envelope);

    // verifica que o repository nunca foi chamado
    verify(repository, never()).findById(any());
    verify(repository, never()).save(any());
  }
}