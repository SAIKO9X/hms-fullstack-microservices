import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/config/axios";
import type {
  AdminDashboardStats,
  DailyActivity,
  DoctorStatus,
} from "@/types/admin.types";
import { adminCreateUser, adminUpdateUser, updateUserStatus } from "../admin";
import type { AdminCreateUserFormData } from "@/lib/schemas/admin.schema";
import type { UserResponse } from "@/types/auth.types";

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

export const useUpdateUserStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserStatus,
    onSuccess: () => {
      // Quando a mutação for bem-sucedida, os dados de pacientes e médicos estão desatualizados.
      // Invalidamos as queries para forçar o React Query a buscar os dados mais recentes.
      queryClient.invalidateQueries({ queryKey: ["allPatients"] });
      queryClient.invalidateQueries({ queryKey: ["allDoctors"] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar o status do utilizador:", error);
    },
  });
};

export const useAdminCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: AdminCreateUserFormData) =>
      adminCreateUser(userData),
    onSuccess: () => {
      // Invalida as listas de pacientes e médicos para forçar a atualização da tabela.
      queryClient.invalidateQueries({ queryKey: ["allPatients"] });
      queryClient.invalidateQueries({ queryKey: ["allDoctors"] });
    },
    onError: (error) => {
      console.error("Erro ao criar utilizador:", error);
    },
  });
};

export const useAdminUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminUpdateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allPatients"] });
      queryClient.invalidateQueries({ queryKey: ["allDoctors"] });
    },
    onError: (error) => {
      console.error("Erro ao atualizar utilizador:", error);
    },
  });
};

export const useAllUsers = () => {
  return useQuery<UserResponse[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const { data } = await api.get("/users/all");
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
