import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getYear } from "date-fns";
import { BloodGroup, Gender, type PatientProfile } from "@/types/patient.types";
import { FormDialog } from "@/components/shared/FormDialog";
import { maskCPF, maskPhone } from "@/utils/masks";
import {
  PatientProfileSchema,
  type PatientProfileFormData,
} from "@/lib/schemas/profile.schema";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  FormDatePicker,
  FormBadgeInput,
} from "@/components/ui/form-fields";

const bloodGroupOptions = Object.entries(BloodGroup).map(([key, value]) => ({
  value: key,
  label: value,
}));

const genderOptions = Object.entries(Gender).map(([key, value]) => ({
  value: key,
  label: value,
}));

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: PatientProfile;
  onSave: (data: PatientProfileFormData) => void;
  isLoading?: boolean;
}

const stringToArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const safeValueToString = (value: any): string => {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string") return value;
  return "";
};

export const EditProfileDialog = ({
  open,
  onOpenChange,
  profile,
  onSave,
  isLoading = false,
}: EditProfileDialogProps) => {
  const currentYear = getYear(new Date());
  const fromYear = currentYear - 100;
  const toYear = currentYear;

  const getSanitizedValues = (data?: PatientProfile) => ({
    cpf: data?.cpf || "",
    dateOfBirth: data?.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
    phoneNumber: data?.phoneNumber || "",
    gender: data?.gender || "OTHER",
    bloodGroup: data?.bloodGroup || undefined,
    address: data?.address || "",
    emergencyContactName: data?.emergencyContactName || "",
    emergencyContactPhone: data?.emergencyContactPhone || "",
    allergies: safeValueToString(data?.allergies),
    chronicDiseases: safeValueToString(data?.chronicDiseases),
  });

  const form = useForm<PatientProfileFormData>({
    resolver: zodResolver(PatientProfileSchema),
    defaultValues: getSanitizedValues(profile),
  });

  useEffect(() => {
    if (open && profile) {
      form.reset(getSanitizedValues(profile));
    }
  }, [profile, open, form]);

  const onSubmit = (data: PatientProfileFormData) => {
    const payload = {
      ...data,
      allergies: stringToArray(data.allergies),
      chronicDiseases: stringToArray(data.chronicDiseases),
    };

    onSave(payload as any);
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Perfil"
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isLoading}
      submitLabel="Salvar Alterações"
      className="max-w-3xl max-h-[90vh] w-full"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          control={form.control}
          name="cpf"
          label="CPF"
          placeholder="000.000.000-00"
          mask={maskCPF}
          maxLength={14}
        />

        <FormInput
          control={form.control}
          name="phoneNumber"
          label="Telefone"
          placeholder="(00) 00000-0000"
          mask={maskPhone}
          maxLength={15}
        />

        <FormDatePicker
          control={form.control}
          name="dateOfBirth"
          label="Data de Nascimento"
          fromYear={fromYear}
          toYear={toYear}
        />

        <FormSelect
          control={form.control}
          name="gender"
          label="Gênero"
          placeholder="Selecione o gênero"
          options={genderOptions}
        />

        <FormSelect
          control={form.control}
          name="bloodGroup"
          label="Tipo Sanguíneo"
          placeholder="Selecione o tipo sanguíneo"
          options={bloodGroupOptions}
        />
      </div>

      <FormTextarea
        control={form.control}
        name="address"
        label="Endereço Completo"
        placeholder="Rua, Número, Bairro, Cidade - Estado"
        rows={3}
      />

      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-medium border-b pb-2">
          Contato de Emergência
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            control={form.control}
            name="emergencyContactName"
            label="Nome do Contato"
            placeholder="Nome completo"
          />

          <FormInput
            control={form.control}
            name="emergencyContactPhone"
            label="Telefone do Contato"
            placeholder="(00) 00000-0000"
            mask={maskPhone}
            maxLength={15}
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-medium border-b pb-2">
          Informações Médicas
        </h3>

        <FormBadgeInput
          control={form.control}
          name="allergies"
          label="Alergias"
          placeholder="Digite e pressione Enter"
          description="Digite o nome e pressione Enter para adicionar. Você pode adicionar múltiplas alergias."
        />

        <FormBadgeInput
          control={form.control}
          name="chronicDiseases"
          label="Doenças Crônicas"
          placeholder="Digite e pressione Enter"
          description="Digite o nome e pressione Enter para adicionar. Você pode adicionar múltiplas doenças."
        />
      </div>
    </FormDialog>
  );
};
