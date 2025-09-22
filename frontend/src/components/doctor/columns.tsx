import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  AppointmentDetail,
  AppointmentStatus,
} from "@/types/appointment.types";

// Helper para os badges de status
const getStatusBadge = (status: AppointmentStatus) => {
  const statusConfig = {
    SCHEDULED: { label: "Agendada", className: "bg-blue-100 text-blue-800" },
    COMPLETED: { label: "Concluída", className: "bg-green-100 text-green-800" },
    CANCELED: { label: "Cancelada", className: "bg-red-100 text-red-800" },
    NO_SHOW: {
      label: "Não Compareceu",
      className: "bg-gray-100 text-gray-800",
    },
  };
  const config = statusConfig[status] || { label: status, className: "" };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

export const columns = (options: {
  handleCompleteAppointment: (appointmentId: number, notes: string) => void;
}): ColumnDef<AppointmentDetail>[] => [
  // Coluna de seleção (Checkbox)
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // Coluna de Data e Hora
  {
    accessorKey: "appointmentDateTime",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Data & Hora <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("appointmentDateTime"));
      return (
        <div>
          <div>{format(date, "dd/MM/yyyy", { locale: ptBR })}</div>
          <div className="text-sm text-muted-foreground">
            {format(date, "HH:mm")}
          </div>
        </div>
      );
    },
  },

  // Coluna com Nome do Paciente
  {
    accessorKey: "patientName",
    header: "Paciente",
    cell: ({ row }) => {
      console.log("Row data:", row.original); // Debug: ver todos os dados
      console.log("Patient name:", row.getValue("patientName")); // Debug: ver valor específico

      const patientName = row.getValue("patientName") as string;
      return <div>{patientName || "Nome não disponível"}</div>;
    },
  },

  // Coluna com Telefone do Paciente
  {
    accessorKey: "patientPhoneNumber",
    header: "Telefone",
  },

  // Coluna de Motivo
  {
    accessorKey: "reason",
    header: "Motivo",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">{row.original.reason}</div>
    ),
  },

  // Coluna de Status
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },

  // Coluna de Ações
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                console.log("Ver detalhes do paciente", appointment.patientId)
              }
            >
              Ver Prontuário
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                options.handleCompleteAppointment(
                  appointment.id,
                  "Consulta finalizada."
                )
              }
              disabled={appointment.status !== "SCHEDULED"}
            >
              Finalizar Consulta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Cancelar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
