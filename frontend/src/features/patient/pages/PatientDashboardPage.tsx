import { useAppSelector } from "@/store/hooks";
import {
  useNextAppointment,
  useAppointmentStats,
  useLatestHealthMetric,
  useLatestPrescription,
} from "@/services/queries/appointment-queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  Heart,
  Droplet,
  Thermometer,
  Scale,
  Pill,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link, useNavigate } from "react-router";
import { useState } from "react";

import { CustomNotification } from "@/components/notifications/CustomNotification";
import { ReportAdverseEffectDialog } from "@/features/patient/components/ReportAdverseEffectDialog";
import { DocumentsCard } from "@/features/patient/components/DocumentsCard";
import { QuickActions } from "../components/QuickActions";
import { StatCard } from "@/components/shared/StatCard";

export const PatientDashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const { data: metric, isLoading: isLoadingMetrics } = useLatestHealthMetric();

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto py-8 px-4 space-y-8">
        {notification && (
          <CustomNotification
            variant={notification.variant}
            title={notification.message}
            onDismiss={() => setNotification(null)}
            autoHide
          />
        )}

        <WelcomeHeader name={user?.name} />

        <QuickActions />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Pressão Arterial"
            value={metric?.bloodPressure || "N/A"}
            unit="mmHg"
            icon={Heart}
            variant="red"
            description="Última aferição"
            loading={isLoadingMetrics}
          />
          <StatCard
            title="Glicose"
            value={metric?.glucoseLevel || "N/A"}
            unit="mg/dL"
            icon={Droplet}
            variant="blue"
            loading={isLoadingMetrics}
          />
          <StatCard
            title="Peso"
            value={metric?.weight || "N/A"}
            unit="kg"
            icon={Scale}
            variant="purple"
            loading={isLoadingMetrics}
          />
          <StatCard
            title="Freq. Cardíaca"
            value={metric?.heartRate || "N/A"}
            unit="bpm"
            icon={Thermometer}
            variant="red"
            loading={isLoadingMetrics}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <NextAppointmentCard />
            <AppointmentStats />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <CurrentMedicationsCard
              onReportEffect={() => setIsReportDialogOpen(true)}
            />
            <Card className="border shadow-sm">
              <DocumentsCard
                documents={[]}
                isLoading={false}
                showViewAllButton={true}
              />
            </Card>
          </div>
        </div>

        <ReportAdverseEffectDialog
          open={isReportDialogOpen}
          onOpenChange={setIsReportDialogOpen}
          prescriptionId={1}
          doctorId={1}
          onSuccess={() =>
            setNotification({
              message: "Relatório enviado com sucesso!",
              variant: "success",
            })
          }
        />
      </div>
    </div>
  );
};

const WelcomeHeader = ({ name }: { name?: string }) => {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span className="text-3xl md:text-4xl text-primary font-bold">
          {greeting} {name?.split(" ")[0] || "Paciente"}
        </span>

        <p className="text-muted-foreground mt-1">
          Aqui está um resumo da sua saúde hoje.
        </p>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-2xl font-semibold text-foreground">
          {format(new Date(), "d 'de' MMMM", { locale: ptBR })}
        </p>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE", { locale: ptBR })}
        </p>
      </div>
    </div>
  );
};

const NextAppointmentCard = () => {
  const { data: nextAppointment, isLoading } = useNextAppointment();
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden border-0 shadow-md">
      <div className="h-0.5 w-full bg-gradient-to-r from-primary to-primary/50" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          Próxima Consulta
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : nextAppointment ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-5">
              {/* Date badge */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center bg-primary/10 rounded-2xl w-16 h-16 border border-primary/20">
                <span className="text-2xl font-bold text-primary leading-none">
                  {format(new Date(nextAppointment.appointmentDateTime), "d")}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-primary/70 font-medium">
                  {format(
                    new Date(nextAppointment.appointmentDateTime),
                    "MMM",
                    { locale: ptBR },
                  )}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {format(
                    new Date(nextAppointment.appointmentDateTime),
                    "EEEE",
                    { locale: ptBR },
                  )}
                </p>
                <p className="flex items-center gap-1.5 text-muted-foreground text-sm mt-0.5">
                  <Clock className="h-3.5 w-3.5" />
                  {format(
                    new Date(nextAppointment.appointmentDateTime),
                    "HH:mm",
                  )}
                  {" — "}
                  {format(
                    new Date(nextAppointment.appointmentDateTime),
                    "dd/MM/yyyy",
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:flex-col w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                className="flex-1 sm:flex-none gap-1"
                onClick={() =>
                  navigate(`/patient/appointments/${nextAppointment.id}`)
                }
              >
                Ver Detalhes
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">Nenhuma consulta agendada.</p>
            <p className="text-sm mt-1">Agende uma consulta para começar.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AppointmentStats = () => {
  const { data: stats, isLoading } = useAppointmentStats();

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          Resumo de Consultas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <StatPill
              label="Próximas"
              value={stats?.scheduled || 0}
              color="blue"
              icon={Calendar}
            />
            <StatPill
              label="Realizadas"
              value={stats?.completed || 0}
              color="green"
              icon={CheckCircle2}
            />
            <StatPill
              label="Canceladas"
              value={stats?.canceled || 0}
              color="red"
              icon={XCircle}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface StatPillProps {
  label: string;
  value: number;
  color: "blue" | "green" | "red";
  icon: React.ElementType;
}

const colorMap = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-600 dark:text-blue-400",
    icon: "text-blue-400",
    border: "border-blue-100 dark:border-blue-900",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950/40",
    text: "text-green-600 dark:text-green-400",
    icon: "text-green-400",
    border: "border-green-100 dark:border-green-900",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-600 dark:text-red-400",
    icon: "text-red-400",
    border: "border-red-100 dark:border-red-900",
  },
};

const StatPill = ({ label, value, color, icon: Icon }: StatPillProps) => {
  const c = colorMap[color];
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 ${c.bg} ${c.border}`}
    >
      <Icon className={`h-5 w-5 ${c.icon}`} />
      <p className={`text-3xl font-bold ${c.text}`}>{value}</p>
      <p className="text-xs text-muted-foreground font-medium text-center">
        {label}
      </p>
    </div>
  );
};

const CurrentMedicationsCard = ({
  onReportEffect,
}: {
  onReportEffect: () => void;
}) => {
  const { data: prescription, isLoading } = useLatestPrescription();

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base font-semibold">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-green-50 dark:bg-green-950/40">
              <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            Medicamentos Atuais
          </div>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs h-7 gap-0.5"
          >
            <Link to="/patient/prescriptions">
              Ver Todos
              <ChevronRight className="h-3 w-3" />
            </Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : prescription && prescription.medicines.length > 0 ? (
          <>
            <div className="space-y-2">
              {prescription.medicines.slice(0, 3).map((med, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50"
                >
                  <div className="flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg bg-green-100 dark:bg-green-950/60">
                    <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{med.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {med.dosage} · {med.frequency}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-1 text-xs border-dashed"
              onClick={onReportEffect}
            >
              Reportar Efeito Adverso
            </Button>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Pill className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Nenhuma prescrição ativa.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
