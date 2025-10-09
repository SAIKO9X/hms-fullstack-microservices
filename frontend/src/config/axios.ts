import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { logout } from "@/store/slices/authSlice";
import type { InternalAxiosRequestConfig } from "axios";
import type { AppStore } from "@/store/store";

const api = axios.create({
  baseURL: "http://localhost:9000",
});

// Função para verificar se o token está expirado
const isTokenExpired = (token: string): boolean => {
  try {
    const decodedToken: { exp: number } = jwtDecode(token);
    return decodedToken.exp * 1000 <= Date.now();
  } catch {
    return true; // Se não conseguir decodificar, considera expirado
  }
};

// Interceptor de requisição
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authToken");

    // Só adiciona o token se ele existir E não estiver expirado
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && isTokenExpired(token)) {
      // Remove token expirado do localStorage
      localStorage.removeItem("authToken");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Resposta
export const setupResponseInterceptor = (store: AppStore) => {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.log("Token inválido ou expirado. Deslogando...");
        localStorage.removeItem("authToken");
        store.dispatch(logout());
      }
      return Promise.reject(error);
    }
  );
};

export default api;
