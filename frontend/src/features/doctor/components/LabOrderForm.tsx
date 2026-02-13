import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LabOrderSchema,
  type LabOrderFormData,
} from "@/lib/schemas/labOrder.schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, FlaskConical } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { COMMON_EXAMS } from "@/data/COMMON_EXAMS";
import { useCreateLabOrder } from "@/services/queries/appointment-queries";
import {
  FormInput,
  FormTextarea,
  FormSelect,
} from "@/components/ui/form-fields";

interface LabOrderFormProps {
  appointmentId: number;
  patientId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORY_OPTIONS = [
  { value: "SANGUE", label: "Sangue / Laboratorial" },
  { value: "IMAGEM", label: "Imagem (Raio-X, USG)" },
  { value: "URINA", label: "Urina / Fezes" },
  { value: "CARDIO", label: "Cardiológico" },
  { value: "OUTROS", label: "Outros" },
];

export const LabOrderForm = ({
  appointmentId,
  patientId,
  onSuccess,
  onCancel,
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

        <div className="max-h-[60vh] overflow-y-auto px-1">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-4 rounded-lg border p-4 bg-card shadow-sm mb-4"
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
                              (ex) => ex.label === val,
                            );

                            if (found) {
                              form.setValue(
                                `tests.${index}.category`,
                                found.category,
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

                <FormSelect
                  control={form.control}
                  name={`tests.${index}.category`}
                  label="Categoria"
                  placeholder="Tipo"
                  options={CATEGORY_OPTIONS}
                />

                <FormInput
                  control={form.control}
                  name={`tests.${index}.instructions`}
                  label="Instruções ao Paciente"
                  placeholder="Ex: Jejum 8h, Bexiga cheia..."
                />

                <FormInput
                  control={form.control}
                  name={`tests.${index}.clinicalIndication`}
                  label="Indicação Clínica"
                  placeholder="Ex: Investigação de dor abdominal"
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

          <Separator className="my-4" />

          <FormTextarea
            control={form.control}
            name="notes"
            label="Observações Gerais do Pedido"
            placeholder="Observações adicionais para o laboratório..."
            rows={3}
          />
        </div>

        <div className="flex justify-end pt-4 gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
            <FlaskConical className="mr-2 h-4 w-4" />
            Gerar Pedido
          </Button>
        </div>
      </form>
    </Form>
  );
};
