import api from "@/config/axios";
import type { AdminCreateUserFormData } from "@/lib/schemas/admin.schema";
import type { AppointmentDetail } from "@/types/appointment.types";
import type { MedicalHistory } from "@/types/patient.types";

interface UpdateUserStatusPayload {
  userId: number;
  active: boolean;
}

// Atualiza o status de um utilizador (ativo/inativo).
export const updateUserStatus = async ({
  userId,
  active,
}: UpdateUserStatusPayload): Promise<void> => {
  await api.patch(`/users/${userId}/status`, { active });
};

// Cria um novo utilizador (paciente ou médico) como administrador.
export const adminCreateUser = async (
  userData: AdminCreateUserFormData
): Promise<void> => {
  await api.post("/users/admin/create", userData);
};

// Atualiza os dados de um utilizador (paciente ou médico) como administrador.
export const adminUpdateUser = async (userData: any): Promise<void> => {
  const { userId, ...payload } = userData;
  await api.put(`/users/admin/update/${userId}`, payload);
};

// Busca todos os detalhes de consulta para um médico específico (usado pelo Admin).
export const getAppointmentsByDoctorId = async (
  doctorId: number
): Promise<AppointmentDetail[]> => {
  const { data } = await api.get(`/admin/stats/by-doctor/${doctorId}`);
  return data;
};

// Busca o histórico médico completo para um paciente específico (usado pelo Admin).
export const getPatientMedicalHistoryById = async (
  patientId: number
): Promise<MedicalHistory> => {
  const { data } = await api.get(
    `/profile/admin/patient/${patientId}/medical-history`
  );
  return data;
};
