import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormDialog } from "@/components/shared/FormDialog";
import { useCreateAdverseEffectReport } from "@/services/queries/appointment-queries";
import { FormTextarea } from "@/components/ui/form-fields";

const ReportSchema = z.object({
  description: z
    .string()
    .min(10, "Por favor, descreva o efeito com pelo menos 10 caracteres."),
});

type ReportFormData = z.infer<typeof ReportSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescriptionId: number;
  doctorId: number;
  onSuccess: () => void;
}

export const ReportAdverseEffectDialog = ({
  open,
  onOpenChange,
  prescriptionId,
  doctorId,
  onSuccess,
}: Props) => {
  const form = useForm<ReportFormData>({
    resolver: zodResolver(ReportSchema),
    defaultValues: {
      description: "",
    },
  });

  const mutation = useCreateAdverseEffectReport();

  const onSubmit = async (data: ReportFormData) => {
    await mutation.mutateAsync({
      ...data,
      prescriptionId,
      doctorId,
    });
    onSuccess();
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reportar Efeito Adverso"
      description="Descreva os sintomas ou efeitos inesperados que você está a sentir. O seu médico será notificado."
      form={form}
      onSubmit={onSubmit}
      isSubmitting={mutation.isPending}
      submitLabel="Enviar Relatório"
    >
      <FormTextarea
        control={form.control}
        name="description"
        label="Descrição dos Efeitos"
        placeholder="Ex: Senti tonturas e náuseas após tomar o medicamento..."
        rows={5}
      />
    </FormDialog>
  );
};
