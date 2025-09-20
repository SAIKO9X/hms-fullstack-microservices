import axios from "axios";
import type { AppStore } from "@/store";
import { logout } from "@/slices/authSlice";
import type { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "http://localhost:9000",
});

// Interceptor de requisição
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
        store.dispatch(logout());
      }
      return Promise.reject(error);
    }
  );
};

export default api;
