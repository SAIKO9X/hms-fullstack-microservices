import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { DoctorProfile } from "@/types/doctor.types";
import {
  DoctorProfileSchema,
  type DoctorProfileFormData,
} from "@/lib/schemas/profile.schema";
import { maskPhone } from "@/utils/masks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Combobox } from "@/components/ui/combobox";
import { medicalSpecializations } from "@/data/medicalSpecializations";
import { medicalDepartments } from "@/data/medicalDepartments";

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: DoctorProfile | null;
  onSave: (data: DoctorProfileFormData) => void;
}

const emptyProfileDefaults: DoctorProfileFormData = {
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
}: EditDialogProps) => {
  const form = useForm<DoctorProfileFormData>({
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil Profissional</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
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
                    label="Especialização"
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
                    label="Departamento"
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
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(00) 00000-0000"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) =>
                          field.onChange(maskPhone(e.target.value))
                        }
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
                        placeholder="15"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="qualifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Qualificações</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Residência, doutorado..."
                      rows={4}
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
                <FormItem>
                  <FormLabel>Biografia</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Sobre sua carreira..."
                      rows={4}
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
                <FormItem>
                  <FormLabel>Valor da Consulta (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 300.00"
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? "" : val);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
