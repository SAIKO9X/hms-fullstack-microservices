import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock } from "lucide-react";
import { useMemo, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  FormDescription,
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
      duration: "60",
      type: "IN_PERSON",
    },
  });

  useEffect(() => {
    if (defaultDoctorId) {
      form.setValue("doctorId", String(defaultDoctorId));
    }
  }, [defaultDoctorId, form]);

  const selectedDoctorId = form.watch("doctorId");
  const selectedDate = form.watch("appointmentDate");
  const selectedDuration = form.watch("duration");

  const selectedDoctor = doctors?.find(
    (d) => String(d.userId) === selectedDoctorId,
  );
  const { data: unavailabilityList } = useGetDoctorUnavailability(
    Number(selectedDoctorId),
  );

  const timeSlots = [
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

  const availableTimeSlots = useMemo(() => {
    if (
      !selectedDate ||
      !unavailabilityList ||
      unavailabilityList.length === 0
    ) {
      return timeSlots;
    }

    const durationMinutes = parseInt(selectedDuration || "60", 10);

    return timeSlots.filter((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hours, minutes, 0, 0);
      const slotEnd = addMinutes(slotStart, durationMinutes);

      const isBlocked = unavailabilityList.some((block) => {
        const blockStart = parseISO(block.startDateTime);
        const blockEnd = parseISO(block.endDateTime);
        return slotStart < blockEnd && slotEnd > blockStart;
      });

      return !isBlocked;
    });
  }, [selectedDate, unavailabilityList, timeSlots, selectedDuration]);

  const handleFormSubmit = (data: AppointmentFormInput) => {
    if (!availableTimeSlots.includes(data.appointmentTime)) {
      form.setError("appointmentTime", {
        message: "Horário indisponível para esta duração.",
      });
      return;
    }
    const transformedData = AppointmentFormSchema.parse(data);
    onSubmit(transformedData);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setTimeout(() => form.reset(), 200);
    }
    onOpenChange(newOpen);
  };

  const hasDoctors = doctors && doctors.length > 0;

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
                      isLoadingDoctors ||
                      isPending ||
                      !!defaultDoctorId ||
                      !hasDoctors
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            isLoadingDoctors
                              ? "Carregando..."
                              : !hasDoctors
                                ? "Nenhum médico disponível no momento"
                                : "Selecione o doutor"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {!hasDoctors ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          Nenhum médico completou o perfil para realizar
                          consultas no momento.
                        </div>
                      ) : (
                        doctors.map((doc) => (
                          <SelectItem
                            key={doc.userId}
                            value={String(doc.userId)}
                          >
                            {doc.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="font-normal justify-start text-left w-full pl-3"
                            disabled={isPending || !selectedDoctorId}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione</span>
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
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("appointmentTime", "");
                      }}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Duração" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="15">15 min (Rápida)</SelectItem>
                        <SelectItem value="30">30 min (Padrão)</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">1 hora (Completa)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="appointmentTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário de Início</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending || !selectedDate}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <Clock className="mr-2 h-4 w-4 opacity-50" />
                        <SelectValue
                          placeholder={
                            selectedDate
                              ? "Selecione o horário"
                              : "Data primeiro"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {availableTimeSlots.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          Sem horários disponíveis
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
                  <FormDescription>
                    Mostrando horários livres para duração de {selectedDuration}{" "}
                    min.
                  </FormDescription>
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

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Consulta</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="IN_PERSON" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Presencial (Consultório)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="ONLINE" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Online (Telemedicina)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedDoctor && (
              <div className="bg-muted/50 border p-3 rounded-md flex justify-between items-center text-sm">
                <span>Valor estimado:</span>
                <span className="font-semibold text-primary">
                  {selectedDoctor.consultationFee
                    ? formatCurrency(selectedDoctor.consultationFee)
                    : "A combinar"}
                </span>
              </div>
            )}

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost" disabled={isPending}>
                  Cancelar
                </Button>
              </DialogClose>
              {/* se não houver médico desabilita o botão */}
              <Button type="submit" disabled={isPending || !hasDoctors}>
                {isPending ? "Confirmando..." : "Agendar Consulta"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
