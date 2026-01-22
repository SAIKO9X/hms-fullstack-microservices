import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAppointments,
  useCreateMedicalDocument,
} from "@/services/queries/appointment-queries";
import { uploadFile } from "@/services/media";
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
import { DocumentType } from "@/types/document.types";
import {
  DocumentSchema,
  type DocumentFormData,
} from "@/lib/schemas/document.schema";

const documentOptions = [
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
    try {
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
      form.reset();
    } catch (error) {
      console.error("Erro ao enviar documento:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Documento</DialogTitle>
          <DialogDescription>
            Envie um documento para associar a uma das consultas.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            {/* Tipo de Documento */}
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
                      {documentOptions.map((type) => (
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
                            {format(
                              new Date(app.appointmentDateTime),
                              "dd/MM/yyyy",
                            )}
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
