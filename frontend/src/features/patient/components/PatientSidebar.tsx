import { useState } from "react"; // Adicionado useState
import { useNavigate, useLocation } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  Settings,
  Calendar,
  Shield,
  Stethoscope,
  FileText,
  Heart,
  Clipboard,
  UserPen,
  UserRoundSearch,
  Lock, // Adicionado ícone de cadeado
} from "lucide-react";

// Imports para a lógica de perfil e alerta
import { useProfile } from "@/services/queries/profile-queries";
import { type PatientProfile } from "@/types/patient.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export const PatientSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Busca os dados do perfil
  const { profile, isLoading } = useProfile();
  const patientProfile = profile as PatientProfile;

  // Lógica para verificar se está incompleto (mesma lógica da sua página de perfil)
  const isProfileIncomplete =
    !isLoading &&
    patientProfile &&
    (!patientProfile.phoneNumber ||
      !patientProfile.address ||
      !patientProfile.dateOfBirth ||
      !patientProfile.cpf);

  const mainItems = [
    {
      title: "Dashboard",
      url: "/patient/dashboard",
      icon: Home,
      restricted: false,
    },
    {
      title: "Perfil",
      url: "/patient/profile",
      icon: UserPen,
      restricted: false,
    },
  ];

  const clinicalItems = [
    {
      title: "Consultas",
      url: "/patient/appointments",
      icon: Calendar,
      restricted: true, // Item restrito
    },
    {
      url: "/patient/documents",
      title: "Documentos",
      icon: FileText,
      restricted: true,
    },
    {
      icon: UserRoundSearch,
      title: "Encontrar Médicos",
      url: "/patient/doctors",
      restricted: true,
    },
    {
      title: "Exames",
      url: "/patient/exams",
      icon: Clipboard,
      restricted: true,
    },
    {
      title: "Diagnósticos",
      url: "/patient/diagnostics",
      icon: Stethoscope,
      restricted: true,
    },
    {
      title: "Emergência",
      url: "/patient/emergency",
      icon: Shield,
      restricted: true,
    },
  ];

  const systemItems = [
    {
      title: "Configurações",
      url: "/patient/settings",
      icon: Settings,
      restricted: false,
    },
  ];

  const isActive = (url: string) => {
    return location.pathname === url;
  };

  const handleNavigation = (url: string, isRestricted: boolean) => {
    // Se o item for restrito e o perfil estiver incompleto, mostra o alerta e não navega
    if (isRestricted && isProfileIncomplete) {
      setIsAlertOpen(true);
      return;
    }
    navigate(url);
  };

  // Função auxiliar para renderizar o ícone correto
  const renderIcon = (Icon: any, isRestricted: boolean) => {
    if (isRestricted && isProfileIncomplete) {
      return <Lock className="h-4 w-4 text-muted-foreground/70" />;
    }
    return <Icon className="h-5 w-5" />;
  };

  return (
    <>
      <Sidebar className="border-r border-sidebar-border bg-sidebar">
        <SidebarHeader className="border-b border-sidebar-border px-6 bg-sidebar">
          <div className="flex items-center gap-3 py-1.5">
            <div className="p-2 bg-primary rounded-lg">
              <Heart className="h-6 w-6 text-sidebar" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">MediCare</h2>
              <p className="text-xs text-sidebar-foreground/60">
                Hospital Management
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="py-4 bg-sidebar">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Principal
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {mainItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive(item.url)}
                      onClick={() =>
                        handleNavigation(item.url, item.restricted)
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:border-r-2 data-[active=true]:border-sidebar-primary"
                    >
                      {renderIcon(item.icon, item.restricted)}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Clínico
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {clinicalItems.map((item) => {
                  const locked = item.restricted && isProfileIncomplete;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={isActive(item.url)}
                        onClick={() =>
                          handleNavigation(item.url, item.restricted)
                        }
                        // Adiciona estilo de opacidade se estiver bloqueado
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:border-r-2 data-[active=true]:border-sidebar-primary ${
                          locked ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        {renderIcon(item.icon, item.restricted)}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Sistema
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {systemItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive(item.url)}
                      onClick={() =>
                        handleNavigation(item.url, item.restricted)
                      }
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:border-r-2 data-[active=true]:border-sidebar-primary"
                    >
                      {renderIcon(item.icon, item.restricted)}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="bg-sidebar">
          <div className="flex items-center gap-3 text-sm text-sidebar-foreground">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-full">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
            <div>
              <p className="font-medium">Sistema Online</p>
              <p className="text-xs text-sidebar-foreground/60">Versão 1.0.0</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Alerta de Perfil Incompleto */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Acesso Restrito</AlertDialogTitle>
            <AlertDialogDescription>
              Para acessar as funcionalidades clínicas (Consultas, Exames,
              etc.), você precisa completar seu cadastro com suas informações
              pessoais e de endereço.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Agora não</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                navigate("/patient/profile");
              }}
            >
              Completar Perfil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
