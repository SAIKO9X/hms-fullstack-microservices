import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
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

export const adminKeys = {
  stats: ["adminDashboardStats"] as const,
  appointmentsToday: ["appointmentsTodayCount"] as const,
  dailyActivity: ["dailyActivity"] as const,
  doctorsStatus: ["doctorsStatus"] as const,
  allUsers: ["allUsers"] as const,
  doctorAppointments: (id: number) => ["adminDoctorAppointments", id] as const,
  patientHistory: (id: number) => ["adminPatientMedicalHistory", id] as const,
  auditLogs: (page: number, size: number) =>
    ["audit-logs", page, size] as const,
};

export const useAdminProfileCounts = () => {
  return useQuery<AdminDashboardStats>({
    queryKey: adminKeys.stats,
    queryFn: async () => {
      const { data } = await api.get("/profile/admin/stats/counts");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAppointmentsTodayCount = () => {
  return useQuery<number>({
    queryKey: adminKeys.appointmentsToday,
    queryFn: async () => {
      const { data } = await api.get("/admin/stats/appointments-today");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDailyActivity = () => {
  return useQuery<DailyActivity[]>({
    queryKey: adminKeys.dailyActivity,
    queryFn: async () => {
      const { data } = await api.get("/admin/stats/daily-activity");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDoctorsStatus = () => {
  return useQuery<DoctorStatus[]>({
    queryKey: adminKeys.doctorsStatus,
    queryFn: async () => {
      const { data } = await api.get("/profile/admin/stats/doctors-status");
      return data;
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 1 * 60 * 1000,
  });
};

export const useUpdateUserStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AdminService.updateUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPatients"] });
      queryClient.invalidateQueries({ queryKey: ["allDoctors"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.allUsers });
    },
  });
};

export const useAdminCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: AdminCreateUserFormData) =>
      AdminService.adminCreateUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPatients"] });
      queryClient.invalidateQueries({ queryKey: ["allDoctors"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.allUsers });
    },
  });
};

export const useAdminUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AdminService.adminUpdateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPatients"] });
      queryClient.invalidateQueries({ queryKey: ["allDoctors"] });
      queryClient.invalidateQueries({ queryKey: adminKeys.allUsers });
    },
  });
};

export const useAllUsers = () => {
  return useQuery<UserResponse[]>({
    queryKey: adminKeys.allUsers,
    queryFn: async () => {
      const { data } = await api.get("/users/all");
      return data;
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

export const useAuditLogs = (page: number, size: number) => {
  return useQuery({
    queryKey: adminKeys.auditLogs(page, size),
    queryFn: () => AdminService.getAuditLogs(page, size),
    placeholderData: keepPreviousData,
  });
};
