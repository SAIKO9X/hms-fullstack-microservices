import { Skeleton } from "@/components/ui/skeleton";
import {
  useDoctorDashboardStats,
  useUniquePatientsCount,
} from "@/services/queries/appointment-queries";
import { AlertCircle, Check, Clock, Users, X } from "lucide-react";
import { StatusPieChart } from "@/features/doctor/components/StatusPieChart";
import { UpcomingAppointments } from "@/features/doctor/components/UpcomingAppointments";
import { StatCard } from "@/features/doctor/components/StatCard"; // Importe o novo componente
import { PatientGroupsCard } from "@/features/doctor/components/PatientGroupsCard";
import { AdverseEffectsCard } from "@/features/doctor/components/AdverseEffectsCard";

export const DoctorDashboardPage = () => {
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError,
  } = useDoctorDashboardStats();
  const { data: uniquePatients, isLoading: isLoadingPatients } =
    useUniquePatientsCount();

  const isLoading = isLoadingStats || isLoadingPatients;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        <AlertCircle className="mr-2 h-6 w-6" />
        <p className="text-lg">Erro ao carregar as estatísticas.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Uma visão geral e rápida da sua atividade médica.
        </p>
      </div>

      {/* Seção de Estatísticas com os novos Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Consultas Hoje"
          value={stats?.appointmentsTodayCount || 0}
          icon={Clock}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="Concluídas (Semana)"
          value={stats?.completedThisWeekCount || 0}
          icon={Check}
          color="green"
          isLoading={isLoading}
        />
        <StatCard
          title="Pacientes Atendidos"
          value={uniquePatients || 0}
          icon={Users}
          color="purple"
          isLoading={isLoading}
        />
        <StatCard
          title="Canceladas (Total)"
          value={stats?.statusDistribution.CANCELED || 0}
          icon={X}
          color="red"
          isLoading={isLoading}
        />
      </div>

      {/* Seção para Gráficos e Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UpcomingAppointments />

        {isLoading || !stats ? (
          <Skeleton className="h-[400px] w-full rounded-lg" />
        ) : (
          <StatusPieChart data={stats.statusDistribution} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PatientGroupsCard />
        </div>
        <div>
          <AdverseEffectsCard />
        </div>
      </div>
    </div>
  );
};
