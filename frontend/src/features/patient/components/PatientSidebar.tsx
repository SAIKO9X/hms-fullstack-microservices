import { useState } from "react";
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
  Calendar,
  FileText,
  Heart,
  UserPen,
  UserRoundSearch,
  Lock,
  Pill,
  History,
  MessageSquare,
} from "lucide-react";
import { useProfileStatus } from "@/hooks/use-profile-check";
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

export const PatientSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { isComplete, isLoading } = useProfileStatus();
  const isProfileIncomplete = !isLoading && !isComplete;

  const generalItems = [
    {
      title: "Dashboard",
      url: "/patient/dashboard",
      icon: Home,
      restricted: true,
    },
  ];

  const appointmentsItems = [
    {
      title: "Minhas Consultas",
      url: "/patient/appointments",
      icon: Calendar,
      restricted: true,
    },
    {
      title: "Encontrar Médicos",
      url: "/patient/doctors",
      icon: UserRoundSearch,
      restricted: true,
    },
  ];

  const healthRecordsItems = [
    {
      title: "Histórico Médico",
      url: "/patient/medical-history",
      icon: History,
      restricted: true,
    },
    {
      title: "Prescrições",
      url: "/patient/prescriptions",
      icon: Pill,
      restricted: true,
    },
    {
      title: "Documentos",
      url: "/patient/documents",
      icon: FileText,
      restricted: true,
    },
  ];

  const communicationItems = [
    {
      title: "Mensagens",
      url: "/patient/messages",
      icon: MessageSquare,
      restricted: true,
    },
  ];

  const accountItems = [
    {
      title: "Meu Perfil",
      url: "/patient/profile",
      icon: UserPen,
      restricted: false,
    },
  ];

  const isActive = (url: string) => location.pathname === url;

  const handleNavigation = (url: string, isRestricted: boolean) => {
    if (isRestricted && isProfileIncomplete) {
      setIsAlertOpen(true);
      return;
    }
    navigate(url);
  };

  const renderIcon = (Icon: any, isRestricted: boolean) => {
    if (isRestricted && isProfileIncomplete) {
      return <Lock className="h-4 w-4 text-muted-foreground/70" />;
    }
    return <Icon className="h-5 w-5" />;
  };

  const renderMenuButton = (item: any) => {
    const locked = (item.restricted ?? false) && isProfileIncomplete;
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          isActive={isActive(item.url)}
          onClick={() => handleNavigation(item.url, item.restricted ?? false)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent text-sidebar-foreground data-[active=true]:bg-sidebar-accent ${
            locked ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {renderIcon(item.icon, item.restricted ?? false)}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
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
                Portal do Paciente
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="py-4 bg-sidebar">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Geral
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>{generalItems.map(renderMenuButton)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Agendamentos
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {appointmentsItems.map(renderMenuButton)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Registros de Saúde
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {healthRecordsItems.map(renderMenuButton)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Comunicação
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {communicationItems.map(renderMenuButton)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
              Minha Conta
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>{accountItems.map(renderMenuButton)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="bg-sidebar">
          <div className="flex items-center gap-3 text-sm text-sidebar-foreground p-4">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <p className="font-medium text-xs">Sistema Online v1.0.0</p>
          </div>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Acesso Restrito</AlertDialogTitle>
            <AlertDialogDescription>
              Para acessar esta funcionalidade, você precisa completar seu
              cadastro (CPF, Endereço, etc).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Agora não</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/patient/profile")}>
              Completar Perfil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
