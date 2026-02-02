import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { logout } from "@/store/slices/authSlice";
import type { InternalAxiosRequestConfig } from "axios";
import type { AppStore } from "@/store/store";
import type { ApiResponse } from "@/types/api.types";

const api = axios.create({
  baseURL: "http://localhost:9000",
  withCredentials: true,
});

const isTokenExpired = (token: string): boolean => {
  try {
    const decodedToken: { exp: number } = jwtDecode(token);
    return decodedToken.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authToken");

    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && isTokenExpired(token)) {
      localStorage.removeItem("authToken");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export const setupResponseInterceptor = (store: AppStore) => {
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError<ApiResponse<any>>) => {
      if (error.response && error.response.status === 401) {
        if (!window.location.pathname.includes("/login")) {
          console.log("Token inválido ou expirado. Deslogando...");
          localStorage.removeItem("authToken");
          store.dispatch(logout());
        }
      }

      if (error.response?.data) {
        const apiResponse = error.response.data;
        const customMessage = apiResponse.message || apiResponse.error?.type;
        if (customMessage) {
          error.message = customMessage;
        }
      }

      return Promise.reject(error);
    },
  );
};

export default api;
