import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useMemo, useEffect } from "react";
import {
  AppointmentFormInputSchema,
  AppointmentFormSchema,
  type AppointmentFormInput,
  type AppointmentFormData,
} from "@/lib/schemas/appointment.schema";
import {
  useDoctorsDropdown,
  useGetDoctorUnavailability,
} from "@/services/queries/appointment-queries";
import { appointmentReasons } from "@/data/appointmentReasons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { formatCurrency } from "@/utils/utils";
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
  defaultDoctorId?: number;
}

export const CreateAppointmentDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  defaultDoctorId,
}: CreateAppointmentDialogProps) => {
  const { data: doctors, isLoading: isLoadingDoctors } = useDoctorsDropdown();

  const form = useForm<AppointmentFormInput>({
    resolver: zodResolver(AppointmentFormInputSchema),
    defaultValues: {
      reason: "",
      doctorId: defaultDoctorId ? String(defaultDoctorId) : "",
      appointmentTime: "",
      appointmentDate: undefined,
    },
  });

  useEffect(() => {
    if (defaultDoctorId) {
      form.setValue("doctorId", String(defaultDoctorId));
    }
  }, [defaultDoctorId, form]);

  const selectedDoctorId = form.watch("doctorId");
  const selectedDate = form.watch("appointmentDate");
  const selectedDoctor = doctors?.find(
    (d) => String(d.userId) === selectedDoctorId,
  );
  const { data: unavailabilityList } = useGetDoctorUnavailability(
    Number(selectedDoctorId),
  );

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  const availableTimeSlots = useMemo(() => {
    if (
      !selectedDate ||
      !unavailabilityList ||
      unavailabilityList.length === 0
    ) {
      return timeSlots;
    }

    return timeSlots.filter((time) => {
      const [hours, minutes] = time.split(":").map(Number);

      const slotDateTime = new Date(selectedDate);
      slotDateTime.setHours(hours, minutes, 0, 0);

      const isBlocked = unavailabilityList.some((block) => {
        const start = parseISO(block.startDateTime);
        const end = parseISO(block.endDateTime);
        return isWithinInterval(slotDateTime, { start, end });
      });

      return !isBlocked;
    });
  }, [selectedDate, unavailabilityList, timeSlots]);

  const handleFormSubmit = (data: AppointmentFormInput) => {
    const transformedData = AppointmentFormSchema.parse(data);
    onSubmit(transformedData);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => form.reset(), 200);
    }
    onOpenChange(newOpen);
  };

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
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Doutor</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={
                      isLoadingDoctors || isPending || !!defaultDoctorId
                    }
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
                          disabled={isPending || !selectedDoctorId}
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

            <FormField
              control={form.control}
              name="appointmentTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending || !selectedDate}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            selectedDate
                              ? "Selecione o horário"
                              : "Selecione a data primeiro"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableTimeSlots.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Nenhum horário disponível
                        </div>
                      ) : (
                        availableTimeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            {selectedDoctor && (
              <div className="bg-muted p-4 rounded-md mb-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">Valor da Consulta</p>
                  <p className="text-xs text-muted-foreground">
                    Pode variar conforme seu convênio
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">
                    {selectedDoctor.consultationFee
                      ? formatCurrency(selectedDoctor.consultationFee)
                      : "A combinar"}
                  </span>
                </div>
              </div>
            )}

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
