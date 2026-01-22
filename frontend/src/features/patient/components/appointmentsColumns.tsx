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
import { format, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Appointment, AppointmentStatus } from "@/types/appointment.types";
import { Video, MapPin, ExternalLink } from "lucide-react";

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
      const appointment = row.original;
      const start = new Date(appointment.appointmentDateTime);
      // calcula o fim com base no campo calculado do backend ou fallback para 60min
      const end = appointment.appointmentEndTime
        ? new Date(appointment.appointmentEndTime)
        : addMinutes(start, appointment.duration || 60);

      return (
        <div>
          <div className="font-medium">
            {format(start, "dd/MM/yyyy", { locale: ptBR })}
          </div>
          <div className="text-xs text-muted-foreground">
            {format(start, "HH:mm")} - {format(end, "HH:mm")}
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
    accessorKey: "type",
    header: "Local",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const meetingUrl = row.original.meetingUrl;
      const isOnline = type === "ONLINE";

      if (isOnline) {
        return (
          <div className="flex flex-col gap-1 items-start">
            <Badge variant="secondary" className="gap-1">
              <Video className="h-3 w-3" /> Online
            </Badge>
            {meetingUrl && row.original.status === "SCHEDULED" && (
              <Button
                variant="link"
                className="h-auto p-0 text-xs text-blue-600 underline"
                onClick={() => window.open(meetingUrl, "_blank")}
              >
                Entrar na Sala <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            )}
          </div>
        );
      }

      return (
        <Badge variant="outline" className="gap-1">
          <MapPin className="h-3 w-3" /> Presencial
        </Badge>
      );
    },
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
            <DropdownMenuItem
              onClick={() => options.handleViewDetails(appointment.id)}
              className="cursor-pointer"
            >
              Ver Detalhes
            </DropdownMenuItem>
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
