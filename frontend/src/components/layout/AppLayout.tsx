import { Outlet } from "react-router";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Header } from "@/components/header/Header";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { AppSidebar } from "./AppSidebar";
import type { NavGroup } from "@/config/navigation";

interface AppLayoutProps {
  subtitle: string;
  groups: NavGroup[];
  checkProfile?: boolean;
}

export const AppLayout = ({
  subtitle,
  groups,
  checkProfile,
}: AppLayoutProps) => {
  const dispatch = useAppDispatch();

  return (
    <SidebarProvider>
      <AppSidebar
        subtitle={subtitle}
        groups={groups}
        checkProfile={checkProfile}
      />

      <SidebarInset>
        <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-2">
            <SidebarTrigger />
            <div className="flex-1" />
            <Header onLogout={() => dispatch(logout())} />
          </div>
        </header>

        <main className="p-6 bg-background h-full min-h-[calc(100vh-64px)] overflow-x-hidden">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
