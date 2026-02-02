import api from "@/config/axios";
import type { LoginData, RegisterData } from "@/lib/schemas/auth.schema";
import type { AuthResponse } from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";

// USER REGISTRATION
export const registerUser = async (data: RegisterData) => {
  try {
    const response = await api.post<ApiResponse<any>>("/users/register", data);
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Não foi possível criar a conta.",
    );
  }
};

// AUTHENTICATION
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    localStorage.removeItem("authToken");
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data,
    );

    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Credenciais inválidas.");
  }
};

// ACCOUNT VERIFICATION
export const verifyAccount = async (email: string, code: string) => {
  try {
    const response = await api.post<ApiResponse<string>>("/auth/verify", null, {
      params: { email, code },
    });
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Código inválido ou expirado.",
    );
  }
};

export const resendVerificationCode = async (email: string) => {
  try {
    await api.post<ApiResponse<void>>("/auth/resend-code", null, {
      params: { email },
    });
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erro ao reenviar código.",
    );
  }
};
