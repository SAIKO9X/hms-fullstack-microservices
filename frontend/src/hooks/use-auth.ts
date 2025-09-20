import { loginUser, logout } from "@/slices/authSlice";
import { useAppDispatch, useAppSelector } from "./hooks";
import type { LoginData } from "@/lib/schemas/auth";

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, status, error } = useAppSelector((state) => state.auth);

  const handleLogin = (credentials: LoginData) => {
    return dispatch(loginUser(credentials)).unwrap();
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    user,
    token,
    status,
    error,
    isLoading: status === "loading",
    isAuthenticated: !!token,
    handleLogin,
    handleLogout,
  };
};
