import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PrescriptionSchema,
  PrescriptionUpdateSchema,
  type PrescriptionFormData,
  type PrescriptionUpdateData,
} from "@/lib/schemas/prescription.schema";
import {
  useCreatePrescription,
  useUpdatePrescription,
} from "@/services/queries/appointment-queries";
import { useMedicines } from "@/services/queries/pharmacy-queries";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AlertCircle, PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { Prescription } from "@/types/record.types";
import { useEffect } from "react";
import { Combobox } from "@/components/ui/combobox";
import { FormInput, FormTextarea } from "@/components/ui/form-fields";

interface PrescriptionFormProps {
  appointmentId: number;
  patientId?: number;
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
  const { data: medicinesPage } = useMedicines(0, 100);
  const stockMedicines = medicinesPage?.content || [];
  const medicineOptions = stockMedicines.map((med) => ({
    value: `${med.name} | ${med.dosage}`,
    label: `${med.name} (${med.dosage})`,
  }));

  const form = useForm<FormData>({
    resolver: zodResolver(
      isEditing ? PrescriptionUpdateSchema : PrescriptionSchema,
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
                render={({ field }) => {
                  const selectedMedicineName = field.value;
                  const isMedicineInSystem = selectedMedicineName
                    ? medicineOptions.some((opt) =>
                        opt.value.startsWith(selectedMedicineName),
                      )
                    : true;
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel>Nome do Medicamento</FormLabel>
                      <Combobox
                        options={medicineOptions}
                        value={field.value}
                        onValueChange={(selectedValue) => {
                          if (selectedValue) {
                            const parts = selectedValue.split(" | ");
                            const name = parts[0];
                            const dosage = parts[1];

                            form.setValue(
                              `medicines.${index}.name`,
                              name || selectedValue,
                            );
                            if (dosage) {
                              form.setValue(
                                `medicines.${index}.dosage`,
                                dosage,
                              );
                            }
                          } else {
                            form.setValue(`medicines.${index}.name`, "");
                          }
                        }}
                        placeholder="Selecione ou digite um medicamento"
                        searchPlaceholder="Buscar medicamento..."
                        emptyMessage="Nenhum medicamento encontrado."
                      />

                      {selectedMedicineName && !isMedicineInSystem && (
                        <span className="text-xs text-amber-600 flex items-center mt-1">
                          <AlertCircle className="min-w-3 min-h-3 w-3 h-3 mr-1" />
                          Medicamento não cadastrado no hospital. A farmácia
                          será notificada.
                        </span>
                      )}

                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormInput
                control={form.control}
                name={`medicines.${index}.dosage`}
                label="Dosagem"
                placeholder="Ex: 1 comprimido, 10ml"
              />

              <FormInput
                control={form.control}
                name={`medicines.${index}.frequency`}
                label="Frequência"
                placeholder="Ex: A cada 8 horas, 2x ao dia"
              />

              <FormInput
                control={form.control}
                name={`medicines.${index}.duration`}
                label="Duração (dias)"
                type="number"
                placeholder="Ex: 7"
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

        <FormTextarea
          control={form.control}
          name="notes"
          label="Notas da Prescrição (Opcional)"
          placeholder="Instruções especiais, cuidados, contraindicações..."
          rows={4}
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
