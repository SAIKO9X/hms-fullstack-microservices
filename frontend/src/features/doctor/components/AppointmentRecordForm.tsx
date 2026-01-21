import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AppointmentRecordSchema,
  AppointmentRecordUpdateSchema,
  type AppointmentRecordFormData,
  type AppointmentRecordUpdateData,
} from "@/lib/schemas/record.schema";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MultiCombobox } from "@/components/ui/multi-combobox";
import { Separator } from "@/components/ui/separator";
import { commonSymptoms } from "@/data/commonSymptoms";
import { COMMON_EXAMS } from "@/data/COMMON_EXAMS";
import type { AppointmentRecord } from "@/types/record.types";

interface AppointmentRecordFormProps {
  appointmentId: number;
  existingRecord?: AppointmentRecord | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

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
      isEditing ? AppointmentRecordUpdateSchema : AppointmentRecordSchema,
    ),
    defaultValues: {
      appointmentId,
      chiefComplaint: "",
      historyOfPresentIllness: "",
      symptoms: [],
      physicalExamNotes: "",
      diagnosisCid10: "",
      diagnosisDescription: "",
      treatmentPlan: "",
      requestedTests: [],
      notes: "",
    },
  });

  useEffect(() => {
    if (isEditing && existingRecord) {
      form.reset({
        chiefComplaint: existingRecord.chiefComplaint || "",
        historyOfPresentIllness: existingRecord.historyOfPresentIllness || "",
        symptoms: existingRecord.symptoms || [],
        physicalExamNotes: existingRecord.physicalExamNotes || "",
        diagnosisCid10: existingRecord.diagnosisCid10 || "",
        diagnosisDescription: existingRecord.diagnosisDescription || "",
        treatmentPlan: existingRecord.treatmentPlan || "",
        requestedTests: existingRecord.requestedTests || [],
        notes: existingRecord.notes || "",
      });
    }
  }, [existingRecord, form, isEditing]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && existingRecord) {
        await updateMutation.mutateAsync({
          id: existingRecord.id,
          data: data as AppointmentRecordUpdateData,
        });
      } else {
        await createMutation.mutateAsync(data as AppointmentRecordFormData);
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar prontuário", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">1. Anamnese</h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="chiefComplaint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Queixa Principal *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Dor de cabeça intensa..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symptoms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sintomas Relatados *</FormLabel>
                  <FormControl>
                    <MultiCombobox
                      options={commonSymptoms}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Selecione sintomas..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="historyOfPresentIllness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>História da Doença Atual (HMA)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detalhes sobre o início, duração e evolução dos sintomas..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">
            2. Exame Físico
          </h3>
          <Separator />

          <FormField
            control={form.control}
            name="physicalExamNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Achados do Exame Físico</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ex: PA 120/80, Ausculta pulmonar limpa..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">
            3. Diagnóstico e Conduta
          </h3>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="diagnosisCid10"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CID-10</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: J00" {...field} />
                  </FormControl>
                  <FormDescription>
                    Código Internacional de Doenças
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="diagnosisDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Diagnóstico *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Rinofaringite Aguda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="treatmentPlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plano Terapêutico / Conduta</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Repouso, hidratação, orientações gerais..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requestedTests"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Solicitação de Exames</FormLabel>
                <FormControl>
                  <MultiCombobox
                    options={COMMON_EXAMS.map((exam) => ({
                      value: exam.label,
                      label: exam.label,
                    }))}
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Selecione exames..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Gerais / Internas</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Notas que não aparecem na receita ou atestado..."
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
          <Button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto"
          >
            {isPending
              ? "A Guardar..."
              : isEditing
                ? "Atualizar Prontuário"
                : "Finalizar Atendimento e Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
