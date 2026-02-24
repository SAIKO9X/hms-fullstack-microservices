import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useAppSelector } from "@/store/hooks";
import {
  useAppointmentsByPatientId,
  useCreateMedicalDocument,
  useAppointmentsWithDoctorNames,
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
import { DocumentType } from "@/types/document.types";
import {
  DocumentSchema,
  type DocumentFormData,
} from "@/lib/schemas/document.schema";
import { FormInput, FormSelect } from "@/components/ui/form-fields";

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
  const { user } = useAppSelector((state) => state.auth);
  const isPatient = user?.role === "PATIENT";

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(DocumentSchema),
    defaultValues: {
      documentName: "",
      documentType: undefined,
      appointmentId: initialAppointmentId || undefined,
    },
  });

  const myAppointmentsQuery = useAppointmentsWithDoctorNames(0, 100);
  const patientAppointmentsQuery = useAppointmentsByPatientId(
    isPatient ? 0 : patientId,
  );

  const isLoading = isPatient
    ? myAppointmentsQuery.isLoading
    : patientAppointmentsQuery.isLoading;

  const appointmentsList = isPatient
    ? myAppointmentsQuery.data || []
    : patientAppointmentsQuery.data || [];

  const createDocumentMutation = useCreateMedicalDocument();

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
                  if (file) onChange(file);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormInput
        control={form.control}
        name="documentName"
        label="Nome do Documento"
        placeholder="Ex: Hemograma Completo"
      />

      <FormSelect
        control={form.control}
        name="documentType"
        label="Tipo de Documento"
        placeholder="Selecione o tipo"
        options={DOCUMENT_OPTIONS}
      />

      <FormField
        control={form.control}
        name="appointmentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Associar à Consulta</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(Number(value))}
              value={field.value ? String(field.value) : undefined}
              disabled={isLoading || appointmentsList.length === 0}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoading
                        ? "Carregando consultas..."
                        : appointmentsList.length === 0
                          ? "Nenhuma consulta encontrada"
                          : "Selecione uma consulta"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {appointmentsList.length > 0 ? (
                  appointmentsList.map((app) => {
                    const dateStr = format(
                      new Date(app.appointmentDateTime),
                      "dd/MM/yyyy 'às' HH:mm",
                    );
                    const docName = (app as any).doctorName
                      ? ` com ${(app as any).doctorName}`
                      : "";
                    const reason = app.reason ? ` - ${app.reason}` : "";

                    return (
                      <SelectItem key={app.id} value={String(app.id)}>
                        {`${dateStr}${docName}${reason}`}
                      </SelectItem>
                    );
                  })
                ) : (
                  <SelectItem value="none" disabled>
                    Nenhuma consulta encontrada.
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
