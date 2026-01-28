import api from "@/config/axios";
import type {
  PatientProfileFormData,
  DoctorProfileFormData,
} from "@/lib/schemas/profile.schema";
import type { DoctorProfile } from "@/types/doctor.types";
import type { Page } from "@/types/pagination.types";
import type { PatientProfile } from "@/types/patient.types";
import type {
  DoctorRatingStats,
  ReviewRequest,
  ReviewResponse,
} from "@/types/review.types";

// PATIENT PROFILE
export const getMyPatientProfile = async (): Promise<PatientProfile> => {
  const { data } = await api.get("/profile/patients");
  return data;
};

export const updateMyPatientProfile = async (
  profileData: PatientProfileFormData,
): Promise<PatientProfile> => {
  const { data } = await api.patch("/profile/patients", profileData);
  return data;
};

export const updateMyPatientProfilePicture = async (
  pictureUrl: string,
): Promise<void> => {
  await api.put("/profile/patients/picture", { pictureUrl });
};

export const getPatientById = async (id: number): Promise<PatientProfile> => {
  const { data } = await api.get(`/profile/patients/${id}`);
  return data;
};

export const getAllPatients = async (
  page = 0,
  size = 10,
): Promise<Page<PatientProfile>> => {
  const { data } = await api.get(
    `/profile/patients/all?page=${page}&size=${size}`,
  );
  return data;
};

export const getPatientsForDropdown = async (): Promise<
  { userId: number; name: string }[]
> => {
  const { data } = await api.get("/profile/patients/dropdown");
  return data;
};

// DOCTOR PROFILE
export const getMyDoctorProfile = async (): Promise<DoctorProfile> => {
  const { data } = await api.get("/profile/doctors");
  return data;
};

export const updateMyDoctorProfile = async (
  profileData: DoctorProfileFormData,
): Promise<DoctorProfile> => {
  const { data } = await api.patch("/profile/doctors", profileData);
  return data;
};

export const updateMyDoctorProfilePicture = async (
  pictureUrl: string,
): Promise<void> => {
  await api.put("/profile/doctors/picture", { pictureUrl });
};

export const getDoctorById = async (id: number): Promise<DoctorProfile> => {
  const { data } = await api.get(`/profile/doctors/${id}`);
  return data;
};

export const getAllDoctors = async (
  page = 0,
  size = 10,
): Promise<Page<DoctorProfile>> => {
  const { data } = await api.get(
    `/profile/doctors/all?page=${page}&size=${size}`,
  );
  return data;
};

// REVIEWS
export const createReview = async (
  reviewData: ReviewRequest,
): Promise<ReviewResponse> => {
  const { data } = await api.post("/profile/reviews", reviewData);
  return data;
};

export const getDoctorStats = async (
  doctorId: number,
): Promise<DoctorRatingStats> => {
  const { data } = await api.get(`/profile/reviews/doctor/${doctorId}/stats`);
  return data;
};

export const getDoctorReviews = async (
  doctorId: number,
): Promise<ReviewResponse[]> => {
  const { data } = await api.get(`/profile/reviews/doctor/${doctorId}`);
  return data;
};
