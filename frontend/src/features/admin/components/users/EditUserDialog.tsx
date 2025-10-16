import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { z } from "zod";
import { SpecializationCombobox } from "@/components/ui/specialization-combobox";
import type { PatientProfile } from "@/types/patient.types";
import type { DoctorProfile } from "@/types/doctor.types";
import { useAdminUpdateUserMutation } from "@/services/queries/admin-queries";

// Esquema de validação para o formulário de edição
const editUserSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Por favor, insira um email válido."),
  // Campos específicos de Paciente
  cpf: z.string().optional(),
  // Campos específicos de Médico
  crmNumber: z.string().optional(),
  specialization: z.string().optional(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: PatientProfile | DoctorProfile | null;
  userType: "patient" | "doctor";
}

export const EditUserDialog = ({
  isOpen,
  onOpenChange,
  user,
  userType,
}: EditUserDialogProps) => {
  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  const { mutate: updateUser, isPending } = useAdminUpdateUserMutation();

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: (user as any).email || "", // Assumindo que o email está no objeto
        cpf: (user as PatientProfile).cpf || "",
        crmNumber: (user as DoctorProfile).crmNumber || "",
        specialization: (user as DoctorProfile).specialization || "",
      });
    }
  }, [user, form]);

  const onSubmit = (data: EditUserFormData) => {
    if (!user) return;

    const payload = {
      userId: user.id,
      ...data,
    };

    updateUser(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Editar Utilizador</DialogTitle>
          <DialogDescription>
            Atualize as informações do{" "}
            {userType === "patient" ? "paciente" : "médico"}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {userType === "patient" && (
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {userType === "doctor" && (
              <>
                <FormField
                  control={form.control}
                  name="crmNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº do CRM</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Especialidade</FormLabel>
                      <SpecializationCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "A Guardar..." : "Guardar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
