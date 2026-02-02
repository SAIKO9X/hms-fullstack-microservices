import api from "@/config/axios";
import type { ApiResponse } from "@/types/api.types";
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
  const { data } =
    await api.get<ApiResponse<PatientProfile>>("/profile/patients");
  return data.data;
};

export const updateMyPatientProfile = async (
  profileData: PatientProfileFormData,
): Promise<PatientProfile> => {
  const { data } = await api.patch<ApiResponse<PatientProfile>>(
    "/profile/patients",
    profileData,
  );
  return data.data;
};

export const updateMyPatientProfilePicture = async (
  pictureUrl: string,
): Promise<void> => {
  await api.put<ApiResponse<void>>("/profile/patients/picture", { pictureUrl });
};

export const getPatientById = async (id: number): Promise<PatientProfile> => {
  const { data } = await api.get<ApiResponse<PatientProfile>>(
    `/profile/patients/${id}`,
  );
  return data.data;
};

export const getAllPatients = async (
  page = 0,
  size = 10,
): Promise<Page<PatientProfile>> => {
  const { data } = await api.get<ApiResponse<Page<PatientProfile>>>(
    `/profile/patients/all?page=${page}&size=${size}`,
  );
  return data.data;
};

export const getPatientsForDropdown = async (): Promise<
  { userId: number; name: string }[]
> => {
  const { data } = await api.get<
    ApiResponse<{ userId: number; name: string }[]>
  >("/profile/patients/dropdown");
  return data.data;
};

// DOCTOR PROFILE
export const getMyDoctorProfile = async (): Promise<DoctorProfile> => {
  const { data } =
    await api.get<ApiResponse<DoctorProfile>>("/profile/doctors");
  return data.data;
};

export const updateMyDoctorProfile = async (
  profileData: DoctorProfileFormData,
): Promise<DoctorProfile> => {
  const { data } = await api.patch<ApiResponse<DoctorProfile>>(
    "/profile/doctors",
    profileData,
  );
  return data.data;
};

export const updateMyDoctorProfilePicture = async (
  pictureUrl: string,
): Promise<void> => {
  await api.put<ApiResponse<void>>("/profile/doctors/picture", { pictureUrl });
};

export const getDoctorById = async (id: number): Promise<DoctorProfile> => {
  const { data } = await api.get<ApiResponse<DoctorProfile>>(
    `/profile/doctors/${id}`,
  );
  return data.data;
};

export const getAllDoctors = async (
  page = 0,
  size = 10,
): Promise<Page<DoctorProfile>> => {
  const { data } = await api.get<ApiResponse<Page<DoctorProfile>>>(
    `/profile/doctors/all?page=${page}&size=${size}`,
  );
  return data.data;
};

// REVIEWS
export const createReview = async (
  reviewData: ReviewRequest,
): Promise<ReviewResponse> => {
  const { data } = await api.post<ApiResponse<ReviewResponse>>(
    "/profile/reviews",
    reviewData,
  );
  return data.data;
};

export const getDoctorStats = async (
  doctorId: number,
): Promise<DoctorRatingStats> => {
  const { data } = await api.get<ApiResponse<DoctorRatingStats>>(
    `/profile/reviews/doctor/${doctorId}/stats`,
  );
  return data.data;
};

export const getDoctorReviews = async (
  doctorId: number,
): Promise<ReviewResponse[]> => {
  const { data } = await api.get<ApiResponse<ReviewResponse[]>>(
    `/profile/reviews/doctor/${doctorId}`,
  );
  return data.data;
};
