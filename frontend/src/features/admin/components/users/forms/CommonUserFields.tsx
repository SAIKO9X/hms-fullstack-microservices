import type { UseFormReturn } from "react-hook-form";
import { UserRole } from "@/types/auth.types";
import { FormInput, FormSelect } from "@/components/ui/form-fields";

interface CommonUserFieldsProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

const ROLE_OPTIONS = [
  { value: UserRole.PATIENT, label: "Paciente" },
  { value: UserRole.DOCTOR, label: "Médico" },
];

export const CommonUserFields = ({
  form,
  isEditing,
}: CommonUserFieldsProps) => {
  return (
    <>
      {!isEditing && (
        <FormSelect
          control={form.control}
          name="role"
          label="Tipo de Utilizador"
          placeholder="Selecione o tipo..."
          options={ROLE_OPTIONS}
          className="md:col-span-2"
        />
      )}

      <FormInput
        control={form.control}
        name="name"
        label="Nome Completo"
        placeholder="John Doe"
      />

      <FormInput
        control={form.control}
        name="email"
        label="Email"
        type="email"
        placeholder={
          isEditing
            ? "Deixe em branco para não alterar"
            : "john.doe@example.com"
        }
      />

      {!isEditing && (
        <FormInput
          control={form.control}
          name="password"
          label="Senha Provisória"
          type="password"
          placeholder="••••••••"
          className="md:col-span-2"
        />
      )}
    </>
  );
};
