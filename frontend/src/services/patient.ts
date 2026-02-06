import api from "@/config/axios";
import type { AppointmentFormData } from "@/lib/schemas/appointment.schema";
import type { Appointment, AppointmentStats } from "@/types/appointment.types";
import type { DoctorSummary } from "@/types/doctor.types";
import type { ApiResponse } from "@/types/api.types";
import type { MedicalHistory, PatientProfile } from "@/types/patient.types";
import type { Prescription } from "@/types/record.types";
import type { Page } from "@/types/pagination.types";

// APPOINTMENTS
export const getMyAppointments = async (
  page = 0,
  size = 10,
): Promise<Page<Appointment>> => {
  const { data } = await api.get<ApiResponse<Page<Appointment>>>(
    `/appointments/patient?page=${page}&size=${size}`,
  );
  return data.data;
};

export const createAppointment = async (
  appointmentData: AppointmentFormData,
): Promise<Appointment> => {
  const { data } = await api.post<ApiResponse<Appointment>>(
    "/appointments/patient",
    appointmentData,
  );
  return data.data;
};

export const getNextAppointment = async (): Promise<Appointment | null> => {
  try {
    const { data } = await api.get<ApiResponse<Appointment>>(
      "/appointments/patient/next",
    );
    return data.data ?? null;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const getAppointmentStats = async (): Promise<AppointmentStats> => {
  const { data } = await api.get<ApiResponse<AppointmentStats>>(
    "/appointments/patient/stats",
  );
  return data.data;
};

// PRESCRIPTIONS
export const getLatestPrescription = async (): Promise<Prescription | null> => {
  try {
    const { data } = await api.get<ApiResponse<Prescription>>(
      "/prescriptions/patient/latest",
    );
    return data.data ?? null;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const getMyPrescriptionsHistory = async (
  page = 0,
  size = 10,
): Promise<Page<Prescription>> => {
  const { data } = await api.get<ApiResponse<Page<Prescription>>>(
    `/prescriptions/patient/my-history?page=${page}&size=${size}`,
  );
  return data.data;
};

// MEDICAL HISTORY
export const getMedicalHistory = async (
  patientId: number,
): Promise<MedicalHistory> => {
  const { data } = await api.get<ApiResponse<MedicalHistory>>(
    `/profile/patient/medical-history/${patientId}`,
  );
  return data.data;
};

// PATIENT PROFILE
export const getPatientById = async (id: number): Promise<PatientProfile> => {
  const { data } = await api.get<ApiResponse<PatientProfile>>(
    `/profile/patients/${id}`,
  );
  return data.data;
};

// DOCTORS
export const getMyDoctors = async (): Promise<DoctorSummary[]> => {
  const { data } = await api.get<ApiResponse<DoctorSummary[]>>(
    "/appointments/patient/my-doctors",
  );
  return data.data;
};
