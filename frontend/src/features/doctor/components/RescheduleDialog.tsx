import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormDatePicker, FormSelect } from "@/components/ui/form-fields";

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

const TIME_SLOT_OPTIONS = TIME_SLOTS.map((t) => ({ label: t, value: t }));

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
      <FormDatePicker
        control={form.control}
        name="appointmentDate"
        label="Nova Data"
        disabledDate={(date) =>
          date < new Date() || date.getDay() === 0 || date.getDay() === 6
        }
      />

      <FormSelect
        control={form.control}
        name="appointmentTime"
        label="Novo Horário"
        placeholder="Selecione um horário"
        options={TIME_SLOT_OPTIONS}
      />
    </FormDialog>
  );
};
