import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useAddInventoryItem,
  useUpdateInventoryItem,
} from "@/hooks/pharmacy-queries";
import { useQuery } from "@tanstack/react-query";
import { getAllMedicines } from "@/services/pharmacy";
import type { MedicineInventory } from "@/types/medicine.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

// Schema de validação
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

  // Buscar medicamentos para o dropdown
  const { data: medicines = [] } = useQuery({
    queryKey: ["medicines"],
    queryFn: getAllMedicines,
  });

  // Hooks de mutação
  const addMutation = useAddInventoryItem();
  const updateMutation = useUpdateInventoryItem();

  // Preenche o formulário quando em modo de edição
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
    (m) => m.id === form.watch("medicineId")
  );
  const isPending = addMutation.isPending || updateMutation.isPending;
  const error = addMutation.error || updateMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Editar Item do Inventário" : "Adicionar ao Estoque"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing
              ? "Atualize as informações do lote"
              : "Adicione um novo lote de medicamentos ao estoque"}
          </p>
        </DialogHeader>

        {error && (
          <div className="mb-4">
            <CustomNotification variant="error" title={error.message} />
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seleção de Medicamento */}
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
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isEditing} // Não permite alterar o medicamento em edição
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

            {/* Detalhes do Lote */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Detalhes do Lote
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  name="batchNo"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Número do Lote
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: LT001, BATCH2024001"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="quantity"
                  control={form.control}
                  render={({ field: { onChange, value, ...fieldProps } }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Quantidade
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Ex: 100"
                          className="h-11"
                          value={value || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            onChange(
                              val === ""
                                ? undefined
                                : parseInt(val, 10) || undefined
                            );
                          }}
                          {...fieldProps}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="expiryDate"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">
                      Data de Validade
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal h-11",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecionar data de validade</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Salvando...
                  </div>
                ) : isEditing ? (
                  "Atualizar Lote"
                ) : (
                  "Adicionar ao Estoque"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
