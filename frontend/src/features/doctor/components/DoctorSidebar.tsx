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
} from "lucide-react";

export const DoctorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mainItems = [
    {
      title: "Dashboard",
      url: "/doctor/dashboard",
      icon: Home,
    },
    {
      title: "Minha Agenda",
      url: "/doctor/appointments",
      icon: Calendar,
    },
    {
      title: "Meus Horários",
      url: "/doctor/availability",
      icon: CalendarClock,
    },
    {
      title: "Meus Pacientes",
      url: "/doctor/patients",
      icon: Users,
    },
    {
      title: "Prontuários",
      url: "/doctor/records",
      icon: FileText,
    },
  ];

  const accountItems = [
    {
      title: "Meu Perfil",
      url: "/doctor/profile",
      icon: UserPen,
    },
  ];

  const isActive = (url: string) => {
    return location.pathname === url;
  };

  const handleNavigation = (url: string) => {
    navigate(url);
  };

  return (
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
            Visão Geral
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    onClick={() => handleNavigation(item.url)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 
                    hover:bg-primary/10 hover:text-primary 
                    data-[active=true]:bg-primary/15 data-[active=true]:text-primary data-[active=true]:font-semibold"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Conta
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    onClick={() => handleNavigation(item.url)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 
                    hover:bg-primary/10 hover:text-primary 
                    data-[active=true]:bg-primary/15 data-[active=true]:text-primary data-[active=true]:font-semibold"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
          <div className="relative">
            <div className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <p className="font-medium text-foreground text-xs">
              Sistema Online
            </p>
            <p className="text-[10px] opacity-70">v1.0.0 Stable</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
