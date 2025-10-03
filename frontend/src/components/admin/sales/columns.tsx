<<<<<<< HEAD
import type { ColumnDef } from "@tanstack/react-table";
import type { PharmacySale } from "@/types/medicine.types";
import { ArrowUpDown } from "lucide-react";
=======
// Caminho: src/components/admin/sales/columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import type { PharmacySale } from "@/types/medicine.types";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
>>>>>>> 9e2650afa2559139940d97addf2b75fd4b67782a
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount);
};

export const columns: ColumnDef<PharmacySale>[] = [
  {
    accessorKey: "id",
    header: "ID Venda",
    cell: ({ row }) => <div className="font-mono">#{row.getValue("id")}</div>,
  },
  {
    accessorKey: "buyerName",
    header: "Comprador",
  },
  {
    accessorKey: "saleDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Data da Venda
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) =>
      format(new Date(row.getValue("saleDate")), "dd/MM/yyyy HH:mm", {
        locale: ptBR,
      }),
  },
  {
    accessorKey: "totalAmount",
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Valor Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {formatCurrency(row.getValue("totalAmount"))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const saleId = row.original.id;

      return (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/sales/${saleId}`)}
          >
            Ver Detalhes
          </Button>
        </div>
      );
    },
  },
];
