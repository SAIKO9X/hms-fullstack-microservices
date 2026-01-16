import api from "@/config/axios";
import type { AppointmentFormData } from "@/lib/schemas/appointment.schema";
import type { Appointment, AppointmentStats } from "@/types/appointment.types";
import type { Page } from "@/types/pagination.types";
import type { MedicalHistory, PatientProfile } from "@/types/patient.types";
import type { Prescription } from "@/types/record.types";

// Buscar consultas como paciente
export const getMyAppointments = async (
  page = 0,
  size = 10
): Promise<Page<Appointment>> => {
  const { data } = await api.get(
    `/appointments/patient?page=${page}&size=${size}`
  );
  return data;
};

// Criar nova consulta
export const createAppointment = async (
  appointmentData: AppointmentFormData
): Promise<Appointment> => {
  const { data } = await api.post("/appointments/patient", appointmentData);
  return data;
};

// Buscar a próxima consulta do paciente logado
export const getNextAppointment = async (): Promise<Appointment | null> => {
  try {
    const { data } = await api.get("/appointments/patient/next");
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

// Buscar estatísticas de agendamentos do paciente logado
export const getAppointmentStats = async (): Promise<AppointmentStats> => {
  const { data } = await api.get("/appointments/patient/stats");
  return data;
};

// Buscar prescrição mais recente do paciente logado
export const getLatestPrescription = async (): Promise<Prescription | null> => {
  try {
    const { data } = await api.get("/prescriptions/patient/latest");
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

// Buscar histórico de prescrições do paciente logado
export const getMyPrescriptionsHistory = async (
  page = 0,
  size = 10
): Promise<Page<Prescription>> => {
  const { data } = await api.get(
    `/prescriptions/patient/my-history?page=${page}&size=${size}`
  );
  return data;
};

// Buscar histórico médico do paciente
export const getMedicalHistory = async (
  patientId: number
): Promise<MedicalHistory> => {
  const response = await api.get<MedicalHistory>(
    `/profile/patient/medical-history/${patientId}`
  );
  return response.data;
};

// Buscar perfil do paciente por ID
export const getPatientById = async (id: number): Promise<PatientProfile> => {
  const { data } = await api.get<PatientProfile>(`/profile/patients/${id}`);
  return data;
};
