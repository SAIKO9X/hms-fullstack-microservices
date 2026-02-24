import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppSelector } from "@/store/hooks";
import { ProfileService, PatientService } from "@/services";
import {
  useRoleBasedMutationFn,
  useRoleBasedQuery,
} from "../../hooks/use-role-based";
import type { PatientProfile } from "@/types/patient.types";
import type { DoctorProfile } from "@/types/doctor.types";
import type {
  PatientProfileFormData,
  DoctorProfileFormData,
} from "@/lib/schemas/profile.schema";

type Profile = PatientProfile | DoctorProfile;
type ProfileFormData = PatientProfileFormData | DoctorProfileFormData;

// === QUERY KEYS ===
export const profileKeys = {
  all: ["profile"] as const,
  patient: () => [...profileKeys.all, "patient"] as const,
  doctor: () => [...profileKeys.all, "doctor"] as const,
  patientsDropdown: ["patientsDropdown"] as const,
  allPatients: ["allPatients"] as const,
  allDoctors: ["allDoctors"] as const,
  patientById: (id: number) => ["patient", id] as const,
  doctorById: (id: number) => ["doctor", id] as const,
  medicalHistory: (patientId: number | undefined) =>
    ["medicalHistory", patientId] as const,
};

// === BASE QUERIES ===
export const useProfileQuery = () => {
  return useRoleBasedQuery<Profile>({
    queryKey: profileKeys.all,
    patientFn: ProfileService.getMyPatientProfile,
    doctorFn: ProfileService.getMyDoctorProfile,
    options: {
      staleTime: 5 * 60 * 1000,
    },
  });
};

// === PATIENTS QUERIES ===
export const usePatientsDropdown = () => {
  return useQuery({
    queryKey: profileKeys.patientsDropdown,
    queryFn: ProfileService.getPatientsForDropdown,
    staleTime: 10 * 60 * 1000,
  });
};

export const useAllPatients = (page = 0, size = 100) => {
  return useQuery({
    queryKey: [...profileKeys.allPatients, page, size],
    queryFn: async () => {
      const response = await ProfileService.getAllPatients(page, size);
      return response.content;
    },
  });
};

export const usePatientById = (id: number) => {
  return useQuery({
    queryKey: profileKeys.patientById(id),
    queryFn: () => ProfileService.getPatientById(id),
    enabled: !!id,
  });
};

export const useMedicalHistory = (patientId: number | undefined) => {
  return useQuery({
    queryKey: profileKeys.medicalHistory(patientId),
    queryFn: () => PatientService.getMedicalHistory(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
};

// === DOCTORS QUERIES ===
export const useAllDoctors = (page = 0, size = 100) => {
  return useQuery({
    queryKey: [...profileKeys.allDoctors, page, size],
    queryFn: async () => {
      const response = await ProfileService.getAllDoctors(page, size);
      return response.content;
    },
  });
};

export const useDoctorById = (id: number) => {
  return useQuery({
    queryKey: profileKeys.doctorById(id),
    queryFn: () => ProfileService.getDoctorById(id),
    enabled: !!id,
  });
};

// === MUTATIONS ===
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
      const queryKey =
        user?.role === "PATIENT" ? profileKeys.patient() : profileKeys.doctor();

      queryClient.setQueryData(queryKey, updatedProfile);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};

export const useUpdateProfilePicture = () => {
  const queryClient = useQueryClient();

  const mutationFn = useRoleBasedMutationFn<void, string>({
    patientFn: ProfileService.updateMyPatientProfilePicture,
    doctorFn: ProfileService.updateMyDoctorProfilePicture,
  });

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};

// === COMBINED HOOK ===
export const useProfile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const profileQuery = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  return {
    profile: profileQuery.data,
    user,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    isSuccess: profileQuery.isSuccess,
    isFetching: profileQuery.isFetching,
    isUpdating: updateProfileMutation.isPending,
    error: profileQuery.error?.message || null,
    updateError: updateProfileMutation.error?.message || null,
    refetch: profileQuery.refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    status: profileQuery.isLoading
      ? "loading"
      : profileQuery.isError
        ? "failed"
        : profileQuery.isSuccess
          ? "succeeded"
          : "idle",
  };
};
