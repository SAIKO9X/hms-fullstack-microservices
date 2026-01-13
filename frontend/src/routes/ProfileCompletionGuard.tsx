import { Navigate, Outlet, useLocation } from "react-router";
import { useProfileStatus } from "@/hooks/use-profile-check";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ProfileCompletionGuard = () => {
  const location = useLocation();
  const { isComplete, isLoading, role, isError } = useProfileStatus(); // Pegue o isError

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

  if (isError) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">
          Aguardando Criação do Perfil
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Sua conta foi criada, mas estamos finalizando a configuração do seu
          perfil. Isso pode levar alguns segundos devido ao processamento do
          sistema.
        </p>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  const profileUrl = role === "DOCTOR" ? "/doctor/profile" : "/patient/profile";
  const isAtProfilePage = location.pathname === profileUrl;

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
