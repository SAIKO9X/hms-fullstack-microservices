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
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { ReportAdverseEffectDialog } from "@/features/patient/components/ReportAdverseEffectDialog";
import { DocumentsCard } from "@/features/patient/components/DocumentsCard";

export const PatientDashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {notification && (
        <CustomNotification
          variant={notification.variant}
          title={notification.message}
          onDismiss={() => setNotification(null)}
          autoHide
        />
      )}

      <WelcomeHeader name={user?.name} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <NextAppointmentCard />
          <HealthMetricsCard />
        </div>
        <div className="space-y-6">
          <AppointmentStats />
          <CurrentMedicationsCard
            onReportEffect={() => setIsReportDialogOpen(true)}
          />
        </div>
      </div>

      <DocumentsCard />

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
  );
};

const WelcomeHeader = ({ name }: { name?: string }) => (
  <div>
    <h1 className="text-3xl font-bold text-foreground">
      Bem-vindo de volta, {name?.split(" ")[0] || "Paciente"}!
    </h1>
    <p className="text-muted-foreground">
      Aqui está um resumo da sua saúde e próximas atividades.
    </p>
  </div>
);

const NextAppointmentCard = () => {
  const { data: nextAppointment, isLoading } = useNextAppointment();
  const navigate = useNavigate();

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Calendar className="h-5 w-5" />
          Próxima Consulta
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : nextAppointment ? (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-lg font-semibold">
                {format(
                  new Date(nextAppointment.appointmentDateTime),
                  "dd 'de' MMMM 'de' yyyy",
                  { locale: ptBR }
                )}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {format(new Date(nextAppointment.appointmentDateTime), "HH:mm")}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Cancelar
              </Button>
              <Button
                size="sm"
                className="text-secondary"
                onClick={() =>
                  navigate(`/patient/appointments/${nextAppointment.id}`)
                }
              >
                Ver Detalhes
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            Nenhuma consulta agendada.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const AppointmentStats = () => {
  const { data: stats, isLoading } = useAppointmentStats();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo de Consultas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <div className="flex justify-between items-center text-lg font-medium">
              <span>Próximas</span>{" "}
              <span className="text-blue-500">{stats?.scheduled || 0}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-medium">
              <span>Realizadas</span>{" "}
              <span className="text-green-500">{stats?.completed || 0}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-medium">
              <span>Canceladas</span>{" "}
              <span className="text-red-500">{stats?.canceled || 0}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const HealthMetricsCard = () => {
  const { data: metric, isLoading } = useLatestHealthMetric();

  const metrics = [
    {
      icon: Heart,
      label: "Pressão Arterial",
      value: metric?.bloodPressure || "N/A",
      unit: "mmHg",
    },
    {
      icon: Droplet,
      label: "Nível de Glicose",
      value: metric?.glucoseLevel || "N/A",
      unit: "mg/dL",
    },
    { icon: Scale, label: "Peso", value: metric?.weight || "N/A", unit: "kg" },
    {
      icon: Thermometer,
      label: "Frequência Cardíaca",
      value: metric?.heartRate || "N/A",
      unit: "bpm",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Últimos Sinais Vitais</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="p-4 rounded-lg bg-muted/50 text-center"
              >
                <m.icon className="h-6 w-6 mx-auto text-primary mb-2" />
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CurrentMedicationsCard = ({
  onReportEffect,
}: {
  onReportEffect: () => void;
}) => {
  const { data: prescription, isLoading } = useLatestPrescription();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Medicamentos Atuais</span>
          <Button asChild variant="ghost" size="sm">
            <Link to="/patient/prescriptions">Ver Todos</Link>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <div className="space-y-3">
            {prescription && prescription.medicines.length > 0 ? (
              prescription.medicines.slice(0, 3).map((med, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Pill className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">{med.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {med.dosage} - {med.frequency}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma prescrição ativa.
              </p>
            )}
          </div>
        )}

        {prescription && prescription.medicines.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
            onClick={onReportEffect}
          >
            Reportar Efeito Adverso
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
