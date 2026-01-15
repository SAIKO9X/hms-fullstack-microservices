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

// Verifica a conta do usuário
export const verifyAccount = async (email: string, code: string) => {
  try {
    const response = await api.post(`/auth/verify`, null, {
      params: { email, code },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.errorMessage || "Código inválido ou expirado."
    );
  }
};

// Reenvia o código de verificação para o email
export const resendVerificationCode = async (email: string) => {
  try {
    await api.post(`/auth/resend-code`, null, {
      params: { email },
    });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.errorMessage || "Erro ao reenviar código."
    );
  }
};
