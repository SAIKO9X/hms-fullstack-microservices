import { useQuery } from "@tanstack/react-query";
import api from "@/config/axios";
import type {
  AdminDashboardStats,
  DailyActivity,
  DoctorStatus,
} from "@/types/admin.types";

export const useAdminProfileCounts = () => {
  return useQuery<AdminDashboardStats>({
    queryKey: ["adminDashboardStats"],
    queryFn: async () => {
      const { data } = await api.get("/profile/admin/stats/counts");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAppointmentsTodayCount = () => {
  return useQuery<number>({
    queryKey: ["appointmentsTodayCount"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats/appointments-today");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para buscar os dados de atividade diária
export const useDailyActivity = () => {
  return useQuery<DailyActivity[]>({
    queryKey: ["dailyActivity"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats/daily-activity");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para buscar o status dos médicos
export const useDoctorsStatus = () => {
  return useQuery<DoctorStatus[]>({
    queryKey: ["doctorsStatus"],
    queryFn: async () => {
      const { data } = await api.get("/profile/admin/stats/doctors-status");
      return data;
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 1 * 60 * 1000,
  });
};
