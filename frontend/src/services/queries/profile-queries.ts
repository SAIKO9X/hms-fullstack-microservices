import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import type { PatientProfile } from "@/types/patient.types";
import type { DoctorProfile } from "@/types/doctor.types";
import type {
  PatientProfileFormData,
  DoctorProfileFormData,
} from "@/lib/schemas/profile";
import {
  getMyPatientProfile,
  getMyDoctorProfile,
  updateMyPatientProfile,
  updateMyDoctorProfile,
  getPatientsForDropdown,
  getAllPatients,
  getAllDoctors,
  getPatientById,
  getDoctorById,
  updateMyPatientProfilePicture,
  updateMyDoctorProfilePicture,
} from "@/services/profile";
import { getMedicalHistory } from "../patient";

// Types
type Profile = PatientProfile | DoctorProfile;
type ProfileFormData = PatientProfileFormData | DoctorProfileFormData;

// Query Keys
export const profileKeys = {
  all: ["profile"] as const,
  patient: () => [...profileKeys.all, "patient"] as const,
  doctor: () => [...profileKeys.all, "doctor"] as const,
};

export const useProfileQuery = () => {
  const { user } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey:
      user?.role === "PATIENT" ? profileKeys.patient() : profileKeys.doctor(),
    queryFn: async (): Promise<Profile> => {
      if (!user) throw new Error("Usuário não autenticado");

      if (user.role === "PATIENT") {
        return await getMyPatientProfile();
      } else if (user.role === "DOCTOR") {
        return await getMyDoctorProfile();
      } else {
        throw new Error("Role de usuário não suportada");
      }
    },
    enabled: !!user && (user.role === "PATIENT" || user.role === "DOCTOR"),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error: any) => {
      // Não retry para erros 404 (perfil não encontrado)
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: async (data: ProfileFormData): Promise<Profile> => {
      if (!user) throw new Error("Usuário não autenticado");

      if (user.role === "PATIENT") {
        return await updateMyPatientProfile(data as PatientProfileFormData);
      } else if (user.role === "DOCTOR") {
        return await updateMyDoctorProfile(data as DoctorProfileFormData);
      } else {
        throw new Error("Role de usuário não suportada");
      }
    },
    onSuccess: (updatedProfile) => {
      // Atualiza o cache com o perfil atualizado
      const queryKey =
        user?.role === "PATIENT" ? profileKeys.patient() : profileKeys.doctor();
      queryClient.setQueryData(queryKey, updatedProfile);

      // Opcional: invalidar outras queries relacionadas se necessário
      // queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    onError: (error) => {
      console.error("Erro ao atualizar perfil:", error);
    },
  });
};

export const useProfile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  return {
    // Dados do perfil
    profile: profileQuery.data,
    user,

    // Estados de loading
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    isSuccess: profileQuery.isSuccess,
    isFetching: profileQuery.isFetching,

    // Estados de update
    isUpdating: updateProfileMutation.isPending,

    // Erros
    error: profileQuery.error?.message || null,
    updateError: updateProfileMutation.error?.message || null,

    // Funções
    refetch: profileQuery.refetch,
    updateProfile: updateProfileMutation.mutateAsync,

    // Status para compatibilidade com código existente
    status: profileQuery.isLoading
      ? "loading"
      : profileQuery.isError
      ? "failed"
      : profileQuery.isSuccess
      ? "succeeded"
      : "idle",
  };
};

export const usePatientsDropdown = () => {
  return useQuery({
    queryKey: ["patientsDropdown"],
    queryFn: getPatientsForDropdown,
    staleTime: 10 * 60 * 1000, // Cache de 10 minutos
  });
};

export const useAllPatients = () => {
  return useQuery({
    queryKey: ["allPatients"],
    queryFn: getAllPatients,
  });
};

export const useAllDoctors = () => {
  return useQuery({
    queryKey: ["allDoctors"],
    queryFn: getAllDoctors,
  });
};

export const usePatientById = (id: number) => {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => getPatientById(id),
    enabled: !!id, // A query só será executada se o ID for válido
  });
};

export const useDoctorById = (id: number) => {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: () => getDoctorById(id),
    enabled: !!id,
  });
};

export const useUpdateProfilePicture = () => {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  return useMutation({
    mutationFn: async (pictureUrl: string) => {
      if (!user) throw new Error("Utilizador não autenticado");

      if (user.role === "PATIENT") {
        return updateMyPatientProfilePicture(pictureUrl);
      } else if (user.role === "DOCTOR") {
        return updateMyDoctorProfilePicture(pictureUrl);
      } else {
        throw new Error("Role de utilizador não suportada");
      }
    },
    onSuccess: () => {
      // Invalida a query do perfil para forçar a atualização da imagem na UI
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};

export const useMedicalHistory = (patientId: number | undefined) => {
  return useQuery({
    queryKey: ["medicalHistory", patientId],
    queryFn: () => {
      if (!patientId) {
        return Promise.reject(new Error("Patient ID is not provided"));
      }
      return getMedicalHistory(patientId);
    },
    enabled: !!patientId, // A query só será executada se o patientId existir
    staleTime: 1000 * 60 * 5,
  });
};
