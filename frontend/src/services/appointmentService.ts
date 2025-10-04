import api from "@/lib/interceptor/AxiosInterceptor";
import type { AppointmentFormData } from "@/lib/schemas/appointment";
import type {
  PrescriptionFormData,
  PrescriptionUpdateData,
} from "@/lib/schemas/prescription";
import type {
  AppointmentRecordFormData,
  AppointmentRecordUpdateData,
} from "@/lib/schemas/record";
import type { Appointment } from "@/types/appointment.types";
import type { DoctorDropdown } from "@/types/doctor.types";
import type { AppointmentRecord, Prescription } from "@/types/record.types";

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

// --- Funções para AppointmentRecord ---
export const createAppointmentRecord = async (
  data: AppointmentRecordFormData
): Promise<AppointmentRecord> => {
  const { data: responseData } = await api.post("/records", data);
  return responseData;
};

export const getAppointmentRecordByAppointmentId = async (
  appointmentId: number
): Promise<AppointmentRecord | null> => {
  try {
    const { data } = await api.get(`/records/appointment/${appointmentId}`);
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // Retorna null se não encontrar, em vez de lançar um erro
    }
    throw error;
  }
};

// --- Funções para Prescription ---
export const createPrescription = async (
  data: PrescriptionFormData
): Promise<Prescription> => {
  const { data: responseData } = await api.post("/prescriptions", data);
  return responseData;
};

export const getPrescriptionByAppointmentId = async (
  appointmentId: number
): Promise<Prescription | null> => {
  try {
    const { data } = await api.get(
      `/prescriptions/appointment/${appointmentId}`
    );
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// Buscar prescrições por ID de paciente
export const getPrescriptionsByPatientId = async (
  patientId: number
): Promise<Prescription[]> => {
  const { data } = await api.get(`/prescriptions/patient/${patientId}`);
  return data;
};

// --- Funções de UPDATE ---
export const updateAppointmentRecord = async ({
  id,
  data,
}: {
  id: number;
  data: AppointmentRecordUpdateData;
}): Promise<AppointmentRecord> => {
  const { data: responseData } = await api.put(`/records/${id}`, data);
  return responseData;
};

export const updatePrescription = async ({
  id,
  data,
}: {
  id: number;
  data: PrescriptionUpdateData;
}): Promise<Prescription> => {
  const { data: responseData } = await api.put(`/prescriptions/${id}`, data);
  return responseData;
};
