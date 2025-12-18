import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "@/store/hooks";
import type { UserRole } from "@/types/auth.types";

interface RoleBasedGuardProps {
  allowedRoles: UserRole[];
}

export const RoleBasedGuard = ({ allowedRoles }: RoleBasedGuardProps) => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user || !user.role) {
    return <Navigate to="/auth" replace />;
  }

  // verifica se a role do usuário está na lista de roles permitidas
  const isAuthorized = allowedRoles.includes(user.role);

  if (!isAuthorized) {
    // redireciona para a página inicial do dashboard
    const homeDashboard =
      user.role === "DOCTOR" ? "/doctor/dashboard" : "/patient/dashboard";
    return <Navigate to={homeDashboard} replace />;
  }

  return <Outlet />;
};
