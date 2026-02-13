import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAppointments,
  useCreateMedicalDocument,
} from "@/services/queries/appointment-queries";
import { uploadFile } from "@/services/media";
import { FormDialog } from "@/components/shared/FormDialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { DocumentType } from "@/types/document.types";
import {
  DocumentSchema,
  type DocumentFormData,
} from "@/lib/schemas/document.schema";

const DOCUMENT_OPTIONS = [
  { value: DocumentType.BLOOD_REPORT, label: "Resultado de Exame de Sangue" },
  { value: DocumentType.XRAY, label: "Raio-X" },
  { value: DocumentType.PRESCRIPTION, label: "Receita Médica" },
  { value: DocumentType.MRI, label: "Ressonância Magnética" },
  { value: DocumentType.CT_SCAN, label: "Tomografia" },
  { value: DocumentType.ULTRASOUND, label: "Ultrassom" },
  { value: DocumentType.OTHER, label: "Outro" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialAppointmentId?: number;
  patientId: number;
}

export const AddDocumentDialog = ({
  open,
  onOpenChange,
  onSuccess,
  initialAppointmentId,
  patientId,
}: Props) => {
  const form = useForm<DocumentFormData>({
    resolver: zodResolver(DocumentSchema),
    defaultValues: {
      documentName: "",
      documentType: undefined,
      appointmentId: initialAppointmentId || undefined,
    },
  });

  const { data: appointmentsPage } = useAppointments(0, 100);
  const createDocumentMutation = useCreateMedicalDocument();
  const appointmentsList = appointmentsPage?.content || [];

  const patientAppointments = appointmentsList.filter(
    (app) => app.patientId === patientId,
  );

  const onSubmit = async (data: DocumentFormData) => {
    const mediaResponse = await uploadFile(data.file);
    await createDocumentMutation.mutateAsync({
      patientId: patientId,
      appointmentId: data.appointmentId,
      documentName: data.documentName,
      documentType: data.documentType,
      mediaUrl: mediaResponse.url,
    });

    onSuccess();
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Adicionar Novo Documento"
      description="Envie um documento para associar a uma das consultas."
      form={form}
      onSubmit={onSubmit}
      isSubmitting={createDocumentMutation.isPending}
      submitLabel="Enviar Documento"
    >
      <FormField
        control={form.control}
        name="file"
        render={({ field: { value, onChange, ...fieldProps } }) => (
          <FormItem>
            <FormLabel>Ficheiro</FormLabel>
            <FormControl>
              <Input
                {...fieldProps}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange(file);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="documentName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Documento</FormLabel>
            <FormControl>
              <Input placeholder="Ex: Hemograma Completo" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="documentType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de Documento</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {DOCUMENT_OPTIONS.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="appointmentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Associar à Consulta</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(Number(value))}
              defaultValue={field.value ? String(field.value) : undefined}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma consulta" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {patientAppointments.length > 0 ? (
                  patientAppointments.map((app) => (
                    <SelectItem key={app.id} value={String(app.id)}>
                      Consulta de{" "}
                      {format(new Date(app.appointmentDateTime), "dd/MM/yyyy")}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Nenhuma consulta encontrada para este paciente.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
};
