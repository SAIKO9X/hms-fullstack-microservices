import { useAppSelector } from "@/hooks/hooks";
import { Navigate, Outlet } from "react-router";

export const PrivateRoute = () => {
  // Verifica se existe um token no estado do Redux
  const { token } = useAppSelector((state) => state.auth);

  if (!token) {
    // Se não há token, redireciona para a página de autenticação
    return <Navigate to="/auth" replace />;
  }

  // Se há um token, renderiza a rota filha
  return <Outlet />;
};
