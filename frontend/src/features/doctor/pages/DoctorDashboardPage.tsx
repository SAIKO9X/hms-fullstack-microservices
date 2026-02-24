import { Skeleton } from "@/components/ui/skeleton";
import {
  useDoctorDashboardStats,
  useUniquePatientsCount,
  useGetDoctorAvailability,
} from "@/services/queries/appointment-queries";
import { useGetDoctorProfile } from "@/services/queries/doctor-queries";
import {
  AlertCircle,
  Check,
  Clock,
  Users,
  X,
  TriangleAlert,
  ArrowRight,
} from "lucide-react";
import { StatusPieChart } from "@/features/doctor/components/StatusPieChart";
import { UpcomingAppointments } from "@/features/doctor/components/UpcomingAppointments";
import { StatCard } from "@/components/shared/StatCard";
import { PatientGroupsCard } from "@/features/doctor/components/PatientGroupsCard";
import { AdverseEffectsCard } from "@/features/doctor/components/AdverseEffectsCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export const DoctorDashboardPage = () => {
  const navigate = useNavigate();
  const {
    data: stats,
    isLoading: isLoadingStats,
    isError,
  } = useDoctorDashboardStats();
  const { data: uniquePatients, isLoading: isLoadingPatients } =
    useUniquePatientsCount();
  const { data: doctorProfile, isLoading: isLoadingProfile } =
    useGetDoctorProfile();
  const { data: availability, isLoading: isLoadingAvailability } =
    useGetDoctorAvailability(doctorProfile?.id ? Number(doctorProfile.id) : 0);
  const isLoading = isLoadingStats || isLoadingPatients;
  const isCheckingProfile = isLoadingProfile || isLoadingAvailability;
  const missingFee = !doctorProfile?.consultationFee;
  const missingSpecialization = !doctorProfile?.specialization;
  const missingBiography = !doctorProfile?.biography;
  const missingAvailability = !availability || availability.length === 0;
  const isProfileIncomplete =
    doctorProfile &&
    (missingFee ||
      missingSpecialization ||
      missingBiography ||
      missingAvailability);

  const handleFixProfile = () => {
    if (missingFee || missingSpecialization || missingBiography) {
      navigate("/doctor/profile");
    } else {
      navigate("/doctor/availability");
    }
  };

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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Uma visão geral e rápida da sua atividade médica.
        </p>
      </div>

      {!isCheckingProfile && isProfileIncomplete && (
        <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
          <TriangleAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-lg font-semibold text-amber-800 dark:text-amber-300 ml-2">
            Atenção: Ação Necessária!
          </AlertTitle>
          <AlertDescription className="mt-2 ml-2">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm">
                <p>
                  Para aparecer na lista de agendamentos e receber consultas,
                  você precisa preencher:
                </p>
                <ul className="list-disc list-inside mt-1 font-medium">
                  {missingFee && <li>Preço da Consulta</li>}
                  {missingSpecialization && <li>Especialização</li>}
                  {missingBiography && <li>Biografia/Sobre mim</li>}
                  {missingAvailability && (
                    <li>Horários de Atendimento (Jornada de Trabalho)</li>
                  )}
                </ul>
                <p className="mt-2 text-amber-800/80 dark:text-amber-300/80 italic">
                  Enquanto isso não for feito, você está{" "}
                  <strong>invisível</strong> para os pacientes.
                </p>
              </div>
              <Button
                onClick={handleFixProfile}
                variant="outline"
                className="whitespace-nowrap border-amber-600 text-amber-700 hover:bg-amber-100 hover:text-amber-900 dark:border-amber-500 dark:text-amber-400 dark:hover:bg-amber-900/50"
              >
                Resolver Agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Consultas Hoje"
          value={stats?.appointmentsTodayCount || 0}
          icon={Clock}
          variant="blue"
          loading={isLoading}
        />
        <StatCard
          title="Concluídas (Semana)"
          value={stats?.completedThisWeekCount || 0}
          icon={Check}
          variant="green"
          loading={isLoading}
        />
        <StatCard
          title="Pacientes Atendidos"
          value={uniquePatients || 0}
          icon={Users}
          variant="purple"
          loading={isLoading}
        />
        <StatCard
          title="Canceladas (Total)"
          value={stats?.statusDistribution.CANCELED || 0}
          icon={X}
          variant="red"
          loading={isLoading}
        />
      </div>

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
