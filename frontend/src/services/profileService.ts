import api from "@/lib/interceptor/AxiosInterceptor";
import type {
  PatientProfileFormData,
  DoctorProfileFormData,
} from "@/lib/schemas/profile";
import type { DoctorProfile } from "@/types/doctor.types";
import type { PatientProfile } from "@/types/patient.types";

export const getMyPatientProfile = async (): Promise<PatientProfile> => {
  const { data } = await api.get("/profile/patients");
  return data;
};

export const updateMyPatientProfile = async (
  profileData: PatientProfileFormData
): Promise<PatientProfile> => {
  const { data } = await api.patch("/profile/patients", profileData);
  return data;
};

export const getMyDoctorProfile = async (): Promise<DoctorProfile> => {
  const { data } = await api.get("/profile/doctors");
  return data;
};

export const updateMyDoctorProfile = async (
  profileData: DoctorProfileFormData
): Promise<DoctorProfile> => {
  const { data } = await api.patch("/profile/doctors", profileData);
  return data;
};
