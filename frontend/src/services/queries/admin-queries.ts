import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";

import api from "@/config/axios";
import { AdminService } from "@/services";

import type {
  AdminDashboardStats,
  DailyActivity,
  DoctorStatus,
} from "@/types/admin.types";
import type { AdminCreateUserFormData } from "@/lib/schemas/admin.schema";
import type { UserResponse } from "@/types/auth.types";
import type { AppointmentDetail } from "@/types/appointment.types";
import type { MedicalHistory } from "@/types/patient.types";

// === QUERY KEYS ===
export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  appointmentsToday: () => [...adminKeys.all, "appointments-today"] as const,
  dailyActivity: () => [...adminKeys.all, "daily-activity"] as const,
  doctorsStatus: () => [...adminKeys.all, "doctors-status"] as const,
  users: () => [...adminKeys.all, "users"] as const,
  auditLogs: (page: number, size: number) =>
    [...adminKeys.all, "audit-logs", { page, size }] as const,
  doctorAppointments: (id: number) =>
    [...adminKeys.all, "doctor-appointments", id] as const,
  patientHistory: (id: number) =>
    [...adminKeys.all, "patient-history", id] as const,
};

// === QUERIES ===
export const useAdminProfileCounts = () => {
  return useQuery<AdminDashboardStats>({
    queryKey: adminKeys.stats(),
    queryFn: async () => {
      const { data } = await api.get("/profile/admin/stats/counts");
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAppointmentsTodayCount = () => {
  return useQuery<number>({
    queryKey: adminKeys.appointmentsToday(),
    queryFn: async () => {
      const { data } = await api.get("/admin/stats/appointments-today");
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDailyActivity = () => {
  return useQuery<DailyActivity[]>({
    queryKey: adminKeys.dailyActivity(),
    queryFn: async () => {
      const { data } = await api.get("/admin/stats/daily-activity");
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDoctorsStatus = () => {
  return useQuery<DoctorStatus[]>({
    queryKey: adminKeys.doctorsStatus(),
    queryFn: async () => {
      const { data } = await api.get("/profile/admin/stats/doctors-status");
      return data?.data || data;
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 60 * 1000,
  });
};

export const useAllUsers = () => {
  return useQuery<UserResponse[]>({
    queryKey: adminKeys.users(),
    queryFn: async () => {
      const { data } = await api.get("/users/all");
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminDoctorAppointments = (doctorId: number | undefined) => {
  return useQuery<AppointmentDetail[]>({
    queryKey: adminKeys.doctorAppointments(doctorId!),
    queryFn: () => AdminService.getAppointmentsByDoctorId(doctorId!),
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAdminPatientMedicalHistory = (
  patientId: number | undefined,
) => {
  return useQuery<MedicalHistory>({
    queryKey: adminKeys.patientHistory(patientId!),
    queryFn: () => AdminService.getPatientMedicalHistoryById(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAuditLogs = (page = 0, size = 10) => {
  return useQuery({
    queryKey: adminKeys.auditLogs(page, size),
    queryFn: () => AdminService.getAuditLogs(page, size),
    placeholderData: keepPreviousData,
  });
};

// === MUTATIONS ===
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AdminService.updateUserStatus,
    onSuccess: () => {
      // invalida listas de usuários e dropdowns específicos se existirem
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: AdminCreateUserFormData) =>
      AdminService.adminCreateUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AdminService.adminUpdateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};
