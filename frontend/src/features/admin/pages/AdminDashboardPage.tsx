import { Users, Briefcase, Calendar, Activity } from "lucide-react";
import {
  useAdminProfileCounts,
  useAppointmentsTodayCount,
} from "@/services/queries/admin-queries";
import { ActivityChart } from "../components/dashboard/ActivityChart";
import { DoctorStatusList } from "../components/dashboard/DoctorStatusList";
import { StatCard } from "@/components/shared/StatCard";
import { PharmacyRevenueChart } from "../components/dashboard/PharmacyRevenueChart";

export const AdminDashboardPage = () => {
  const { data: profileCounts, isLoading: isLoadingCounts } =
    useAdminProfileCounts();
  const { data: appointmentsToday, isLoading: isLoadingAppointments } =
    useAppointmentsTodayCount();
  const isLoading = isLoadingCounts || isLoadingAppointments;

  return (
    <div className="container mx-auto py-8 space-y-8 px-4">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Dashboard Administrativo
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              Visão geral do sistema de gestão hospitalar
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de Pacientes"
          value={profileCounts?.totalPatients || 0}
          icon={Users}
          color="blue"
          description="Pacientes registrados no sistema"
          isLoading={isLoading}
        />
        <StatCard
          title="Total de Médicos"
          value={profileCounts?.totalDoctors || 0}
          icon={Briefcase}
          color="purple"
          description="Médicos disponíveis na plataforma"
          isLoading={isLoading}
        />
        <StatCard
          title="Consultas Hoje"
          value={`+${appointmentsToday ?? 0}`}
          icon={Calendar}
          color="green"
          description="Consultas agendadas para hoje"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart />
        <DoctorStatusList />
        <PharmacyRevenueChart />
      </div>
    </div>
  );
};
