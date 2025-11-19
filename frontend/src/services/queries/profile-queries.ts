import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import type { PatientProfile } from "@/types/patient.types";
import type { DoctorProfile } from "@/types/doctor.types";
import type {
  PatientProfileFormData,
  DoctorProfileFormData,
} from "@/lib/schemas/profile.schema";
import { ProfileService, PatientService } from "@/services";
import {
  useRoleBasedMutationFn,
  useRoleBasedQuery,
} from "../../hooks/use-role-based";

// Types
type Profile = PatientProfile | DoctorProfile;
type ProfileFormData = PatientProfileFormData | DoctorProfileFormData;

// Query Keys
export const profileKeys = {
  all: ["profile"] as const,
  patient: () => [...profileKeys.all, "patient"] as const,
  doctor: () => [...profileKeys.all, "doctor"] as const,
};

// === HOOK PRINCIPAL DO PERFIL ===
export const useProfileQuery = () => {
  return useRoleBasedQuery<Profile>({
    queryKey: profileKeys.all,
    patientFn: ProfileService.getMyPatientProfile,
    doctorFn: ProfileService.getMyDoctorProfile,
    options: {
      staleTime: 5 * 60 * 1000,
      // O 'retry' já está a ser tratado dentro do hook genérico
    },
  });
};

// === MUTATION PARA UPDATE DO PERFIL ===
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);

  const mutationFn = useRoleBasedMutationFn<Profile, ProfileFormData>({
    patientFn: (data) =>
      ProfileService.updateMyPatientProfile(data as PatientProfileFormData),
    doctorFn: (data) =>
      ProfileService.updateMyDoctorProfile(data as DoctorProfileFormData),
  });

  return useMutation({
    mutationFn,
    onSuccess: (updatedProfile) => {
      // Atualiza o cache com o perfil atualizado
      const queryKey =
        user?.role === "PATIENT" ? profileKeys.patient() : profileKeys.doctor();
      queryClient.setQueryData(queryKey, updatedProfile);

      // Invalida a query base 'profile' para garantir consistência
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    onError: (error) => {
      console.error("Erro ao atualizar perfil:", error);
    },
  });
};

// === HOOK COMBINADO ===
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

// === HOOKS PARA DROPDOWNS E LISTAGENS ===
export const usePatientsDropdown = () => {
  return useQuery({
    queryKey: ["patientsDropdown"],
    queryFn: ProfileService.getPatientsForDropdown,
    staleTime: 10 * 60 * 1000, // Cache de 10 minutos
  });
};

export const useAllPatients = () => {
  return useQuery({
    queryKey: ["allPatients"],
    queryFn: ProfileService.getAllPatients,
  });
};

export const useAllDoctors = () => {
  return useQuery({
    queryKey: ["allDoctors"],
    queryFn: ProfileService.getAllDoctors,
  });
};

// === HOOKS PARA PERFIS ESPECÍFICOS ===
export const usePatientById = (id: number) => {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => ProfileService.getPatientById(id),
    enabled: !!id,
  });
};

export const useDoctorById = (id: number) => {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: () => ProfileService.getDoctorById(id),
    enabled: !!id,
  });
};

// === MUTATION PARA FOTO DE PERFIL ===
export const useUpdateProfilePicture = () => {
  const queryClient = useQueryClient();

  const mutationFn = useRoleBasedMutationFn<void, string>({
    patientFn: ProfileService.updateMyPatientProfilePicture,
    doctorFn: ProfileService.updateMyDoctorProfilePicture,
  });

  return useMutation({
    mutationFn,
    onSuccess: () => {
      // Invalida a query do perfil para forçar a atualização da imagem na UI
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};

// === HOOK PARA HISTÓRICO MÉDICO ===
export const useMedicalHistory = (patientId: number | undefined) => {
  return useQuery({
    queryKey: ["medicalHistory", patientId],
    queryFn: () => {
      if (!patientId) {
        return Promise.reject(new Error("Patient ID is not provided"));
      }
      return PatientService.getMedicalHistory(patientId);
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5,
  });
};
