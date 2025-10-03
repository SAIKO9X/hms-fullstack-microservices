import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MedicineFormSchema,
  type MedicineFormData,
} from "@/lib/schemas/medicine.schema";
import { useAddMedicine, useUpdateMedicine } from "@/hooks/pharmacy-queries";
import type {
  Medicine,
  MedicineCategory,
  MedicineType,
} from "@/types/medicine.types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomNotification } from "@/components/notifications/CustomNotification";

const categoryOptions: { value: MedicineCategory; label: string }[] = [
  { value: "ANTIBIOTIC", label: "Antibiótico" },
  { value: "ANALGESIC", label: "Analgésico" },
  { value: "ANTIHISTAMINE", label: "Anti-histamínico" },
  { value: "ANTISEPTIC", label: "Antisséptico" },
  { value: "VITAMIN", label: "Vitamina" },
  { value: "MINERAL", label: "Mineral" },
  { value: "HERBAL", label: "Fitoterápico" },
  { value: "HOMEOPATHIC", label: "Homeopático" },
  { value: "OTHER", label: "Outro" },
];

const typeOptions: { value: MedicineType; label: string }[] = [
  { value: "TABLET", label: "Comprimido" },
  { value: "CAPSULE", label: "Cápsula" },
  { value: "SYRUP", label: "Xarope" },
  { value: "INJECTION", label: "Injeção" },
  { value: "OINTMENT", label: "Pomada" },
  { value: "DROPS", label: "Gotas" },
  { value: "INHALER", label: "Inalador" },
  { value: "OTHER", label: "Outro" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: Medicine | null;
}

export const AddEditMedicineDialog = ({
  open,
  onOpenChange,
  medicine,
}: Props) => {
  const isEditing = !!medicine;

  const form = useForm<MedicineFormData>({
    resolver: zodResolver(MedicineFormSchema),
    defaultValues: {
      name: "",
      dosage: "",
      category: undefined,
      type: undefined,
      manufacturer: "",
      unitPrice: undefined,
    },
  });

  const addMutation = useAddMedicine();
  const updateMutation = useUpdateMedicine();

  useEffect(() => {
    if (open) {
      if (isEditing && medicine) {
        form.reset(medicine);
      } else {
        form.reset({
          name: "",
          dosage: "",
          category: undefined,
          type: undefined,
          manufacturer: "",
          unitPrice: undefined,
        });
      }
    }
  }, [medicine, open, form, isEditing]);

  const onSubmit = async (data: MedicineFormData) => {
    try {
      if (isEditing && medicine) {
        await updateMutation.mutateAsync({ id: medicine.id, data });
      } else {
        await addMutation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Falha ao salvar medicamento:", error);
    }
  };

  const isPending = addMutation.isPending || updateMutation.isPending;
  const error = addMutation.error || updateMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">
            {isEditing ? "Editar Medicamento" : "Adicionar Novo Medicamento"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditing
              ? "Atualize as informações do medicamento"
              : "Preencha os dados do novo medicamento"}
          </p>
        </DialogHeader>

        {error && (
          <div className="mb-4">
            <CustomNotification variant="error" title={error.message} />
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Nome do Medicamento
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Paracetamol"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="dosage"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Dosagem
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 500mg, 10ml, 250mg/5ml"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Classificação */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Classificação
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  name="category"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Categoria
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="type"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Tipo/Forma
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 w-full">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {typeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Dados Comerciais */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Dados Comerciais
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  name="manufacturer"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Fabricante
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Medley, EMS, Sanofi"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="unitPrice"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Preço Unitário (R$)
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            R$
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            className="h-11 pl-10"
                            {...field}
                            value={String(field.value ?? "")}
                            onChange={(e) =>
                              field.onChange(
                                e.target.valueAsNumber || undefined
                              )
                            }
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  className="w-full sm:w-auto cursor-pointer"
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto text-secondary cursor-pointer"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Salvando...
                  </div>
                ) : isEditing ? (
                  "Atualizar Medicamento"
                ) : (
                  "Adicionar Medicamento"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
