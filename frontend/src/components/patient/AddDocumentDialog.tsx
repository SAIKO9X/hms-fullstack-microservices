import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useAppointments,
  useCreateMedicalDocument,
} from "@/hooks/appointment-queries";
import { uploadFile } from "@/services/mediaService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from "lucide-react";
import { format } from "date-fns";

// Schema de validação para o formulário
const DocumentSchema = z.object({
  documentName: z.string().min(3, "O nome do documento é obrigatório."),
  documentType: z.string().min(1, "Selecione um tipo de documento."),
  appointmentId: z.coerce
    .number()
    .positive("Selecione uma consulta para associar."),
  file: z.instanceof(File, { message: "Por favor, selecione um ficheiro." }),
});
type DocumentFormData = z.infer<typeof DocumentSchema>;

// Tipos de documento para o dropdown
const documentTypes = [
  { value: "EXAM_RESULT", label: "Resultado de Exame" },
  { value: "PRESCRIPTION_SCAN", label: "Prescrição Digitalizada" },
  { value: "MEDICAL_CERTIFICATE", label: "Atestado Médico" },
  { value: "OTHER", label: "Outro" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialAppointmentId?: number; // Para pré-selecionar a consulta
  patientId: number;
}

export const AddDocumentDialog = ({
  open,
  onOpenChange,
  onSuccess,
  initialAppointmentId,
  patientId,
}: Props) => {
  const form = useForm<z.input<typeof DocumentSchema>>({
    resolver: zodResolver(DocumentSchema),
    defaultValues: {
      appointmentId: initialAppointmentId,
    },
  });

  const { data: appointments } = useAppointments();
  const createDocumentMutation = useCreateMedicalDocument();
  const patientAppointments = appointments?.filter(
    (app) => app.patientId === patientId
  );

  const onSubmit = async (data: DocumentFormData) => {
    try {
      // 1. Upload do ficheiro para o media-service
      const mediaResponse = await uploadFile(data.file);

      // 2. Envio dos metadados para o appointment-service
      await createDocumentMutation.mutateAsync({
        appointmentId: data.appointmentId,
        documentName: data.documentName,
        documentType: data.documentType,
        mediaUrl: mediaResponse.url,
      });

      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar documento:", error);
      // Aqui pode adicionar uma notificação de erro
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Documento</DialogTitle>
          <DialogDescription>
            Envie um documento para associar a uma das suas consultas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field: { onChange, onBlur, name, ref } }) => (
                <FormItem>
                  <FormLabel>Ficheiro</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onBlur={onBlur}
                      name={name}
                      ref={ref}
                      onChange={(e) => onChange(e.target.files?.[0])}
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {documentTypes.map((type) => (
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
                    onValueChange={field.onChange}
                    defaultValue={
                      initialAppointmentId
                        ? String(initialAppointmentId)
                        : field.value
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma consulta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patientAppointments?.map((app) => (
                        <SelectItem key={app.id} value={String(app.id)}>
                          Consulta de{" "}
                          {format(
                            new Date(app.appointmentDateTime),
                            "dd/MM/yyyy"
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createDocumentMutation.isPending}>
                <Upload className="mr-2 h-4 w-4" />
                {createDocumentMutation.isPending
                  ? "A Enviar..."
                  : "Enviar Documento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
