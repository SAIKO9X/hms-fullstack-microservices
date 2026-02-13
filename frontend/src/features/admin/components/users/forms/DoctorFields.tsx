import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/utils/utils";
import { maskPhone } from "@/utils/masks";
import { SpecializationCombobox } from "@/components/ui/specialization-combobox";
import { Combobox } from "@/components/ui/combobox";
import { medicalDepartments } from "@/data/medicalDepartments";

interface DoctorFieldsProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

export const DoctorFields = ({ form, isEditing }: DoctorFieldsProps) => {
  const currentYear = getYear(new Date());

  return (
    <>
      <FormField
        control={form.control}
        name="crmNumber"
        render={({ field }) => (
          <FormItem className={!isEditing ? "md:col-span-2" : ""}>
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
                        variant="outline"
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
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                      locale={ptBR}
                      captionLayout="dropdown"
                      fromYear={currentYear - 100}
                      toYear={currentYear}
                    />
                  </PopoverContent>
                </Popover>
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
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        field.onChange(null);
                      } else {
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
                  <Input placeholder="Ex: Pós-graduação em..." {...field} />
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
    </>
  );
};
