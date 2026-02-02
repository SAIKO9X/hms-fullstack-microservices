import api from "@/config/axios";
import type { AdminCreateUserFormData } from "@/lib/schemas/admin.schema";
import type { ApiResponse } from "@/types/api.types";
import type { AuditLogResponse } from "@/types/admin.types";
import type { AppointmentDetail } from "@/types/appointment.types";
import type { MedicalHistory } from "@/types/patient.types";

interface UpdateUserStatusPayload {
  userId: number;
  active: boolean;
}

// USER MANAGEMENT
export const updateUserStatus = async ({
  userId,
  active,
}: UpdateUserStatusPayload): Promise<void> => {
  await api.patch<ApiResponse<void>>(`/users/${userId}/status`, { active });
};

export const adminCreateUser = async (
  userData: AdminCreateUserFormData,
): Promise<void> => {
  await api.post<ApiResponse<void>>("/users/admin/create", userData);
};

export const adminUpdateUser = async (userData: any): Promise<void> => {
  const { userId, ...payload } = userData;
  await api.put<ApiResponse<void>>(`/users/admin/update/${userId}`, payload);
};

// APPOINTMENTS
export const getAppointmentsByDoctorId = async (
  doctorId: number,
): Promise<AppointmentDetail[]> => {
  const { data } = await api.get<ApiResponse<AppointmentDetail[]>>(
    `/admin/stats/by-doctor/${doctorId}`,
  );
  return data.data;
};

// MEDICAL HISTORY
export const getPatientMedicalHistoryById = async (
  patientId: number,
): Promise<MedicalHistory> => {
  const { data } = await api.get<ApiResponse<MedicalHistory>>(
    `/profile/admin/patient/${patientId}/medical-history`,
  );
  return data.data;
};

// AUDIT LOGS
export const getAuditLogs = async (
  page = 0,
  size = 20,
): Promise<AuditLogResponse> => {
  const { data } = await api.get<ApiResponse<AuditLogResponse>>("/audit/logs", {
    params: { page, size, sort: "timestamp,desc" },
  });
  return data.data;
};
