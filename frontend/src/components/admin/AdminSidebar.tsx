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
  Users,
  UserCheck,
  Heart,
  Pill,
  Archive,
  ShoppingCart,
  Store,
} from "lucide-react";

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainItems = [
    { title: "Dashboard", url: "/admin/dashboard", icon: Home },
    { title: "Pacientes", url: "/admin/patients", icon: Users },
    { title: "Médicos", url: "/admin/doctors", icon: UserCheck },
  ];

  // Seção de Farmácia
  const pharmacyItems = [
    { title: "Medicamentos", url: "/admin/medicines", icon: Pill },
    { title: "Inventário", url: "/admin/inventory", icon: Archive },
    { title: "Vendas", url: "/admin/sales", icon: ShoppingCart },
    { title: "Vendas Direta", url: "/admin/new-sale", icon: Store },
  ];

  const systemItems = [
    { title: "Configurações", url: "/admin/settings", icon: Settings },
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
                    onClick={() => handleNavigation(item.url)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:border-r-2 data-[active=true]:border-sidebar-primary"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
            Farmácia
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-1">
            <SidebarMenu>
              {pharmacyItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={isActive(item.url)}
                    onClick={() => handleNavigation(item.url)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
                    onClick={() => handleNavigation(item.url)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:border-r-2 data-[active=true]:border-sidebar-primary"
                  >
                    <item.icon className="h-5 w-5" />
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
  );
};
