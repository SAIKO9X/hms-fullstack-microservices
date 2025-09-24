import type { ColumnDef } from "@tanstack/react-table";
import type { MedicineInventory } from "@/types/medicine.types";
import {
  MoreHorizontal,
  ArrowUpDown,
  Package,
  AlertTriangle,
  CheckCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ColumnsOptions {
  onEdit: (inventory: MedicineInventory) => void;
  onDelete?: (inventory: MedicineInventory) => void;
}

const getExpiryStatus = (expiryDate: string) => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  if (expiry < today) {
    return {
      status: "expired",
      label: "Vencido",
      className:
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
      icon: AlertTriangle,
    };
  } else if (expiry < thirtyDaysFromNow) {
    return {
      status: "expiring",
      label: "Vencendo",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      icon: AlertTriangle,
    };
  } else {
    return {
      status: "good",
      label: "OK",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
      icon: CheckCircle,
    };
  }
};

const getStockStatus = (quantity: number) => {
  if (quantity === 0) {
    return {
      status: "depleted",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };
  } else if (quantity < 10) {
    return {
      status: "low",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    };
  } else {
    return {
      status: "good",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };
  }
};

export const columns = ({
  onEdit,
  onDelete,
}: ColumnsOptions): ColumnDef<MedicineInventory>[] => [
  {
    accessorKey: "medicineName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 -ml-4"
        >
          <Package className="mr-2 h-4 w-4" />
          Medicamento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className="font-medium pl-0">{row.getValue("medicineName")}</div>
      );
    },
  },
  {
    accessorKey: "batchNo",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 -ml-4"
        >
          Lote
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-mono text-sm">{row.getValue("batchNo")}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => {
      return (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 lg:px-3"
          >
            Quantidade
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const quantity = row.original.quantity;
      const stockStatus = getStockStatus(quantity);

      return (
        <div className="text-center">
          <Badge
            variant="outline"
            className={`${stockStatus.className} text-xs font-medium`}
          >
            {quantity} unidades
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3 -ml-4"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Validade
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const expiryDate = row.getValue("expiryDate") as string;
      const expiryStatus = getExpiryStatus(expiryDate);
      const StatusIcon = expiryStatus.icon;

      return (
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium">
            {format(new Date(expiryDate), "dd/MM/yyyy", { locale: ptBR })}
          </div>
          <Badge
            variant="outline"
            className={`${expiryStatus.className} text-xs flex items-center gap-1`}
          >
            <StatusIcon className="h-3 w-3" />
            {expiryStatus.label}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "addedDate",
    header: "Adicionado em",
    cell: ({ row }) => {
      const addedDate = row.getValue("addedDate") as string;
      return (
        <div className="text-sm text-muted-foreground">
          {format(new Date(addedDate), "dd/MM/yyyy", { locale: ptBR })}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Ações</div>,
    enableHiding: false,
    cell: ({ row }) => {
      const inventory = row.original;

      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 data-[state=open]:bg-muted"
              >
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(inventory.batchNo)}
              >
                Copiar lote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(inventory)}>
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => console.log("Ver detalhes", inventory)}
              >
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(inventory)}
                >
                  Excluir
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
