import api from "@/config/axios";
import type { HealthMetricFormData } from "@/lib/schemas/healthMetric.schema";
import type { LabOrderFormData } from "@/lib/schemas/labOrder.schema";
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
  DoctorUnavailability,
  DoctorUnavailabilityRequest,
} from "@/types/appointment.types";
import type {
  AvailabilitySlot,
  DoctorDropdown,
  PatientSummary,
} from "@/types/doctor.types";
import type {
  MedicalDocument,
  MedicalDocumentCreateRequest,
} from "@/types/document.types";
import type { HealthMetric } from "@/types/health.types";
import type { Page } from "@/types/pagination.types";
import type { AppointmentRecord, Prescription } from "@/types/record.types";

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
  newDateTime: string,
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

export const getDoctorPatients = async (): Promise<PatientSummary[]> => {
  const { data } = await api.get<PatientSummary[]>(
    "/doctor/appointments/my-patients",
  );
  return data;
};

// === APPOINTMENT RECORDS ===
export const createAppointmentRecord = async (
  data: AppointmentRecordFormData,
): Promise<AppointmentRecord> => {
  const { data: responseData } = await api.post("/records", data);
  return responseData;
};

export const getAppointmentRecordByAppointmentId = async (
  appointmentId: number,
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
  data: PrescriptionFormData,
): Promise<Prescription> => {
  const { data: responseData } = await api.post("/prescriptions", data);
  return responseData;
};

export const getPrescriptionByAppointmentId = async (
  appointmentId: number,
): Promise<Prescription | null> => {
  try {
    const { data } = await api.get(
      `/prescriptions/appointment/${appointmentId}`,
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
  patientId: number,
  page = 0,
  size = 10,
): Promise<Page<Prescription>> => {
  const { data } = await api.get(
    `/prescriptions/patient/${patientId}?page=${page}&size=${size}`,
  );
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
  metricData: HealthMetricFormData,
): Promise<HealthMetric> => {
  const { data } = await api.post("/health-metrics", metricData);
  return data;
};

// === ADVERSE EFFECTS ===
export const createAdverseEffectReport = async (
  reportData: AdverseEffectReportCreateRequest,
): Promise<void> => {
  await api.post("/adverse-effects", reportData);
};

export const getAdverseEffectReports = async (
  page = 0,
  size = 10,
): Promise<Page<AdverseEffectReport>> => {
  const { data } = await api.get(
    `/adverse-effects/doctor?page=${page}&size=${size}`,
  );
  return data;
};

// === MEDICAL DOCUMENTS ===
export const getMyDocuments = async (
  page = 0,
  size = 10,
): Promise<Page<MedicalDocument>> => {
  const { data } = await api.get(
    `/documents/patient?page=${page}&size=${size}`,
  );
  return data;
};

export const getDocumentsByPatientId = async (
  patientId: number,
  page = 0,
  size = 10,
): Promise<Page<MedicalDocument>> => {
  const { data } = await api.get(
    `/documents/patient/${patientId}?page=${page}&size=${size}`,
  );
  return data;
};

export const createMedicalDocument = async (
  documentData: MedicalDocumentCreateRequest,
): Promise<MedicalDocument> => {
  const { data } = await api.post("/documents", documentData);
  return data;
};

export const deleteMedicalDocument = async (id: number): Promise<void> => {
  await api.delete(`/documents/${id}`);
};

export const getDoctorAvailability = async (doctorId: number) => {
  const { data } = await api.get<AvailabilitySlot[]>(
    `/doctor/appointments/availability/${doctorId}`,
  );
  return data;
};

export const addDoctorAvailability = async (
  doctorId: number,
  slot: Omit<AvailabilitySlot, "id">,
) => {
  const { data } = await api.post<AvailabilitySlot>(
    `/doctor/appointments/availability/${doctorId}`,
    slot,
  );
  return data;
};

export const deleteDoctorAvailability = async (id: number) => {
  await api.delete(`/doctor/appointments/availability/${id}`);
};

export const createLabOrder = async (data: LabOrderFormData): Promise<void> => {
  await api.post("/appointments/lab-orders", data);
};

export const getLabOrdersByAppointment = async (appointmentId: number) => {
  const { data } = await api.get(`/appointments/lab-orders/${appointmentId}`);
  return data;
};

export const addLabResult = async (
  orderId: number,
  itemId: number,
  data: { resultNotes: string; attachmentId: string },
) => {
  const response = await api.patch(
    `/appointments/lab-orders/${orderId}/items/${itemId}/results`,
    data,
  );
  return response.data;
};

export const createUnavailability = async (
  data: DoctorUnavailabilityRequest,
): Promise<DoctorUnavailability> => {
  const { data: response } = await api.post<DoctorUnavailability>(
    "/appointments/unavailability",
    data,
  );
  return response;
};

export const getDoctorUnavailability = async (
  doctorId: number,
): Promise<DoctorUnavailability[]> => {
  const { data } = await api.get<DoctorUnavailability[]>(
    `/appointments/unavailability/doctor/${doctorId}`,
  );
  return data;
};

export const deleteUnavailability = async (id: number): Promise<void> => {
  await api.delete(`/appointments/unavailability/${id}`);
};
