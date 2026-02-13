import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@/types/auth.types";

interface CommonUserFieldsProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

export const CommonUserFields = ({
  form,
  isEditing,
}: CommonUserFieldsProps) => {
  return (
    <>
      {!isEditing && (
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Tipo de Utilizador</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
      )}

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
                placeholder={
                  isEditing
                    ? "Deixe em branco para não alterar"
                    : "john.doe@example.com"
                }
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {!isEditing && (
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Senha Provisória</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};
