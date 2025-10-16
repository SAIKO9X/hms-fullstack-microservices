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
import { useAdminUpdateUserMutation } from "@/services/queries/admin-queries";
import { medicalDepartments } from "@/data/medicalDepartments";
import { Combobox } from "@/components/ui/combobox";
import type { PatientProfile } from "@/types/patient.types";
import type { DoctorProfile } from "@/types/doctor.types";

const editUserSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .optional(),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  phoneNumber: z.string().optional(),

  // Paciente
  cpf: z.string().optional(),
  address: z.string().optional(),

  // Médico
  crmNumber: z.string().optional(),
  specialization: z.string().optional(),
  department: z.string().optional(),
  biography: z.string().optional(),
  qualifications: z.string().optional(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user:
    | (PatientProfile & { email?: string })
    | (DoctorProfile & { email?: string })
    | null;
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
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        cpf: (user as PatientProfile).cpf || "",
        address: (user as PatientProfile).address || "",
        crmNumber: (user as DoctorProfile).crmNumber || "",
        specialization: (user as DoctorProfile).specialization || "",
        department: (user as DoctorProfile).department || "",
        biography: (user as DoctorProfile).biography || "",
        qualifications: (user as DoctorProfile).qualifications || "",
      });
    }
  }, [user, form, isOpen]);

  const onSubmit = (data: EditUserFormData) => {
    if (!user) return;

    // Filtra apenas os campos que foram alterados para não enviar dados nulos desnecessariamente
    const changedData = Object.fromEntries(
      Object.entries(data).filter(
        ([_key, value]) => value !== "" && value !== null && value !== undefined
      )
    );

    // Se nenhum dado foi alterado, não faz nada.
    if (Object.keys(changedData).length === 0) {
      onOpenChange(false); // Apenas fecha o diálogo
      return;
    }

    const payload = {
      userId: user.id,
      ...changedData,
    };

    updateUser(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Utilizador</DialogTitle>
          <DialogDescription>
            Atualize as informações do{" "}
            {userType === "patient" ? "paciente" : "médico"}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Input
                        type="email"
                        placeholder="Deixe em branco para não alterar"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {userType === "patient" && (
                <>
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
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
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
                        <SpecializationCombobox
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="mb-1">Departamento</FormLabel>
                        <Combobox
                          options={medicalDepartments}
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Selecione um departamento"
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="qualifications"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Qualificações</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Pós-graduação em..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="biography"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Biografia</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Um breve resumo sobre o médico..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <DialogFooter className="pt-6">
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
