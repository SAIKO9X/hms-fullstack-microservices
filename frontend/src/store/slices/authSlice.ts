import { jwtDecode } from "jwt-decode";
import type { LoginData } from "@/lib/schemas/auth.schema";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { AuthResponse, UserResponse } from "@/types/auth.types";
import { loginUser as loginUserService } from "@/services/auth";

// Define a "forma" do estado de autenticação
interface AuthState {
  user: UserResponse | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const getUserFromToken = (): UserResponse | null => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;

  try {
    const decodedToken: {
      fullName: string;
      role: string;
      userId: number;
      sub: string;
      exp: number;
    } = jwtDecode(token);

    // Verifica se o token não expirou
    if (decodedToken.exp * 1000 > Date.now()) {
      return {
        id: decodedToken.userId,
        name: decodedToken.fullName,
        email: decodedToken.sub, // 'sub' é o e-mail
        role: decodedToken.role as "PATIENT" | "DOCTOR" | "ADMIN",
      };
    } else {
      // Token expirado - remove do localStorage
      localStorage.removeItem("authToken");
      return null;
    }
  } catch (error) {
    // Se o token for inválido, limpa
    localStorage.removeItem("authToken");
    return null;
  }
};

const initialState: AuthState = {
  user: getUserFromToken(),
  token: localStorage.getItem("authToken"),
  status: "idle",
  error: null,
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginData, { rejectWithValue }) => {
    try {
      const response = await loginUserService(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("authToken");
    },
    // Nova ação para limpar token expirado
    clearExpiredToken: (state) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const decodedToken: { exp: number } = jwtDecode(token);
          if (decodedToken.exp * 1000 <= Date.now()) {
            state.user = null;
            state.token = null;
            localStorage.removeItem("authToken");
          }
        } catch {
          // Token inválido
          state.user = null;
          state.token = null;
          localStorage.removeItem("authToken");
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.status = "succeeded";
          state.user = action.payload.user;
          state.token = action.payload.token;
          localStorage.setItem("authToken", action.payload.token);
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearExpiredToken } = authSlice.actions;
export default authSlice.reducer;
