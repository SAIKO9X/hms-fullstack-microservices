import type { MedicineInventory } from "@/types/medicine.types";
import { BaseDialog } from "@/components/shared/BaseDialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItem: MedicineInventory | null;
}

export const InventoryDetailDialog = ({
  open,
  onOpenChange,
  inventoryItem,
}: Props) => {
  if (!inventoryItem) return null;

  const details = [
    { label: "ID do Item", value: `#${inventoryItem.id}` },
    { label: "Medicamento", value: inventoryItem.medicineName },
    { label: "ID do Medicamento", value: `#${inventoryItem.medicineId}` },
    { label: "Número do Lote", value: inventoryItem.batchNo },
    {
      label: "Quantidade em Estoque",
      value: `${inventoryItem.quantity} unidades`,
    },
    {
      label: "Data de Adição",
      value: format(new Date(inventoryItem.addedDate), "dd/MM/yyyy", {
        locale: ptBR,
      }),
    },
    {
      label: "Data de Validade",
      value: format(new Date(inventoryItem.expiryDate), "dd/MM/yyyy", {
        locale: ptBR,
      }),
    },
  ];

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Detalhes do Lote: ${inventoryItem.batchNo}`}
      footer={
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Fechar
        </Button>
      }
    >
      <Table>
        <TableBody>
          {details.map((detail) => (
            <TableRow key={detail.label}>
              <TableCell className="font-semibold w-1/3">
                {detail.label}
              </TableCell>
              <TableCell>{detail.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </BaseDialog>
  );
};
