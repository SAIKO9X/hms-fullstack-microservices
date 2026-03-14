import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Navigate, Outlet } from "react-router";
import { logout } from "@/store/slices/authSlice";
import { useEffect } from "react";

export const PrivateRoute = () => {
  const dispatch = useAppDispatch();
  // Verifica se existe um token no estado do Redux
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!token) {
       dispatch(logout());
    }
  }, [token, dispatch]);

  if (!token) {
    // Se não há token, redireciona para a página de autenticação
    return <Navigate to="/auth" replace />;
  }

  // Se há um token, renderiza a rota filha
  return <Outlet />;
};
