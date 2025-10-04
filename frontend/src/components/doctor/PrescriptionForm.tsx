import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PrescriptionSchema,
  PrescriptionUpdateSchema,
  type PrescriptionFormData,
  type PrescriptionUpdateData,
} from "@/lib/schemas/prescription";
import {
  useCreatePrescription,
  useUpdatePrescription,
} from "@/hooks/appointment-queries";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Prescription } from "@/types/record.types";
import { useEffect } from "react";
// NOVAS IMPORTAÇÕES
import { useQuery } from "@tanstack/react-query";
import { getAllMedicines } from "@/services/pharmacyService";
import { Combobox } from "@/components/ui/combobox";

interface PrescriptionFormProps {
  appointmentId: number;
  existingPrescription?: Prescription | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

type FormData = PrescriptionFormData | PrescriptionUpdateData;

export const PrescriptionForm = ({
  appointmentId,
  existingPrescription,
  onSuccess,
  onCancel,
}: PrescriptionFormProps) => {
  const createMutation = useCreatePrescription();
  const updateMutation = useUpdatePrescription();
  const isEditing = !!existingPrescription;
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Busca os medicamentos em stock
  const { data: stockMedicines = [] } = useQuery({
    queryKey: ["medicines"],
    queryFn: getAllMedicines,
    staleTime: 5 * 60 * 1000, // Cache de 5 minutos
  });

  // Mapeia os medicamentos para o formato esperado pelo Combobox
  const medicineOptions = stockMedicines.map((med) => ({
    value: `${med.name} | ${med.dosage}`, // Usar um valor único para o select
    label: `${med.name} (${med.dosage})`,
  }));

  const form = useForm<FormData>({
    resolver: zodResolver(
      isEditing ? PrescriptionUpdateSchema : PrescriptionSchema
    ),
    defaultValues: isEditing
      ? {
          notes: existingPrescription?.notes || "",
          medicines: existingPrescription?.medicines || [],
        }
      : {
          appointmentId,
          notes: "",
          medicines: [{ name: "", dosage: "", frequency: "", duration: 7 }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medicines",
  });

  useEffect(() => {
    if (isEditing && existingPrescription) {
      form.reset({
        notes: existingPrescription.notes || "",
        medicines: existingPrescription.medicines || [],
      });
    }
  }, [existingPrescription, form, isEditing]);

  const onSubmit = async (data: FormData) => {
    if (isEditing && existingPrescription) {
      await updateMutation.mutateAsync({
        id: existingPrescription.id,
        data: data as PrescriptionUpdateData,
      });
    } else {
      await createMutation.mutateAsync(data as PrescriptionFormData);
    }
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-4 rounded-lg border p-4 relative"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Medicamento {index + 1}</h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name={`medicines.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Nome do Medicamento</FormLabel>
                    <Combobox
                      options={medicineOptions}
                      value={field.value}
                      onValueChange={(selectedValue) => {
                        // Quando um item é selecionado, separamos nome e dosagem
                        const [name, dosage] = selectedValue.split(" | ");
                        form.setValue(
                          `medicines.${index}.name`,
                          name || selectedValue
                        );
                        if (dosage) {
                          form.setValue(`medicines.${index}.dosage`, dosage);
                        }
                      }}
                      placeholder="Selecione ou digite um medicamento"
                      searchPlaceholder="Buscar medicamento..."
                      emptyMessage="Nenhum medicamento encontrado."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`medicines.${index}.dosage`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosagem</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1 comprimido, 10ml" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`medicines.${index}.frequency`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequência</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: A cada 8 horas, 2x ao dia"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`medicines.${index}.duration`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração (dias)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Ex: 7"
                        min={1}
                        max={365}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          field.onChange(isNaN(value) ? "" : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() =>
            append({ name: "", dosage: "", frequency: "", duration: 7 })
          }
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Medicamento
        </Button>

        <Separator />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas da Prescrição (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Instruções especiais, cuidados, contraindicações..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          {isEditing && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isPending}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "A Guardar..."
              : isEditing
              ? "Guardar Alterações"
              : "Guardar Prescrição"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
