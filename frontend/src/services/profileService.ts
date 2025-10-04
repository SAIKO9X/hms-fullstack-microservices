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

export const getPatientsForDropdown = async (): Promise<
  { userId: number; name: string }[]
> => {
  const { data } = await api.get("/profile/patients/dropdown");
  return data;
};

export const getAllPatients = async (): Promise<PatientProfile[]> => {
  const { data } = await api.get("/profile/patients/all");
  return data;
};

export const getAllDoctors = async (): Promise<DoctorProfile[]> => {
  const { data } = await api.get("/profile/doctors/all");
  return data;
};

// ...
export const getPatientById = async (id: number): Promise<PatientProfile> => {
  const { data } = await api.get(`/profile/patients/${id}`);
  return data;
};

export const getDoctorById = async (id: number): Promise<DoctorProfile> => {
  const { data } = await api.get(`/profile/doctors/${id}`);
  return data;
};
