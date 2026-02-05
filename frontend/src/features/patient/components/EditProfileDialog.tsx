import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BloodGroup, Gender, type PatientProfile } from "@/types/patient.types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BadgeInput } from "@/components/ui/badge-input";
import { maskCPF, maskPhone } from "@/utils/masks";
import { cn } from "@/utils/utils";
import {
  PatientProfileSchema,
  type PatientProfileFormData,
} from "@/lib/schemas/profile.schema";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const arrayToString = (value: string[] | undefined | null): string => {
  if (!value) return "";
  return value.join(", ");
};

export const EditProfileDialog = ({
  open,
  onOpenChange,
  profile,
  onSave,
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
    allergies: data?.allergies || "",
    chronicDiseases: data?.chronicDiseases || "",
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-full">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) =>
                          field.onChange(maskCPF(e.target.value))
                        }
                        placeholder="000.000.000-00"
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
                        onChange={(e) =>
                          field.onChange(maskPhone(e.target.value))
                        }
                        placeholder="(00) 00000-0000"
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
                              "font-normal w-full justify-start text-left",
                              !field.value && "text-muted-foreground",
                            )}
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
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          locale={ptBR}
                          captionLayout="dropdown"
                          fromYear={fromYear}
                          toYear={toYear}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o gênero" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genderOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
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
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo sanguíneo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bloodGroupOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço Completo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Rua, Número, Bairro, Cidade - Estado"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-medium border-b pb-2">
                Contato de Emergência
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emergencyContactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome completo" />
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
                      <FormLabel>Telefone do Contato</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(maskPhone(e.target.value))
                          }
                          placeholder="(00) 00000-0000"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-lg font-medium border-b pb-2">
                Informações Médicas
              </h3>
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alergias</FormLabel>
                    <FormControl>
                      <BadgeInput
                        placeholder="Digite e pressione Enter"
                        value={stringToArray(field.value)}
                        onChange={(valueArray) =>
                          field.onChange(arrayToString(valueArray))
                        }
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
                  <FormItem>
                    <FormLabel>Doenças Crônicas</FormLabel>
                    <FormControl>
                      <BadgeInput
                        placeholder="Digite e pressione Enter"
                        value={stringToArray(field.value)}
                        onChange={(valueArray) =>
                          field.onChange(arrayToString(valueArray))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-6">
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
