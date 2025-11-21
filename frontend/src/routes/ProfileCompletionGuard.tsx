import { Navigate, Outlet, useLocation } from "react-router";
import { useProfileStatus } from "@/hooks/use-profile-check";
import { Loader2 } from "lucide-react";

export const ProfileCompletionGuard = () => {
  const location = useLocation();
  const { isComplete, isLoading, role } = useProfileStatus();

  // loading enquanto o React Query busca os dados
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <span className="text-muted-foreground text-sm">
          Verificando cadastro...
        </span>
      </div>
    );
  }

  const profileUrl = role === "DOCTOR" ? "/doctor/profile" : "/patient/profile";
  // verifica se o usuário está na página de perfil (para evitar loop infinito)
  const isAtProfilePage = location.pathname === profileUrl;

  // redireciona para a página de perfil caso não esteja completo
  if (!isComplete) {
    if (!isAtProfilePage) {
      return (
        <Navigate
          to={profileUrl}
          replace
          state={{
            message:
              "Para sua segurança, complete seu cadastro antes de continuar.",
          }}
        />
      );
    }
  }

  return <Outlet />;
};
