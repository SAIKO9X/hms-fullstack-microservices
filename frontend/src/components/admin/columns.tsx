import type { ColumnDef } from "@tanstack/react-table";
import type { Medicine } from "@/types/medicine.types";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ColumnsOptions {
  onEdit: (medicine: Medicine) => void;
}

export const columns = ({ onEdit }: ColumnsOptions): ColumnDef<Medicine>[] => [
  { accessorKey: "name", header: "Nome" },
  { accessorKey: "dosage", header: "Dosagem" },
  { accessorKey: "category", header: "Categoria" },
  { accessorKey: "manufacturer", header: "Fabricante" },
  {
    accessorKey: "unitPrice",
    header: "Preço Unit. (R$)",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("unitPrice"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const medicine = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(medicine)}>
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
