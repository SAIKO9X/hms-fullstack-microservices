import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditLog } from "@/types/admin.types";
import type { ColumnDef } from "@tanstack/react-table";

export const auditColumns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data/Hora
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("timestamp"));
      return (
        <span className="text-sm text-muted-foreground">
          {format(date, "dd/MM/yyyy HH:mm:ss")}
        </span>
      );
    },
  },
  {
    accessorKey: "actorRole",
    header: "Papel",
    cell: ({ row }) => {
      const role = row.getValue("actorRole") as string;
      // Define a cor baseada no papel
      const variant =
        role === "ROLE_ADMIN"
          ? "destructive"
          : role === "ROLE_DOCTOR"
            ? "default"
            : "secondary";

      // Remove o prefixo ROLE_ para exibição
      return <Badge variant={variant}>{role.replace("ROLE_", "")}</Badge>;
    },
  },
  {
    accessorKey: "actorId",
    header: "Usuário (ID)",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.getValue("actorId")}</span>
    ),
  },
  {
    accessorKey: "action",
    header: "Ação",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("action")}</span>
    ),
  },
  {
    accessorKey: "resourceName",
    header: "Recurso",
  },
  {
    accessorKey: "details",
    header: "Detalhes",
    cell: ({ row }) => (
      <div
        className="max-w-[300px] truncate text-muted-foreground text-xs"
        title={row.getValue("details")}
      >
        {row.getValue("details")}
      </div>
    ),
  },
  {
    accessorKey: "ipAddress",
    header: "IP",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.getValue("ipAddress")}
      </span>
    ),
  },
];
