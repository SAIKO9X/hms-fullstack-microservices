import api from "@/config/axios";
import type { HealthMetricFormData } from "@/lib/schemas/healthMetric.schema";
import type {
  PrescriptionFormData,
  PrescriptionUpdateData,
} from "@/lib/schemas/prescription.schema";
import type {
  AppointmentRecordFormData,
  AppointmentRecordUpdateData,
} from "@/lib/schemas/record.schema";
import type {
  AdverseEffectReport,
  AdverseEffectReportCreateRequest,
  Appointment,
} from "@/types/appointment.types";
import type { DoctorDropdown } from "@/types/doctor.types";
import type {
  MedicalDocument,
  MedicalDocumentCreateRequest,
} from "@/types/document.types";
import type { HealthMetric } from "@/types/health.types";
import type { AppointmentRecord, Prescription } from "@/types/record.types";

// === ROTAS COMPARTILHADAS (acessíveis por pacientes e médicos) ===

// Buscar uma consulta específica por ID
export const getAppointmentById = async (id: number): Promise<Appointment> => {
  const { data } = await api.get(`/appointments/${id}`);
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

// Buscar médicos para dropdown
export const getDoctorsForDropdown = async (): Promise<DoctorDropdown[]> => {
  const { data } = await api.get("/profile/doctors/dropdown");
  return data;
};

// === APPOINTMENT RECORDS ===
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
      return null;
    }
    throw error;
  }
};

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

// === PRESCRIPTIONS ===
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

export const getPrescriptionsByPatientId = async (
  patientId: number
): Promise<Prescription[]> => {
  const { data } = await api.get(`/prescriptions/patient/${patientId}`);
  return data;
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

// === HEALTH METRICS ===
export const getLatestHealthMetric = async (): Promise<HealthMetric | null> => {
  try {
    const { data } = await api.get("/health-metrics/latest");
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const createHealthMetric = async (
  metricData: HealthMetricFormData
): Promise<HealthMetric> => {
  const { data } = await api.post("/health-metrics", metricData);
  return data;
};

// === ADVERSE EFFECTS ===
export const createAdverseEffectReport = async (
  reportData: AdverseEffectReportCreateRequest
): Promise<void> => {
  await api.post("/adverse-effects", reportData);
};

export const getAdverseEffectReports = async (): Promise<
  AdverseEffectReport[]
> => {
  const { data } = await api.get("/adverse-effects/doctor");
  return data;
};

// === MEDICAL DOCUMENTS ===
export const getMyDocuments = async (): Promise<MedicalDocument[]> => {
  const { data } = await api.get("/documents/patient");
  return data;
};

export const getDocumentsByPatientId = async (
  patientId: number
): Promise<MedicalDocument[]> => {
  const { data } = await api.get(`/documents/patient/${patientId}`);
  return data;
};

export const createMedicalDocument = async (
  documentData: MedicalDocumentCreateRequest
): Promise<MedicalDocument> => {
  const { data } = await api.post("/documents", documentData);
  return data;
};

export const deleteMedicalDocument = async (id: number): Promise<void> => {
  await api.delete(`/documents/${id}`);
};
