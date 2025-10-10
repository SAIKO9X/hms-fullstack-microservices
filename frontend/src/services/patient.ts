import api from "@/config/axios";
import type { AppointmentFormData } from "@/lib/schemas/appointment";
import type { Appointment, AppointmentStats } from "@/types/appointment.types";
import type { MedicalHistory } from "@/types/patient.types";
import type { Prescription } from "@/types/record.types";

// Buscar consultas como paciente
export const getMyAppointments = async (): Promise<Appointment[]> => {
  const { data } = await api.get("/patient/appointments");
  return data;
};

// Criar nova consulta
export const createAppointment = async (
  appointmentData: AppointmentFormData
): Promise<Appointment> => {
  const { data } = await api.post("/patient/appointments", appointmentData);
  return data;
};

// Buscar a próxima consulta do paciente logado
export const getNextAppointment = async (): Promise<Appointment | null> => {
  try {
    const { data } = await api.get("/patient/appointments/next");
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

// Buscar estatísticas de agendamentos do paciente logado
export const getAppointmentStats = async (): Promise<AppointmentStats> => {
  const { data } = await api.get("/patient/appointments/stats");
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
export const getMyPrescriptionsHistory = async (): Promise<Prescription[]> => {
  const { data } = await api.get("/prescriptions/patient/my-history");
  return data;
};

// Buscar histórico médico do paciente
export const getMedicalHistory = async (
  patientId: number
): Promise<MedicalHistory> => {
  const response = await api.get<MedicalHistory>(
    `/profile/patients/${patientId}/medical-history`
  );
  return response.data;
};
