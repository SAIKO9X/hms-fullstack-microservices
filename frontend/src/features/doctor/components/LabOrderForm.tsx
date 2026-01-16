import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LabOrderSchema,
  type LabOrderFormData,
} from "@/lib/schemas/labOrder.schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2, FlaskConical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
// Supondo que você crie esta mutation no services
// import { useCreateLabOrder } from "@/services/queries/appointment-queries";
import { toast } from "sonner";
import { COMMON_EXAMS } from "@/data/COMMON_EXAMS";
import { useCreateLabOrder } from "@/services/queries/appointment-queries";

interface LabOrderFormProps {
  appointmentId: number;
  patientId: number;
  onSuccess: () => void;
}

export const LabOrderForm = ({
  appointmentId,
  patientId,
  onSuccess,
}: LabOrderFormProps) => {
  const createMutation = useCreateLabOrder();

  const form = useForm<LabOrderFormData>({
    resolver: zodResolver(LabOrderSchema),
    defaultValues: {
      appointmentId,
      patientId,
      notes: "",
      tests: [{ testName: "", category: "SANGUE", instructions: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tests",
  });

  const onSubmit = async (data: LabOrderFormData) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Solicitação de exames gerada com sucesso!");
      onSuccess();
    } catch (error) {
      toast.error("Erro ao gerar solicitação.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-muted/10 p-4 rounded-lg border border-dashed mb-4">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Selecione exames comuns ou digite manualmente.
          </p>
        </div>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="space-y-4 rounded-lg border p-4 bg-card shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Exame {index + 1}</h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome do Exame com Sugestões */}
              <FormField
                control={form.control}
                name={`tests.${index}.testName`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Exame</FormLabel>
                    <div className="relative">
                      <Input
                        placeholder="Ex: Hemograma"
                        {...field}
                        list={`exams-list-${index}`}
                        onChange={(e) => {
                          field.onChange(e);
                          const val = e.target.value;
                          const found = COMMON_EXAMS.find(
                            (ex) => ex.label === val
                          );

                          if (found) {
                            form.setValue(
                              `tests.${index}.category`,
                              found.category
                            );
                            form.clearErrors(`tests.${index}.category`);
                          }
                        }}
                      />
                      <datalist id={`exams-list-${index}`}>
                        {COMMON_EXAMS.map((e) => (
                          <option key={e.label} value={e.label} />
                        ))}
                      </datalist>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`tests.${index}.category`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SANGUE">
                          Sangue / Laboratorial
                        </SelectItem>
                        <SelectItem value="IMAGEM">
                          Imagem (Raio-X, USG)
                        </SelectItem>
                        <SelectItem value="URINA">Urina / Fezes</SelectItem>
                        <SelectItem value="CARDIO">Cardiológico</SelectItem>
                        <SelectItem value="OUTROS">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`tests.${index}.instructions`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instruções ao Paciente</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Jejum 8h, Bexiga cheia..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`tests.${index}.clinicalIndication`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indicação Clínica (Justificativa)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Investigação de dor abdominal"
                        {...field}
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
          className="w-full border-dashed"
          onClick={() =>
            append({ testName: "", category: "SANGUE", instructions: "" })
          }
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Outro Exame
        </Button>

        <Separator />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Gerais do Pedido</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações adicionais para o laboratório..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <FlaskConical className="mr-2 h-4 w-4" />
            Gerar Pedido de Exames
          </Button>
        </div>
      </form>
    </Form>
  );
};
