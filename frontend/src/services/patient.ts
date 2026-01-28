import api from "@/config/axios";
import type { AppointmentFormData } from "@/lib/schemas/appointment.schema";
import type { Appointment, AppointmentStats } from "@/types/appointment.types";
import type { DoctorSummary } from "@/types/doctor.types";
import type { Page } from "@/types/pagination.types";
import type { MedicalHistory, PatientProfile } from "@/types/patient.types";
import type { Prescription } from "@/types/record.types";

// APPOINTMENTS
export const getMyAppointments = async (
  page = 0,
  size = 10,
): Promise<Page<Appointment>> => {
  const { data } = await api.get(
    `/appointments/patient?page=${page}&size=${size}`,
  );
  return data;
};

export const createAppointment = async (
  appointmentData: AppointmentFormData,
): Promise<Appointment> => {
  const { data } = await api.post("/appointments/patient", appointmentData);
  return data;
};

export const getNextAppointment = async (): Promise<Appointment | null> => {
  try {
    const { data } = await api.get("/appointments/patient/next");
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const getAppointmentStats = async (): Promise<AppointmentStats> => {
  const { data } = await api.get("/appointments/patient/stats");
  return data;
};

// PRESCRIPTIONS
export const getLatestPrescription = async (): Promise<Prescription | null> => {
  try {
    const { data } = await api.get("/prescriptions/patient/latest");
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const getMyPrescriptionsHistory = async (
  page = 0,
  size = 10,
): Promise<Page<Prescription>> => {
  const { data } = await api.get(
    `/prescriptions/patient/my-history?page=${page}&size=${size}`,
  );
  return data;
};

// MEDICAL HISTORY
export const getMedicalHistory = async (
  patientId: number,
): Promise<MedicalHistory> => {
  const { data } = await api.get<MedicalHistory>(
    `/profile/patient/medical-history/${patientId}`,
  );
  return data;
};

// PATIENT PROFILE
export const getPatientById = async (id: number): Promise<PatientProfile> => {
  const { data } = await api.get<PatientProfile>(`/profile/patients/${id}`);
  return data;
};

// DOCTORS
export const getMyDoctors = async (): Promise<DoctorSummary[]> => {
  const { data } = await api.get("/appointments/patient/my-doctors");
  return data;
};
