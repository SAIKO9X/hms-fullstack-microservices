import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  AppointmentFormInputSchema,
  AppointmentFormSchema,
  type AppointmentFormInput,
  type AppointmentFormData,
} from "@/lib/schemas/appointment";
import { useDoctorsDropdown } from "@/services/queries/appointment-queries";
import { appointmentReasons } from "@/data/appointmentReasons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Combobox } from "@/components/ui/combobox";

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AppointmentFormData) => void;
  isPending: boolean;
}

export const CreateAppointmentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: CreateAppointmentDialogProps) => {
  const { data: doctors, isLoading: isLoadingDoctors } = useDoctorsDropdown();

  // Usar o schema de input para o useForm
  const form = useForm<AppointmentFormInput>({
    resolver: zodResolver(AppointmentFormInputSchema),
    defaultValues: {
      reason: "",
      doctorId: "",
      appointmentTime: "",
      appointmentDate: undefined,
    },
  });

  // Transformar os dados apenas no momento do submit
  const handleFormSubmit = (data: AppointmentFormInput) => {
    const transformedData = AppointmentFormSchema.parse(data);
    onSubmit(transformedData);
  };

  // Reset form quando o dialog fechar
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => form.reset(), 200);
    }
    onOpenChange(newOpen);
  };

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar Nova Consulta</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            {/* Campo de Data */}
            <FormField
              control={form.control}
              name="appointmentDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data da Consulta</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="font-normal justify-start text-left w-full"
                          disabled={isPending}
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
                        disabled={(date) => date < new Date()}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Horário */}
            <FormField
              control={form.control}
              name="appointmentTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Doutor */}
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doutor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingDoctors || isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            isLoadingDoctors
                              ? "Carregando..."
                              : "Selecione o doutor"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctors?.map((doc) => (
                        <SelectItem key={doc.userId} value={String(doc.userId)}>
                          {doc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de Motivo */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <Combobox
                  label="Motivo da Consulta"
                  placeholder="Selecione ou digite o motivo"
                  options={appointmentReasons}
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                />
              )}
            />

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                className="text-secondary cursor-pointer"
                type="submit"
                disabled={isPending}
              >
                {isPending ? "Agendando..." : "Confirmar Agendamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
