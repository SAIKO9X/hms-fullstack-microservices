import api from "@/config/axios";
import type { AdminCreateUserFormData } from "@/lib/schemas/admin.schema";

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
export const adminUpdateUser = async (
  userData: any 
): Promise<void> => {
  const { userId, ...payload } = userData;
  await api.put(`/users/admin/update/${userId}`, payload);
};
