import { Outlet } from "react-router";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Header } from "@/components/header/Header";
import { useAppDispatch } from "@/hooks/hooks";
import { logout } from "@/slices/authSlice";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const AdminDashboard = () => {
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <AdminSidebar />
      </Sidebar>
      <SidebarInset>
        <header className="bg-card border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-2 py-2">
            <SidebarTrigger />
            <div className="flex-1" />
            <Header onLogout={handleLogout} />
          </div>
        </header>
        <div className="p-6 bg-background h-full">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
