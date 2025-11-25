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
import type { Appointment, AppointmentStatus } from "@/types/appointment.types";

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

// 1. Adicionamos handleViewDetails à tipagem das opções
export const columns = (options: {
  handleCancelAppointment: (appointmentId: number) => void;
  handleViewDetails: (appointmentId: number) => void;
}): ColumnDef<Appointment>[] => [
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
  {
    accessorKey: "doctorName",
    header: "Doutor",
  },
  {
    accessorKey: "reason",
    header: "Motivo",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate">{row.getValue("reason")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.getValue("status")),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const appointment = row.original;
      const canCancel = appointment.status === "SCHEDULED";

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
            {/* 2. Chamamos a função de navegação aqui */}
            <DropdownMenuItem
              onClick={() => options.handleViewDetails(appointment.id)}
              className="cursor-pointer"
            >
              Ver Detalhes
            </DropdownMenuItem>

            {/* Reagendar pode ser implementado futuramente */}
            <DropdownMenuItem disabled>Reagendar</DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => options.handleCancelAppointment(appointment.id)}
              disabled={!canCancel}
              className="text-destructive cursor-pointer"
            >
              Cancelar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
