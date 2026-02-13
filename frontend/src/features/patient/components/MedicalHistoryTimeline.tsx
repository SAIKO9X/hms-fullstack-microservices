import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Stethoscope,
  type LucideProps,
} from "lucide-react";
import { format, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AppointmentHistory } from "@/types/patient.types";
import type { FC, ForwardRefExoticComponent, RefAttributes } from "react";
import { useMedicalHistory } from "@/services/queries/profile-queries";

type StatusConfigValue = {
  label: string;
  variant: "secondary" | "default" | "destructive" | "outline";
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  color: string;
  bg: string;
  border: string;
  timeline: string;
};

const statusConfig: { [key: string]: StatusConfigValue } = {
  COMPLETED: {
    label: "Concluída",
    variant: "secondary",
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-900/50",
    timeline: "bg-green-500",
  },
  SCHEDULED: {
    label: "Agendada",
    variant: "default",
    icon: Clock,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    timeline: "bg-primary",
  },
  CANCELED: {
    label: "Cancelada",
    variant: "destructive",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    timeline: "bg-destructive",
  },
  DEFAULT: {
    label: "Status Desconhecido",
    variant: "outline",
    icon: Activity,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border",
    timeline: "bg-muted-foreground",
  },
};

const TimelineItem: FC<{
  appointment: AppointmentHistory;
  isLast: boolean;
}> = ({ appointment, isLast }) => {
  const config = statusConfig[appointment.status] || statusConfig.DEFAULT;
  const StatusIcon = config.icon;

  const date = new Date(appointment.appointmentDateTime);
  const day = format(date, "dd");
  const month = format(date, "MMM", { locale: ptBR }).replace(".", "");
  const year = getYear(date);
  const time = format(date, "HH:mm");

  return (
    <div className="relative flex gap-6">
      {!isLast && (
        <div className="absolute left-[52px] top-[70px] w-0.5 h-full bg-border" />
      )}

      <div className="flex-shrink-0 flex flex-col items-center">
        <div
          className={`flex flex-col items-center justify-center w-[105px] h-[70px] rounded-xl ${config.bg} border ${config.border}`}
        >
          <span className={`text-3xl font-bold ${config.color}`}>{day}</span>
          <span
            className={`-mt-1 text-sm font-semibold capitalize ${config.color}`}
          >
            {month}
          </span>
        </div>
        <div
          className={`relative z-10 w-4 h-4 rounded-full ${config.timeline} ring-4 ring-background mt-2`}
        >
          <div
            className={`absolute inset-0 rounded-full ${config.timeline} animate-ping opacity-75`}
          />
        </div>
      </div>

      <Card className="flex-1 shadow-sm transition-shadow duration-300 border-border/60">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg flex items-start gap-3">
                <FileText className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                <span className="leading-tight">{appointment.reason}</span>
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{time}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{year}</span>
              </div>
            </div>
            <Badge
              variant={config.variant}
              className="flex items-center gap-1.5 whitespace-nowrap"
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`flex items-center gap-3 p-3 rounded-lg ${config.bg} border ${config.border}`}
          >
            <div className="p-2 bg-background rounded-full shadow-sm">
              <Stethoscope className={`h-4 w-4 ${config.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Profissional
              </p>
              <p className={`text-sm font-semibold ${config.color}`}>
                {appointment.doctorName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface MedicalHistoryTimelineProps {
  appointments?: AppointmentHistory[];
  patientId?: number;
  compactMode?: boolean;
}

export const MedicalHistoryTimeline: FC<MedicalHistoryTimelineProps> = ({
  appointments: initialAppointments,
  patientId,
  compactMode = false,
}) => {
  const { data: medicalHistoryData, isLoading } = useMedicalHistory(patientId);

  const appointments =
    initialAppointments || (medicalHistoryData as any)?.appointments || [];

  const sortedAppointments = [...appointments].sort(
    (a: AppointmentHistory, b: AppointmentHistory) =>
      new Date(b.appointmentDateTime).getTime() -
      new Date(a.appointmentDateTime).getTime(),
  );

  const displayLimit = compactMode ? 3 : undefined;
  const displayedAppointments = sortedAppointments.slice(0, displayLimit);

  if (isLoading && !initialAppointments && patientId) {
    return (
      <div className="flex justify-center items-center py-8">
        <Activity className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sortedAppointments || sortedAppointments.length === 0) {
    return (
      <Card className="shadow-sm border-border/60">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-1">
            Nenhum histórico encontrado
          </p>
          <p className="text-sm text-muted-foreground max-w-xs">
            As consultas passadas aparecerão aqui após serem concluídas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={compactMode ? "space-y-4" : "space-y-8"}>
      {displayedAppointments.map(
        (appointment: AppointmentHistory, index: number) => (
          <TimelineItem
            key={appointment.id}
            appointment={appointment}
            isLast={index === displayedAppointments.length - 1}
          />
        ),
      )}
      {compactMode && sortedAppointments.length > 3 && (
        <p className="text-xs text-center text-muted-foreground mt-2">
          e mais {sortedAppointments.length - 3} consultas...
        </p>
      )}
    </div>
  );
};
