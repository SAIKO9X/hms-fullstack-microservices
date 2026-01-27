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
  UserPen,
  Calendar,
  Users,
  FileText,
  Heart,
  CalendarClock,
  MessageSquare,
  DollarSign,
  Lock,
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

export const DoctorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { isComplete, isLoading } = useProfileStatus();
  const isProfileIncomplete = !isLoading && !isComplete;

  const generalItems = [
    {
      title: "Dashboard",
      url: "/doctor/dashboard",
      icon: Home,
      restricted: true,
    },
  ];

  const scheduleItems = [
    {
      title: "Minha Agenda",
      url: "/doctor/appointments",
      icon: Calendar,
      restricted: true,
    },
    {
      title: "Disponibilidade",
      url: "/doctor/availability",
      icon: CalendarClock,
      restricted: true,
    },
  ];

  const patientCareItems = [
    {
      title: "Meus Pacientes",
      url: "/doctor/patients",
      icon: Users,
      restricted: true,
    },
    {
      title: "Prontuários",
      url: "/doctor/records",
      icon: FileText,
      restricted: true,
    },
  ];

  const communicationItems = [
    {
      title: "Mensagens",
      url: "/doctor/messages",
      icon: MessageSquare,
      restricted: true,
    },
  ];

  const accountItems = [
    {
      title: "Financeiro",
      url: "/doctor/finance",
      icon: DollarSign,
      restricted: true,
    },
    {
      title: "Meu Perfil",
      url: "/doctor/profile",
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
      return <Lock className="h-4 w-4 text-primary/60" />;
    }
    return <Icon className="h-4 w-4" />;
  };

  const renderMenuButton = (item: any) => {
    const locked = (item.restricted ?? false) && isProfileIncomplete;
    return (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton
          isActive={isActive(item.url)}
          onClick={() => handleNavigation(item.url, item.restricted ?? false)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 
          hover:bg-primary/10 hover:text-primary 
          data-[active=true]:bg-primary/15 data-[active=true]:text-primary ${
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
          <div className="flex items-center gap-3 py-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary tracking-tight">
                MediCare
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Área do Médico
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="py-4 bg-sidebar">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Geral
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>{generalItems.map(renderMenuButton)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Agenda
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>{scheduleItems.map(renderMenuButton)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Atendimento
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {patientCareItems.map(renderMenuButton)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Comunicação
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>
                {communicationItems.map(renderMenuButton)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Minha Conta
            </SidebarGroupLabel>
            <SidebarGroupContent className="space-y-1">
              <SidebarMenu>{accountItems.map(renderMenuButton)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
            <div className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse" />
            <div className="flex flex-col">
              <p className="font-medium text-foreground text-xs">
                Sistema Online
              </p>
              <p className="text-[10px] opacity-70">v1.0.0 Stable</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Perfil Incompleto</AlertDialogTitle>
            <AlertDialogDescription>
              Médico, você precisa preencher seu CRM e especialização no perfil
              para acessar as funções de atendimento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Agora não</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/doctor/profile")}>
              Ir para Perfil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
