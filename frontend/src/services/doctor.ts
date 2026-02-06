import api from "@/config/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
  Appointment,
  AppointmentDetail,
  DoctorDashboardStats,
  PatientGroup,
} from "@/types/appointment.types";
import type { DoctorProfile, PatientSummary } from "@/types/doctor.types";
import type { Page } from "@/types/pagination.types";

// APPOINTMENTS
export const getMyAppointmentsAsDoctor = async (
  page = 0,
  size = 10,
): Promise<Page<Appointment>> => {
  const { data } = await api.get<ApiResponse<Page<Appointment>>>(
    `/doctor/appointments?page=${page}&size=${size}`,
  );
  return data.data;
};

export const getDoctorAppointmentDetails = async (
  dateFilter?: "today" | "week" | "month",
): Promise<AppointmentDetail[]> => {
  const endpoint = dateFilter
    ? `/doctor/appointments/details?date=${dateFilter}`
    : "/doctor/appointments/details";
  const { data } = await api.get<ApiResponse<AppointmentDetail[]>>(endpoint);
  return data.data;
};

export const completeAppointment = async (
  id: number,
  notes?: string,
): Promise<Appointment> => {
  const { data } = await api.patch<ApiResponse<Appointment>>(
    `/doctor/appointments/${id}/complete`,
    {
      notes: notes || "",
    },
  );
  return data.data;
};

// DASHBOARD & STATISTICS
export const getDoctorDashboardStats =
  async (): Promise<DoctorDashboardStats> => {
    const { data } = await api.get<ApiResponse<DoctorDashboardStats>>(
      "/doctor/appointments/dashboard-stats",
    );
    return data.data;
  };

export const getUniquePatientsCount = async (): Promise<number> => {
  const { data } = await api.get<ApiResponse<number>>(
    "/doctor/appointments/patients-count",
  );
  return data.data;
};

export const getDoctorPatientGroups = async (): Promise<PatientGroup[]> => {
  const { data } = await api.get<ApiResponse<PatientGroup[]>>(
    "/doctor/appointments/patient-groups",
  );
  return data.data;
};

// PATIENTS
export const getMyPatients = async (): Promise<PatientSummary[]> => {
  const { data } = await api.get<ApiResponse<PatientSummary[]>>(
    "/doctor/appointments/my-patients",
  );
  return data.data;
};

// PROFILE
export const getMyDoctorProfile = async (): Promise<DoctorProfile> => {
  const { data } =
    await api.get<ApiResponse<DoctorProfile>>("/profile/doctors");
  return data.data;
};
