import api from "@/config/axios";
import type { LoginData, RegisterData } from "@/lib/schemas/auth.schema";
import type { AuthResponse } from "@/types/auth.types";

// Registra um novo usuário.
export const registerUser = async (data: RegisterData) => {
  try {
    const response = await api.post("/users/register", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.errorMessage || "Não foi possível criar a conta."
    );
  }
};

// Autentica um usuário.
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    // Limpar qualquer token antigo antes de fazer login
    localStorage.removeItem("authToken");

    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.errorMessage || "Credenciais inválidas."
    );
  }
};
