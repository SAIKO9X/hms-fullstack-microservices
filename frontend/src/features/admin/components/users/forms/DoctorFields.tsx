import type { UseFormReturn } from "react-hook-form";
import { getYear } from "date-fns";
import { maskPhone } from "@/utils/masks";
import { SpecializationCombobox } from "@/components/ui/specialization-combobox";
import { medicalDepartments } from "@/data/medicalDepartments";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  FormInput,
  FormDatePicker,
  FormCombobox,
  FormTextarea,
} from "@/components/ui/form-fields";

interface DoctorFieldsProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

export const DoctorFields = ({ form, isEditing }: DoctorFieldsProps) => {
  const currentYear = getYear(new Date());

  return (
    <>
      <FormInput
        control={form.control}
        name="crmNumber"
        label="Nº do CRM"
        placeholder="123456"
        className={!isEditing ? "md:col-span-2" : ""}
      />

      <FormField
        control={form.control}
        name="specialization"
        render={({ field }) => (
          <FormItem
            className={`flex flex-col ${!isEditing ? "md:col-span-2" : ""}`}
          >
            {!isEditing && <FormLabel>Especialidade</FormLabel>}
            <SpecializationCombobox
              value={field.value}
              onValueChange={field.onChange}
            />
            <FormMessage />
          </FormItem>
        )}
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

          <FormInput
            control={form.control}
            name="yearsOfExperience"
            label="Anos de Experiência"
            type="number"
            onChange={(e) => {
              const val = e.target.value;
              form.setValue(
                "yearsOfExperience",
                val === "" ? null : e.target.valueAsNumber,
              );
            }}
          />

          <FormCombobox
            control={form.control}
            name="department"
            label="Departamento"
            placeholder="Selecione um departamento"
            options={medicalDepartments}
          />

          <FormInput
            control={form.control}
            name="qualifications"
            label="Qualificações"
            placeholder="Ex: Pós-graduação em..."
            className="md:col-span-2"
          />

          <FormTextarea
            control={form.control}
            name="biography"
            label="Biografia"
            placeholder="Um breve resumo sobre o médico..."
            className="md:col-span-2"
          />
        </>
      )}
    </>
  );
};
