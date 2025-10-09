import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppointmentRecordSchema,
  AppointmentRecordUpdateSchema,
  type AppointmentRecordFormData,
  type AppointmentRecordUpdateData,
} from "@/lib/schemas/record";
import {
  useCreateAppointmentRecord,
  useUpdateAppointmentRecord,
} from "@/services/queries/appointment-queries";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { MultiCombobox } from "../../../components/ui/multi-combobox";
import { commonSymptoms } from "@/data/commonSymptoms";
import type { AppointmentRecord } from "@/types/record.types";

interface AppointmentRecordFormProps {
  appointmentId: number;
  existingRecord?: AppointmentRecord | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

// O tipo de dados pode ser de criação OU de atualização
type FormData = AppointmentRecordFormData | AppointmentRecordUpdateData;

export const AppointmentRecordForm = ({
  appointmentId,
  existingRecord,
  onSuccess,
  onCancel,
}: AppointmentRecordFormProps) => {
  const createMutation = useCreateAppointmentRecord();
  const updateMutation = useUpdateAppointmentRecord();
  const isEditing = !!existingRecord;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FormData>({
    resolver: zodResolver(
      isEditing ? AppointmentRecordUpdateSchema : AppointmentRecordSchema
    ),
    defaultValues: isEditing
      ? {
          symptoms: existingRecord?.symptoms || [],
          diagnosis: existingRecord?.diagnosis || "",
          tests: existingRecord?.tests || [],
          notes: existingRecord?.notes || "",
        }
      : {
          appointmentId,
          symptoms: [],
          diagnosis: "",
          tests: [],
          notes: "",
        },
  });

  useEffect(() => {
    if (isEditing && existingRecord) {
      form.reset({
        symptoms: existingRecord.symptoms || [],
        diagnosis: existingRecord.diagnosis || "",
        tests: existingRecord.tests || [],
        notes: existingRecord.notes || "",
      });
    }
  }, [existingRecord, form, isEditing]);

  const onSubmit = async (data: FormData) => {
    if (isEditing && existingRecord) {
      await updateMutation.mutateAsync({
        id: existingRecord.id,
        data: data as AppointmentRecordUpdateData,
      });
    } else {
      await createMutation.mutateAsync(data as AppointmentRecordFormData);
    }
    onSuccess();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="symptoms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sintomas Apresentados</FormLabel>
              <FormControl>
                <MultiCombobox
                  options={commonSymptoms}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Selecione ou adicione sintomas..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnóstico</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o diagnóstico do paciente..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas Adicionais (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações, histórico relevante, etc."
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
          <Button type="submit" disabled={isPending} className="text-secondary">
            {isPending
              ? "A Guardar..."
              : isEditing
              ? "Guardar Alterações"
              : "Guardar Registo"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
