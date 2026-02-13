import type { UseFormReturn } from "react-hook-form";
import { getYear } from "date-fns";
import { maskCPF, maskPhone } from "@/utils/masks";
import {
  FormInput,
  FormSelect,
  FormDatePicker,
  FormTextarea,
} from "@/components/ui/form-fields";

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

interface PatientFieldsProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

export const PatientFields = ({ form, isEditing }: PatientFieldsProps) => {
  const currentYear = getYear(new Date());

  return (
    <>
      <FormInput
        control={form.control}
        name="cpf"
        label="CPF"
        placeholder="000.000.000-00"
        mask={maskCPF}
        maxLength={14}
        className={!isEditing ? "md:col-span-2" : ""}
      />

      {isEditing && (
        <>
          <FormInput
            control={form.control}
            name="phoneNumber"
            label="Telefone"
            mask={maskPhone}
            maxLength={15}
          />

          <FormDatePicker
            control={form.control}
            name="dateOfBirth"
            label="Data de Nascimento"
            fromYear={currentYear - 100}
            toYear={currentYear}
          />

          <FormInput control={form.control} name="address" label="Endereço" />

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

          <FormInput
            control={form.control}
            name="emergencyContactName"
            label="Cont. Emergência (Nome)"
          />

          <FormInput
            control={form.control}
            name="emergencyContactPhone"
            label="Cont. Emergência (Telefone)"
            mask={maskPhone}
            maxLength={15}
          />

          <FormTextarea
            control={form.control}
            name="allergies"
            label="Alergias"
            placeholder="Ex: Penicilina, Amendoim..."
            className="md:col-span-2"
          />

          <FormTextarea
            control={form.control}
            name="chronicDiseases"
            label="Doenças Crônicas"
            placeholder="Ex: Hipertensão, Diabetes..."
            className="md:col-span-2"
          />
        </>
      )}
    </>
  );
};
