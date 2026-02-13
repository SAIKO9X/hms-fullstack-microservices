import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DoctorProfile } from "@/types/doctor.types";
import {
  DoctorProfileSchema,
  type DoctorProfileFormData,
  type DoctorProfileFormInput,
} from "@/lib/schemas/profile.schema";
import { maskPhone } from "@/utils/masks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FormDialog } from "@/components/shared/FormDialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, Info } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Combobox } from "@/components/ui/combobox";
import { medicalSpecializations } from "@/data/medicalSpecializations";
import { medicalDepartments } from "@/data/medicalDepartments";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: DoctorProfile | null;
  onSave: (data: DoctorProfileFormData) => void;
  isLoading?: boolean;
}

const emptyProfileDefaults: DoctorProfileFormInput = {
  dateOfBirth: new Date(),
  specialization: "",
  department: "",
  phoneNumber: "",
  yearsOfExperience: 0,
  qualifications: "",
  biography: "",
  consultationFee: 0,
};

export const EditDoctorProfileDialog = ({
  open,
  onOpenChange,
  profile,
  onSave,
  isLoading = false,
}: EditDialogProps) => {
  const form = useForm<DoctorProfileFormInput>({
    resolver: zodResolver(DoctorProfileSchema),
    defaultValues: emptyProfileDefaults,
  });

  useEffect(() => {
    if (open && profile) {
      form.reset({
        dateOfBirth: profile.dateOfBirth
          ? new Date(profile.dateOfBirth)
          : new Date(),
        specialization: profile.specialization || "",
        department: profile.department || "",
        phoneNumber: profile.phoneNumber || "",
        yearsOfExperience: profile.yearsOfExperience || 0,
        qualifications: profile.qualifications || "",
        biography: profile.biography || "",
        consultationFee: profile.consultationFee || 0,
      });
    } else if (open && !profile) {
      form.reset(emptyProfileDefaults);
    }
  }, [profile, open, form]);

  const onSubmit = (data: DoctorProfileFormData) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Perfil Profissional"
      description="Mantenha seus dados atualizados para atrair mais pacientes."
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isLoading}
      submitLabel="Salvar e Atualizar Perfil"
      className="max-w-2xl max-h-[90vh]"
    >
      <Alert className="bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/30 dark:text-blue-200 dark:border-blue-800">
        <Info className="h-4 w-4" />
        <AlertTitle className="ml-2 font-semibold">
          Atenção à Visibilidade
        </AlertTitle>
        <AlertDescription className="ml-2 mt-1 text-sm">
          Para aparecer na busca de agendamentos dos pacientes, é{" "}
          <strong>obrigatório</strong> preencher: Especialização, Biografia e
          Preço da Consulta.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                Data de Nascimento <span className="text-red-500">*</span>
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="font-normal justify-start text-left"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    captionLayout="dropdown"
                    startMonth={new Date(1900, 0)}
                    endMonth={new Date(new Date().getFullYear(), 11)}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <Combobox
              label={
                <span>
                  Especialização <span className="text-red-500">*</span>
                </span>
              }
              placeholder="Selecione..."
              searchPlaceholder="Buscar..."
              emptyMessage="Nada encontrado."
              options={medicalSpecializations}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <Combobox
              label={
                <span>
                  Departamento <span className="text-red-500">*</span>
                </span>
              }
              placeholder="Selecione..."
              searchPlaceholder="Buscar..."
              emptyMessage="Nada encontrado."
              options={medicalDepartments}
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Telefone <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="(00) 00000-0000"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  disabled={field.disabled}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(maskPhone(e.target.value))}
                />
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
                  placeholder="Ex: 15"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  disabled={field.disabled}
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? 0 : Number(v));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consultationFee"
          render={({ field }) => (
            <FormItem className="bg-slate-50 dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-800">
              <FormLabel className="font-semibold text-primary">
                Valor da Consulta (R$) <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 300.00"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  disabled={field.disabled}
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const v = e.target.value;
                    field.onChange(v === "" ? 0 : Number(v));
                  }}
                />
              </FormControl>
              <FormDescription>
                Este valor será exibido para os pacientes.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="biography"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Biografia / Sobre Mim <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value || ""}
                placeholder="Descreva sua formação, foco de atendimento e abordagem..."
                rows={4}
              />
            </FormControl>
            <FormDescription>
              Essencial para o paciente conhecer você antes de agendar.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="qualifications"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qualificações Adicionais</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value || ""}
                placeholder="Mestrado, Doutorado, Cursos de especialização..."
                rows={3}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormDialog>
  );
};
