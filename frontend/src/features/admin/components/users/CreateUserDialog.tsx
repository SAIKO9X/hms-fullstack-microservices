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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAdminCreateUserMutation } from "@/services/queries/admin-queries";
import { UserRole } from "@/types/auth.types";
import { SpecializationCombobox } from "@/components/ui/specialization-combobox";
import {
  adminCreateUserSchema,
  type AdminCreateUserFormData,
} from "@/lib/schemas/admin.schema";
import {
  createErrorNotification,
  createSuccessNotification,
  type ActionNotification,
} from "@/types/notification.types";
import { getErrorMessage } from "@/utils/utils";
import { maskCPF } from "@/utils/masks";

interface CreateUserDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  setNotification: (notification: ActionNotification | null) => void;
}

export const CreateUserDialog = ({
  isOpen,
  onOpenChange,
  setNotification,
}: CreateUserDialogProps) => {
  const form = useForm<AdminCreateUserFormData>({
    resolver: zodResolver(adminCreateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: undefined,
      cpf: "",
      crmNumber: "",
      specialization: "",
    },
  });

  const selectedRole = form.watch("role");

  const { mutate: createUser, isPending } = useAdminCreateUserMutation();

  const onSubmit = (data: AdminCreateUserFormData) => {
    createUser(data, {
      onSuccess: () => {
        setNotification(
          createSuccessNotification("Utilizador criado com sucesso!")
        );
        onOpenChange(false);
        form.reset();
      },
      onError: (error) => {
        const description =
          getErrorMessage(error) ?? "Ocorreu um erro inesperado.";
        setNotification(
          createErrorNotification("Erro ao criar utilizador", description)
        );
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Utilizador</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para registar um novo paciente ou médico no
            sistema.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Utilizador</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.PATIENT}>Paciente</SelectItem>
                      <SelectItem value={UserRole.DOCTOR}>Médico</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
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
                      placeholder="john.doe@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha Provisória</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRole === UserRole.PATIENT && (
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={(e) => {
                          field.onChange(maskCPF(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedRole === UserRole.DOCTOR && (
              <>
                <FormField
                  control={form.control}
                  name="crmNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº do CRM</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
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
                {isPending ? "A criar..." : "Criar Utilizador"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
