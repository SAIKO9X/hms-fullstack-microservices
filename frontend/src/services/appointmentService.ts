import api from "@/lib/interceptor/AxiosInterceptor";
import type { AppointmentFormData } from "@/lib/schemas/appointment";
import type { Appointment } from "@/types/appointment.types";
import type { DoctorDropdown } from "@/types/doctor.types";

// Buscar minhas consultas como paciente
export const getMyAppointments = async (): Promise<Appointment[]> => {
  const { data } = await api.get("/appointments/patient");
  return data;
};

// Buscar minhas consultas como médico
export const getMyAppointmentsAsDoctor = async (): Promise<Appointment[]> => {
  const { data } = await api.get("/appointments/doctor");
  return data;
};

// Buscar uma consulta específica por ID
export const getAppointmentById = async (id: number): Promise<Appointment> => {
  const { data } = await api.get(`/appointments/${id}`);
  return data;
};

// Criar nova consulta
export const createAppointment = async (
  appointmentData: AppointmentFormData
): Promise<Appointment> => {
  const { data } = await api.post("/appointments", appointmentData);
  return data;
};

// Cancelar consulta
export const cancelAppointment = async (id: number): Promise<Appointment> => {
  const { data } = await api.patch(`/appointments/${id}/cancel`);
  return data;
};

// Remarcar consulta
export const rescheduleAppointment = async (
  id: number,
  newDateTime: string
): Promise<Appointment> => {
  const { data } = await api.patch(`/appointments/${id}/reschedule`, {
    appointmentDateTime: newDateTime,
  });
  return data;
};

// Completar consulta (para médicos)
export const completeAppointment = async (
  id: number,
  notes?: string
): Promise<Appointment> => {
  const { data } = await api.patch(`/appointments/${id}/complete`, {
    notes: notes || "",
  });
  return data;
};

// Buscar médicos para dropdown
export const getDoctorsForDropdown = async (): Promise<DoctorDropdown[]> => {
  const { data } = await api.get("/profile/doctors/dropdown");
  return data;
};
