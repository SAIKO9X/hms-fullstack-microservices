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
import type { ApiResponse } from "@/types/api.types"; // Certifique-se de que este tipo existe
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

// === APPOINTMENTS ===
export const getAppointmentById = async (id: number): Promise<Appointment> => {
  const { data } = await api.get<ApiResponse<Appointment>>(
    `/appointments/${id}`,
  );
  return data.data;
};

export const cancelAppointment = async (id: number): Promise<Appointment> => {
  const { data } = await api.patch<ApiResponse<Appointment>>(
    `/appointments/${id}/cancel`,
  );
  return data.data;
};

export const rescheduleAppointment = async (
  id: number,
  newDateTime: string,
): Promise<Appointment> => {
  const { data } = await api.patch<ApiResponse<Appointment>>(
    `/appointments/${id}/reschedule`,
    { appointmentDateTime: newDateTime },
  );
  return data.data;
};

export const getDoctorsForDropdown = async (): Promise<DoctorDropdown[]> => {
  const { data } = await api.get<ApiResponse<DoctorDropdown[]>>(
    "/profile/doctors/dropdown",
  );
  return data.data;
};

export const getDoctorPatients = async (): Promise<PatientSummary[]> => {
  const { data } = await api.get<ApiResponse<PatientSummary[]>>(
    "/doctor/appointments/my-patients",
  );
  return data.data;
};

// === APPOINTMENT RECORDS ===
export const createAppointmentRecord = async (
  data: AppointmentRecordFormData,
): Promise<AppointmentRecord> => {
  const { data: responseData } = await api.post<ApiResponse<AppointmentRecord>>(
    "/records",
    data,
  );
  return responseData.data;
};

export const getAppointmentRecordByAppointmentId = async (
  appointmentId: number,
): Promise<AppointmentRecord | null> => {
  try {
    const { data } = await api.get<ApiResponse<AppointmentRecord>>(
      `/records/appointment/${appointmentId}`,
    );
    return data.data ?? null; // CORREÇÃO AQUI
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
  const { data: responseData } = await api.put<ApiResponse<AppointmentRecord>>(
    `/records/${id}`,
    data,
  );
  return responseData.data;
};

// === PRESCRIPTIONS ===
export const createPrescription = async (
  data: PrescriptionFormData,
): Promise<Prescription> => {
  const { data: responseData } = await api.post<ApiResponse<Prescription>>(
    "/prescriptions",
    data,
  );
  return responseData.data;
};

export const getPrescriptionByAppointmentId = async (
  appointmentId: number,
): Promise<Prescription | null> => {
  try {
    const { data } = await api.get<ApiResponse<Prescription>>(
      `/prescriptions/appointment/${appointmentId}`,
    );
    return data.data;
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
  const { data } = await api.get<ApiResponse<Page<Prescription>>>(
    `/prescriptions/patient/${patientId}?page=${page}&size=${size}`,
  );
  return data.data;
};

export const updatePrescription = async ({
  id,
  data,
}: {
  id: number;
  data: PrescriptionUpdateData;
}): Promise<Prescription> => {
  const { data: responseData } = await api.put<ApiResponse<Prescription>>(
    `/prescriptions/${id}`,
    data,
  );
  return responseData.data;
};

// === HEALTH METRICS ===
export const getLatestHealthMetric = async (): Promise<HealthMetric | null> => {
  try {
    const { data } = await api.get<ApiResponse<HealthMetric>>(
      "/health-metrics/latest",
    );
    return data.data ?? null;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const createHealthMetric = async (
  metricData: HealthMetricFormData,
): Promise<HealthMetric> => {
  const { data } = await api.post<ApiResponse<HealthMetric>>(
    "/health-metrics",
    metricData,
  );
  return data.data;
};

// === ADVERSE EFFECTS ===
export const createAdverseEffectReport = async (
  reportData: AdverseEffectReportCreateRequest,
): Promise<void> => {
  await api.post<ApiResponse<void>>("/adverse-effects", reportData);
};

export const getAdverseEffectReports = async (
  page = 0,
  size = 10,
): Promise<Page<AdverseEffectReport>> => {
  const { data } = await api.get<ApiResponse<Page<AdverseEffectReport>>>(
    `/adverse-effects/doctor?page=${page}&size=${size}`,
  );
  return data.data;
};

// === MEDICAL DOCUMENTS ===
export const getMyDocuments = async (
  page = 0,
  size = 10,
): Promise<Page<MedicalDocument>> => {
  const { data } = await api.get<ApiResponse<Page<MedicalDocument>>>(
    `/documents/patient?page=${page}&size=${size}`,
  );
  return data.data;
};

export const getDocumentsByPatientId = async (
  patientId: number,
  page = 0,
  size = 10,
): Promise<Page<MedicalDocument>> => {
  const { data } = await api.get<ApiResponse<Page<MedicalDocument>>>(
    `/documents/patient/${patientId}?page=${page}&size=${size}`,
  );
  return data.data;
};

export const createMedicalDocument = async (
  documentData: MedicalDocumentCreateRequest,
): Promise<MedicalDocument> => {
  const { data } = await api.post<ApiResponse<MedicalDocument>>(
    "/documents",
    documentData,
  );
  return data.data;
};

export const deleteMedicalDocument = async (id: number): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/documents/${id}`);
};

// === DOCTOR AVAILABILITY ===
export const getDoctorAvailability = async (
  doctorId: number,
): Promise<AvailabilitySlot[]> => {
  const { data } = await api.get<ApiResponse<AvailabilitySlot[]>>(
    `/doctor/appointments/availability/${doctorId}`,
  );
  return data.data;
};

export const addDoctorAvailability = async (
  doctorId: number,
  slot: Omit<AvailabilitySlot, "id">,
): Promise<AvailabilitySlot> => {
  const { data } = await api.post<ApiResponse<AvailabilitySlot>>(
    `/doctor/appointments/availability/${doctorId}`,
    slot,
  );
  return data.data;
};

export const deleteDoctorAvailability = async (id: number): Promise<void> => {
  await api.delete<ApiResponse<void>>(
    `/doctor/appointments/availability/${id}`,
  );
};

// === LAB ORDERS ===
export const createLabOrder = async (data: LabOrderFormData): Promise<void> => {
  await api.post<ApiResponse<void>>("/appointments/lab-orders", data);
};

export const getLabOrdersByAppointment = async (appointmentId: number) => {
  const { data } = await api.get<ApiResponse<any>>(
    `/appointments/lab-orders/${appointmentId}`,
  );
  return data.data;
};

export const addLabResult = async (
  orderId: number,
  itemId: number,
  data: { resultNotes: string; attachmentId: string },
) => {
  const response = await api.patch<ApiResponse<any>>(
    `/appointments/lab-orders/${orderId}/items/${itemId}/results`,
    data,
  );
  return response.data.data;
};

// === UNAVAILABILITY ===
export const createUnavailability = async (
  data: DoctorUnavailabilityRequest,
): Promise<DoctorUnavailability> => {
  const { data: response } = await api.post<ApiResponse<DoctorUnavailability>>(
    "/appointments/unavailability",
    data,
  );
  return response.data;
};

export const getDoctorUnavailability = async (
  doctorId: number,
): Promise<DoctorUnavailability[]> => {
  const { data } = await api.get<ApiResponse<DoctorUnavailability[]>>(
    `/appointments/unavailability/doctor/${doctorId}`,
  );
  return data.data;
};

export const deleteUnavailability = async (id: number): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/appointments/unavailability/${id}`);
};

// === PDF DOWNLOAD ===
export const downloadPrescriptionPdf = async (id: number): Promise<void> => {
  try {
    const response = await api.get(`/prescriptions/${id}/pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `receita_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erro ao baixar PDF da receita:", error);
    throw error;
  }
};
