// Componente de Card de Estatística com tipagem correta
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  Activity,
  type LucideIcon,
} from "lucide-react";
import {
  useAdminProfileCounts,
  useAppointmentsTodayCount,
} from "@/services/queries/admin-queries";
import { ActivityChart } from "../components/dashboard/ActivityChart";
import { DoctorStatusList } from "../components/dashboard/DoctorStatusList";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "orange";
  description: string;
  trend?: string;
  isLoading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  description,
  trend,
  isLoading,
}) => {
  const colorClasses = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      icon: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500/10 to-blue-600/5",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-950/30",
      icon: "text-green-600 dark:text-green-400",
      gradient: "from-green-500/10 to-green-600/5",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      icon: "text-purple-600 dark:text-purple-400",
      gradient: "from-purple-500/10 to-purple-600/5",
    },
    orange: {
      bg: "bg-orange-50 dark:bg-orange-950/30",
      icon: "text-orange-600 dark:text-orange-400",
      gradient: "from-orange-500/10 to-orange-600/5",
    },
  };
  const colors = colorClasses[color];

  return (
    <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-none shadow-md group">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        <div
          className={`p-3 rounded-xl ${colors.bg} transition-all duration-300 group-hover:scale-110`}
        >
          <Icon className={`h-5 w-5 ${colors.icon}`} />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold tracking-tight">
              {isLoading ? "..." : value}
            </div>
            {trend && !isLoading && (
              <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span>{trend}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Página Principal do Dashboard
export const AdminDashboardPage = () => {
  const { data: profileCounts, isLoading: isLoadingCounts } =
    useAdminProfileCounts();
  const { data: appointmentsToday, isLoading: isLoadingAppointments } =
    useAppointmentsTodayCount();
  const isLoading = isLoadingCounts || isLoadingAppointments;

  return (
    <div className="container mx-auto py-8 space-y-8 px-4">
      {/* Header */}
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

      {/* Cards de Estatísticas */}
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

      {/* Gráficos e Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart />
        <DoctorStatusList />
      </div>
    </div>
  );
};
