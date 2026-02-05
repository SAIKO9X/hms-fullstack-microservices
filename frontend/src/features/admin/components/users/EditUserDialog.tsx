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
import { useUpdateUser } from "@/services/queries/admin-queries";
import { medicalDepartments } from "@/data/medicalDepartments";
import { Combobox } from "@/components/ui/combobox";
import type { PatientProfile } from "@/types/patient.types";
import type { DoctorProfile } from "@/types/doctor.types";
import {
  createErrorNotification,
  createSuccessNotification,
  type ActionNotification,
} from "@/types/notification.types";
import { getErrorMessage, cn } from "@/utils/utils";
import { maskCPF, maskPhone } from "@/utils/masks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// --- Constantes para os Selects ---
const genderOptions = [
  { value: "MALE", label: "Masculino" },
  { value: "FEMALE", label: "Feminino" },
  { value: "OTHER", label: "Outro" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefiro não dizer" },
];

const bloodGroupOptions = [
  { value: "A_POSITIVE", label: "A+" },
  { value: "A_NEGATIVE", label: "A-" },
  { value: "B_POSITIVE", label: "B+" },
  { value: "B_NEGATIVE", label: "B-" },
  { value: "AB_POSITIVE", label: "AB+" },
  { value: "AB_NEGATIVE", label: "AB-" },
  { value: "O_POSITIVE", label: "O+" },
  { value: "O_NEGATIVE", label: "O-" },
  { value: "UNKNOWN", label: "Desconhecido" },
];

const editUserSchema = z.object({
  name: z
    .string()
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .optional(),
  email: z.string().email("Email inválido.").optional().or(z.literal("")), // Mensagem de email corrigida
  phoneNumber: z.string().optional(),
  dateOfBirth: z.any().optional().nullable(),

  // Paciente
  cpf: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  bloodGroup: z.string().optional(),
  gender: z.string().optional(),
  chronicDiseases: z.string().optional(),
  allergies: z.string().optional(),

  // Médico
  crmNumber: z.string().optional(),
  specialization: z.string().optional(),
  department: z.string().optional(),
  biography: z.string().optional(),
  qualifications: z.string().optional(),
  yearsOfExperience: z
    .union([
      z.number().min(0, { message: "Deve ser um valor positivo." }),
      z.null(),
    ])
    .optional(),
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
  setNotification: (notification: ActionNotification | null) => void;
}

// Helper para converter string | string[] para string
const formatStringOrArray = (
  value: string | string[] | undefined | null,
): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value || "";
};

export const EditUserDialog = ({
  isOpen,
  onOpenChange,
  user,
  userType,
  setNotification,
}: EditUserDialogProps) => {
  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  const currentYear = getYear(new Date());
  const fromYear = currentYear - 100;
  const toYear = currentYear;

  const { mutate: updateUser, isPending } = useUpdateUser();

  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,

        // Paciente
        cpf: (user as PatientProfile).cpf || "",
        address: (user as PatientProfile).address || "",
        emergencyContactName:
          (user as PatientProfile).emergencyContactName || "",
        emergencyContactPhone:
          (user as PatientProfile).emergencyContactPhone || "",
        bloodGroup: (user as PatientProfile).bloodGroup || "",
        gender: (user as PatientProfile).gender || "",
        chronicDiseases: formatStringOrArray(
          (user as PatientProfile).chronicDiseases,
        ),
        allergies: formatStringOrArray((user as PatientProfile).allergies),

        // Médico
        crmNumber: (user as DoctorProfile).crmNumber || "",
        specialization: (user as DoctorProfile).specialization || "",
        department: (user as DoctorProfile).department || "",
        biography: (user as DoctorProfile).biography || "",
        qualifications: (user as DoctorProfile).qualifications || "",
        yearsOfExperience: (user as DoctorProfile).yearsOfExperience ?? null, // || -> ??
      });
    }
  }, [user, form, isOpen]);

  const onSubmit = (data: EditUserFormData) => {
    if (!user) return;

    // Formata a data para YYYY-MM-DD
    const formattedDateOfBirth = data.dateOfBirth
      ? format(new Date(data.dateOfBirth), "yyyy-MM-dd")
      : undefined;

    const payload = {
      userId: user.userId,
      ...data,
      dateOfBirth: formattedDateOfBirth,
      yearsOfExperience: data.yearsOfExperience ?? null,
    };

    updateUser(payload as any, {
      onSuccess: () => {
        setNotification(
          createSuccessNotification("Utilizador atualizado com sucesso!"),
        );
        onOpenChange(false);
      },
      onError: (error: any) => {
        const description =
          getErrorMessage(error) ?? "Ocorreu um erro inesperado.";
        setNotification(
          createErrorNotification("Erro ao atualizar utilizador", description),
        );
      },
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
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
              {/* --- Campos Comuns --- */}
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
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(maskPhone(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data de Nascimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(new Date(field.value), "PPP", {
                                locale: ptBR,
                              })
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          locale={ptBR}
                          captionLayout="dropdown"
                          fromYear={fromYear}
                          toYear={toYear}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- Campos de Paciente --- */}
              {userType === "patient" && (
                <>
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input
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

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gênero</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o gênero" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {genderOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
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
                    name="bloodGroup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo Sanguíneo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo sanguíneo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bloodGroupOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
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
                    name="emergencyContactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cont. Emergência (Nome)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cont. Emergência (Telefone)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onChange={(e) => {
                              field.onChange(maskPhone(e.target.value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="allergies"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Alergias</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Penicilina, Amendoim..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chronicDiseases"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Doenças Crônicas</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Hipertensão, Diabetes..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* --- Campos de Médico --- */}
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
                    name="yearsOfExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anos de Experiência</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            // CORRIGIDO: Converte null/undefined para "" para o <input>
                            value={field.value ?? ""}
                            onChange={(e) => {
                              // CORRIGIDO: Passa null se vazio, ou o número
                              const val = e.target.value;
                              if (val === "") {
                                field.onChange(null);
                              } else {
                                // Usa valueAsNumber para garantir que o tipo é number
                                field.onChange(e.target.valueAsNumber);
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
                    name="specialization"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        {/* A label está dentro do SpecializationCombobox */}
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
                          <Textarea
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

            {/* Botões do Footer */}
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
