// Enum para status da consulta (deve coincidir com o backend)
export type AppointmentStatus =
  | "SCHEDULED" // Agendada
  | "COMPLETED" // Concluída
  | "CANCELED" // Cancelada
  | "NO_SHOW"; // Não compareceu

// Interface principal da consulta (baseada na resposta do backend)
export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  doctorName?: string;
  appointmentDateTime: string; // ISO string format
  reason: string;
  status: AppointmentStatus;
  notes?: string | null;
}

// Interface para consulta com detalhes agregados (quando precisar de nomes)
export interface AppointmentDetail {
  id: number;
  patientId: number;
  patientName: string;
  patientPhoneNumber: string;
  doctorId: number;
  doctorName: string;
  appointmentDateTime: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
}

// Interface para dados do formulário (antes da transformação)
export interface AppointmentFormInput {
  doctorId: string; // String no form, será convertido para number
  appointmentDate: Date;
  appointmentTime: string; // "HH:mm" format
  reason: string;
}

// Interface para dados enviados para o backend (após transformação)
export interface AppointmentCreateRequest {
  doctorId: number;
  appointmentDateTime: string; // ISO string
  reason: string;
}

// Interface para atualização de consulta
export interface AppointmentUpdateRequest {
  appointmentDateTime?: string;
  notes?: string;
}
