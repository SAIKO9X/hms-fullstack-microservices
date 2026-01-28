import api from "@/config/axios";
import type {
  Appointment,
  AppointmentDetail,
  DoctorDashboardStats,
  PatientGroup,
} from "@/types/appointment.types";
import type { PatientSummary } from "@/types/doctor.types";
import type { Page } from "@/types/pagination.types";

// APPOINTMENTS
export const getMyAppointmentsAsDoctor = async (
  page = 0,
  size = 10,
): Promise<Page<Appointment>> => {
  const { data } = await api.get(
    `/doctor/appointments?page=${page}&size=${size}`,
  );
  return data;
};

export const getDoctorAppointmentDetails = async (
  dateFilter?: "today" | "week" | "month",
): Promise<AppointmentDetail[]> => {
  const endpoint = dateFilter
    ? `/doctor/appointments/details?date=${dateFilter}`
    : "/doctor/appointments/details";
  const { data } = await api.get(endpoint);
  return data;
};

export const completeAppointment = async (
  id: number,
  notes?: string,
): Promise<Appointment> => {
  const { data } = await api.patch(`/doctor/appointments/${id}/complete`, {
    notes: notes || "",
  });
  return data;
};

// DASHBOARD & STATISTICS
export const getDoctorDashboardStats =
  async (): Promise<DoctorDashboardStats> => {
    const { data } = await api.get("/doctor/appointments/dashboard-stats");
    return data;
  };

export const getUniquePatientsCount = async (): Promise<number> => {
  const { data } = await api.get("/doctor/appointments/patients-count");
  return data;
};

export const getDoctorPatientGroups = async (): Promise<PatientGroup[]> => {
  const { data } = await api.get("/doctor/appointments/patient-groups");
  return data;
};

// PATIENTS
export const getMyPatients = async (): Promise<PatientSummary[]> => {
  const { data } = await api.get<PatientSummary[]>(
    "/doctor/appointments/my-patients",
  );
  return data;
};
