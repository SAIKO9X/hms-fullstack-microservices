import api from "@/lib/interceptor/AxiosInterceptor";
import type { AppointmentFormData } from "@/lib/schemas/appointment";
import type { HealthMetricFormData } from "@/lib/schemas/healthMetric.schema";
import type {
  PrescriptionFormData,
  PrescriptionUpdateData,
} from "@/lib/schemas/prescription";
import type {
  AppointmentRecordFormData,
  AppointmentRecordUpdateData,
} from "@/lib/schemas/record";
import type {
  AdverseEffectReportCreateRequest,
  Appointment,
  AppointmentStats,
} from "@/types/appointment.types";
import type { DoctorDropdown } from "@/types/doctor.types";
import type {
  MedicalDocument,
  MedicalDocumentCreateRequest,
} from "@/types/document.types";
import type { HealthMetric } from "@/types/health.types";
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

// Buscar estatísticas de agendamentos do paciente logado
export const getAppointmentStats = async (): Promise<AppointmentStats> => {
  const { data } = await api.get("/appointments/patient/stats");
  return data;
};

// Buscar a métrica de saúde mais recente do paciente logado
export const getLatestHealthMetric = async (): Promise<HealthMetric | null> => {
  try {
    const { data } = await api.get("/health-metrics/latest");
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

// Criar nova métrica de saúde
export const createHealthMetric = async (
  metricData: HealthMetricFormData
): Promise<HealthMetric> => {
  const { data } = await api.post("/health-metrics", metricData);
  return data;
};

// Buscar histórico de prescrições do paciente logado
export const getMyPrescriptionsHistory = async (): Promise<Prescription[]> => {
  const { data } = await api.get("/prescriptions/patient/my-history");
  return data;
};

// Reportar efeito adverso
export const createAdverseEffectReport = async (
  reportData: AdverseEffectReportCreateRequest
): Promise<void> => {
  await api.post("/adverse-effects", reportData);
};

// Buscar meus documentos médicos
export const getMyDocuments = async (): Promise<MedicalDocument[]> => {
  const { data } = await api.get("/documents/patient");
  return data;
};

// Buscar documentos médicos por ID do paciente (para médicos)
export const getDocumentsByPatientId = async (
  patientId: number
): Promise<MedicalDocument[]> => {
  const { data } = await api.get(`/documents/patient/${patientId}`);
  return data;
};

// Criar novo documento médico
export const createMedicalDocument = async (
  documentData: MedicalDocumentCreateRequest
): Promise<MedicalDocument> => {
  const { data } = await api.post("/documents", documentData);
  return data;
};

// Apagar documento médico
export const deleteMedicalDocument = async (id: number): Promise<void> => {
  await api.delete(`/documents/${id}`);
};
