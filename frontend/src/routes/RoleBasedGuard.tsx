import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "@/hooks/hooks";
import type { UserRole } from "@/types/auth.types";

interface RoleBasedGuardProps {
  allowedRoles: UserRole[];
}

export const RoleBasedGuard = ({ allowedRoles }: RoleBasedGuardProps) => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user || !user.role) {
    // Se não houver usuário ou role, redireciona para o login
    return <Navigate to="/auth" replace />;
  }

  // Verifica se a role do usuário está na lista de roles permitidas
  const isAuthorized = allowedRoles.includes(user.role);

  if (!isAuthorized) {
    // Se não estiver autorizado, redireciona para a página inicial do seu próprio dashboard
    // Isso impede um paciente de acessar a URL de um médico
    const homeDashboard =
      user.role === "DOCTOR" ? "/doctor/dashboard" : "/patient/dashboard";
    return <Navigate to={homeDashboard} replace />;
  }

  // Se estiver autorizado, renderiza a rota
  return <Outlet />;
};
