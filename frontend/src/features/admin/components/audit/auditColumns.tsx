import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowUpDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditLog } from "@/types/admin.types";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const formatDetailsText = (text: string) => {
  if (!text) return "Nenhum detalhe disponível.";
  return text
    .replace(". Changes:", ".\n\nChanges:")
    .replace(". Args:", ".\n\nArgs:");
};

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
      const variant =
        role === "ROLE_ADMIN"
          ? "destructive"
          : role === "ROLE_DOCTOR"
            ? "default"
            : "secondary";

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
    header: "Detalhes (Snapshot)",
    cell: ({ row }) => {
      const details = row.getValue("details") as string;

      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-full justify-start text-muted-foreground"
            >
              <FileText className="mr-2 h-4 w-4" />
              <span className="truncate max-w-[150px] text-xs">
                {details || "Ver detalhes"}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Detalhes da Auditoria</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Log Completo</h4>
                <p className="text-sm text-muted-foreground">
                  Visualize o histórico de alterações (De/Para) e argumentos.
                </p>
              </div>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-muted/50 font-mono text-sm">
                <div className="whitespace-pre-wrap break-words">
                  {formatDetailsText(details)}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      );
    },
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
