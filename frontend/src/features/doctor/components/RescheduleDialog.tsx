import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { FormDialog } from "@/components/shared/FormDialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { cn } from "@/utils/utils";

const RescheduleSchema = z.object({
  appointmentDate: z.date({
    error: (issue) =>
      issue.input === undefined
        ? "A data da consulta é obrigatória."
        : "Data inválida.",
  }),
  appointmentTime: z.string().min(1, { error: "O horário é obrigatório." }),
});

type RescheduleFormData = z.infer<typeof RescheduleSchema>;

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: number;
  currentDateTime: string;
  patientName: string;
  onReschedule: (appointmentId: number, newDateTime: string) => Promise<void>;
  isLoading?: boolean;
}

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
];

export const RescheduleDialog = ({
  open,
  onOpenChange,
  appointmentId,
  currentDateTime,
  patientName,
  onReschedule,
  isLoading = false,
}: RescheduleDialogProps) => {
  const currentDate = new Date(currentDateTime);

  const form = useForm<RescheduleFormData>({
    resolver: zodResolver(RescheduleSchema),
    defaultValues: {
      appointmentDate: currentDate,
      appointmentTime: format(currentDate, "HH:mm"),
    },
  });

  const onSubmit = async (data: RescheduleFormData) => {
    const dateTime = new Date(data.appointmentDate);
    const [hours, minutes] = data.appointmentTime.split(":").map(Number);
    dateTime.setHours(hours, minutes, 0, 0);

    await onReschedule(appointmentId, dateTime.toISOString());
    onOpenChange(false);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Reagendar Consulta"
      description={
        <>
          Escolha uma nova data e hora para a consulta com{" "}
          <strong>{patientName}</strong>.
        </>
      }
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isLoading}
      submitLabel="Confirmar Reagendamento"
      className="sm:max-w-md"
    >
      <FormField
        control={form.control}
        name="appointmentDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Nova Data</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
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
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date < new Date() ||
                    date.getDay() === 0 ||
                    date.getDay() === 6
                  }
                  autoFocus
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
            <FormLabel>Novo Horário</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {TIME_SLOTS.map((time) => (
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
    </FormDialog>
  );
};
