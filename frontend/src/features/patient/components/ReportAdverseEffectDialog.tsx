import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
// Crie os hooks e serviços abaixo no próximo passo
import { useCreateAdverseEffectReport } from "@/services/queries/appointment-queries";

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
  const form = useForm<ReportFormData>({ resolver: zodResolver(ReportSchema) });
  const mutation = useCreateAdverseEffectReport();

  const onSubmit = async (data: ReportFormData) => {
    await mutation.mutateAsync({
      ...data,
      prescriptionId,
      doctorId,
    });
    onSuccess();
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reportar Efeito Adverso</DialogTitle>
          <DialogDescription>
            Descreva os sintomas ou efeitos inesperados que você está a sentir.
            O seu médico será notificado.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição dos Efeitos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Senti tonturas e náuseas após tomar o medicamento..."
                      {...field}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "A Enviar..." : "Enviar Relatório"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
