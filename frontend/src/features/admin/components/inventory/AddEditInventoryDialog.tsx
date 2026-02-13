import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search } from "lucide-react";
import { cn } from "@/utils/utils";
import {
  useAddInventoryItem,
  useUpdateInventoryItem,
  useMedicines,
} from "@/services/queries/pharmacy-queries";
import type { MedicineInventory } from "@/types/medicine.types";
import { FormDialog } from "@/components/shared/FormDialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { FormInput, FormDatePicker } from "@/components/ui/form-fields";

const InventoryFormSchema = z.object({
  medicineId: z.number({ message: "Selecione um medicamento" }),
  batchNo: z
    .string()
    .min(1, { message: "Número do lote é obrigatório" })
    .max(50, { message: "Número do lote muito longo" }),
  quantity: z
    .number({ message: "Quantidade deve ser um número" })
    .int({ message: "Quantidade deve ser um número inteiro" })
    .positive({ message: "Quantidade deve ser positiva" }),
  expiryDate: z.date({ message: "Data de validade é obrigatória" }),
});

type InventoryFormData = z.infer<typeof InventoryFormSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: MedicineInventory | null;
}

export const AddEditInventoryDialog = ({
  open,
  onOpenChange,
  inventory,
}: Props) => {
  const [medicineSearchOpen, setMedicineSearchOpen] = useState(false);
  const isEditing = !!inventory;

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(InventoryFormSchema),
    defaultValues: {
      medicineId: undefined,
      batchNo: "",
      quantity: undefined,
      expiryDate: undefined,
    },
  });

  const { data: medicinesPage } = useMedicines(0, 100);
  const medicines = medicinesPage?.content || [];
  const addMutation = useAddInventoryItem();
  const updateMutation = useUpdateInventoryItem();

  useEffect(() => {
    if (open) {
      if (isEditing && inventory) {
        form.reset({
          medicineId: inventory.medicineId,
          batchNo: inventory.batchNo,
          quantity: inventory.quantity,
          expiryDate: new Date(inventory.expiryDate),
        });
      } else {
        form.reset({
          medicineId: undefined,
          batchNo: "",
          quantity: undefined,
          expiryDate: undefined,
        });
      }
    }
  }, [inventory, open, form, isEditing]);

  const onSubmit = async (data: InventoryFormData) => {
    try {
      if (isEditing && inventory) {
        await updateMutation.mutateAsync({
          id: inventory.id,
          data: {
            ...data,
            expiryDate: data.expiryDate as Date,
          },
        });
      } else {
        await addMutation.mutateAsync({
          ...data,
          expiryDate: data.expiryDate as Date,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Falha ao salvar item do inventário:", error);
    }
  };

  const selectedMedicine = medicines.find(
    (m) => m.id === form.watch("medicineId"),
  );
  const isPending = addMutation.isPending || updateMutation.isPending;
  const error = addMutation.error || updateMutation.error;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Item do Inventário" : "Adicionar ao Estoque"}
      description={
        isEditing
          ? "Atualize as informações do lote"
          : "Adicione um novo lote de medicamentos ao estoque"
      }
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isPending}
      submitLabel={isEditing ? "Atualizar Lote" : "Adicionar ao Estoque"}
      className="sm:max-w-2xl max-h-[90vh]"
    >
      {error && (
        <div className="mb-4">
          <CustomNotification variant="error" title={error.message} />
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Medicamento
        </h3>

        <FormField
          name="medicineId"
          control={form.control}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-sm font-medium">
                Selecionar Medicamento
              </FormLabel>
              <Popover
                open={medicineSearchOpen}
                onOpenChange={setMedicineSearchOpen}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between h-11",
                        !field.value && "text-muted-foreground",
                      )}
                      disabled={isEditing}
                    >
                      {selectedMedicine
                        ? `${selectedMedicine.name} - ${selectedMedicine.dosage}`
                        : "Buscar medicamento..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Buscar medicamento..." />
                    <CommandList>
                      <CommandEmpty>
                        Nenhum medicamento encontrado.
                      </CommandEmpty>
                      <CommandGroup>
                        {medicines.map((medicine) => (
                          <CommandItem
                            value={`${medicine.name} ${medicine.dosage} ${medicine.manufacturer}`}
                            key={medicine.id}
                            onSelect={() => {
                              field.onChange(medicine.id);
                              setMedicineSearchOpen(false);
                            }}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {medicine.name} - {medicine.dosage}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {medicine.manufacturer} • Estoque:{" "}
                                {medicine.totalStock || 0}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Detalhes do Lote
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormInput
            name="batchNo"
            control={form.control}
            label="Número do Lote"
            placeholder="Ex: LT001, BATCH2024001"
            className="h-11"
          />

          <FormInput
            name="quantity"
            control={form.control}
            label="Quantidade"
            type="number"
            placeholder="Ex: 100"
            className="h-11"
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              form.setValue("quantity", (isNaN(val) ? undefined : val) as any);
            }}
          />
        </div>

        <FormDatePicker
          control={form.control}
          name="expiryDate"
          label="Data de Validade"
          placeholder="Selecionar data de validade"
          className="h-11"
          disabledDate={(date) => date < new Date()}
        />
      </div>
    </FormDialog>
  );
};
