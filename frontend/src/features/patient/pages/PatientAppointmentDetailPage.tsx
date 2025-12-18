import { useParams, Link } from "react-router";
import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  Star,
} from "lucide-react";

import {
  useAppointmentById,
  useAppointmentsWithDoctorNames,
} from "@/services/queries/appointment-queries";
import { CreateReviewDialog } from "../components/CreateReviewDialog";

const statusConfig = {
  SCHEDULED: {
    label: "Agendada",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  COMPLETED: {
    label: "Concluída",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  CANCELED: {
    label: "Cancelada",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  NO_SHOW: {
    label: "Não Compareceu",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export const PatientAppointmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);

  const appointmentId = Number(id);

  const { data: doctors } = useAppointmentsWithDoctorNames();
  const { data: appointment, isLoading } = useAppointmentById(appointmentId);

  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const doctorName =
    doctors?.find((doc) => doc.doctorId === appointment?.doctorId)
      ?.doctorName || "Médico não encontrado";

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="container mx-auto py-8">Consulta não encontrada.</div>
    );
  }

  const currentStatus = statusConfig[
    appointment.status as keyof typeof statusConfig
  ] || {
    label: appointment.status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button asChild variant="outline">
        <Link to="/patient/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Detalhes da Consulta</CardTitle>
          <CardDescription>
            Agendada para{" "}
            {format(
              new Date(appointment.appointmentDateTime),
              "dd/MM/yyyy 'às' HH:mm",
              { locale: ptBR }
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem icon={Stethoscope} label="Médico" value={doctorName} />
            <InfoItem
              icon={Calendar}
              label="Data"
              value={format(
                new Date(appointment.appointmentDateTime),
                "dd 'de' MMMM, yyyy",
                { locale: ptBR }
              )}
            />
            <InfoItem
              icon={Clock}
              label="Horário"
              value={format(new Date(appointment.appointmentDateTime), "HH:mm")}
            />
            <InfoItem
              icon={User}
              label="Paciente"
              value={user?.name || "Você"}
            />
          </div>

          <div>
            <InfoItem
              icon={FileText}
              label="Motivo da Consulta"
              value={appointment.reason}
            />
          </div>

          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <Badge variant="outline" className={currentStatus.className}>
              {currentStatus.label}
            </Badge>

            {appointment.status === "COMPLETED" && (
              <Button
                onClick={() => setIsReviewDialogOpen(true)}
                className="gap-2"
              >
                <Star className="h-4 w-4" />
                Avaliar Consulta
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <CreateReviewDialog
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        appointmentId={appointmentId}
        doctorId={appointment.doctorId}
        doctorName={doctorName}
      />
    </div>
  );
};

// Componente auxiliar para exibir informações
const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
    <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
    <div className="flex-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  </div>
);
