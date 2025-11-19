import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import type { AppointmentDetail } from "@/types/appointment.types";
import type { AppointmentStatus } from "@/types/appointment.types";
import { cn } from "@/utils/utils";

// Mapeamento de Status para texto e cor
const statusMap: Record<
  AppointmentStatus,
  { text: string; className: string }
> = {
  SCHEDULED: {
    text: "Agendada",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  COMPLETED: {
    text: "Concluída",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  CANCELED: {
    text: "Cancelada",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  NO_SHOW: {
    text: "Não Compareceu",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
};

// Definição das Colunas
export const columns: ColumnDef<AppointmentDetail>[] = [
  {
    accessorKey: "patientName",
    header: "Paciente",
  },
  {
    accessorKey: "reason",
    header: "Motivo",
    cell: ({ row }) => {
      const reason = row.getValue("reason") as string;
      // Limita o motivo para 50 caracteres para não quebrar a tabela
      return reason?.length > 50 ? `${reason.substring(0, 50)}...` : reason;
    },
  },
  {
    accessorKey: "appointmentDateTime",
    header: "Data e Hora",
    // Célula de formatação da Data
    cell: ({ row }) => {
      const dateString = row.getValue("appointmentDateTime") as string;
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    // Célula de formatação do Status com Badge
    cell: ({ row }) => {
      const status = row.getValue("status") as AppointmentStatus;
      const statusInfo = statusMap[status] || {
        text: status,
        className: "bg-gray-100 text-gray-800",
      };

      return (
        <Badge
          variant="outline"
          className={cn("font-medium", statusInfo.className)}
        >
          {statusInfo.text}
        </Badge>
      );
    },
  },
];
