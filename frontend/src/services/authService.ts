import api from "@/lib/interceptor/AxiosInterceptor";
import type { LoginData, RegisterData } from "@/lib/schemas/auth";
import type { AuthResponse } from "@/types/auth.types";

/**
 * Registra um novo usuário.
 * Em caso de sucesso, retorna os dados do usuário criado.
 * Em caso de erro, lança uma exceção com a mensagem do backend.
 */
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

/**
 * Autentica um usuário.
 * Em caso de sucesso, retorna o AuthResponse completo.
 * Em caso de erro, lança uma exceção com a mensagem do backend.
 */
export const loginUser = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/login", data);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.errorMessage || "Credenciais inválidas."
    );
  }
};
