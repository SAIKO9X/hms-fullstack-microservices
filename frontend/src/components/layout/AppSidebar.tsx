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
import { Heart, Lock } from "lucide-react";
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
import { useProfileStatus } from "@/hooks/use-profile-check";
import type { NavGroup } from "@/config/navigation";

interface AppSidebarProps {
  title?: string;
  subtitle: string;
  groups: NavGroup[];
  checkProfile?: boolean;
}

export const AppSidebar = ({
  title = "MediCare",
  subtitle,
  groups,
  checkProfile = false,
}: AppSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { isComplete, isLoading } = useProfileStatus();
  const isProfileIncomplete = checkProfile ? !isLoading && !isComplete : false;
  const handleNavigation = (url: string, isRestricted?: boolean) => {
    if (isRestricted && isProfileIncomplete) {
      setIsAlertOpen(true);
      return;
    }
    navigate(url);
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
                {title}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                {subtitle}
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="py-4 bg-sidebar">
          {groups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent className="space-y-1">
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isLocked =
                      isProfileIncomplete && (item.restricted ?? false);
                    const isActive =
                      location.pathname === item.url ||
                      location.pathname.startsWith(`${item.url}/`);

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          isActive={isActive}
                          onClick={() =>
                            handleNavigation(item.url, item.restricted)
                          }
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 
                            hover:bg-primary/10 hover:text-primary 
                            data-[active=true]:bg-primary/15 data-[active=true]:text-primary 
                            ${isLocked ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {isLocked ? (
                            <Lock className="h-4 w-4 text-muted-foreground/70" />
                          ) : (
                            <item.icon className="h-4 w-4" />
                          )}
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
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
              Para acessar esta funcionalidade, você precisa completar seu
              cadastro (Dados pessoais, CRM, etc).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Agora não</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setIsAlertOpen(false);
                // detecta para onde mandar baseado na URL atual
                if (location.pathname.includes("doctor"))
                  navigate("/doctor/profile");
                else navigate("/patient/profile");
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
