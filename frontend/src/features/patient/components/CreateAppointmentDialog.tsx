import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseISO, addMinutes } from "date-fns";
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
import { FormDialog } from "@/components/shared/FormDialog";
import { formatCurrency } from "@/utils/utils";
import {
  FormSelect,
  FormDatePicker,
  FormRadioGroup,
  FormCombobox, // Novo componente importado
} from "@/components/ui/form-fields";

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AppointmentFormData) => void;
  isPending: boolean;
  defaultDoctorId?: number;
}

const TIME_SLOTS = [
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

const DURATION_OPTIONS = [
  { value: "15", label: "15 min (Rápida)" },
  { value: "30", label: "30 min (Padrão)" },
  { value: "45", label: "45 min" },
  { value: "60", label: "1 hora (Completa)" },
];

const APPOINTMENT_TYPE_OPTIONS = [
  { value: "IN_PERSON", label: "Presencial (Consultório)" },
  { value: "ONLINE", label: "Online (Telemedicina)" },
];

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

  const selectedDoctorId = form.watch("doctorId");
  const selectedDate = form.watch("appointmentDate");
  const selectedDuration = form.watch("duration");

  useEffect(() => {
    if (defaultDoctorId) {
      form.setValue("doctorId", String(defaultDoctorId));
    }
  }, [defaultDoctorId, form]);

  useEffect(() => {
    form.setValue("appointmentTime", "");
  }, [selectedDuration, form]);

  const selectedDoctor = doctors?.find(
    (d) => String(d.userId) === selectedDoctorId,
  );

  const { data: unavailabilityList } = useGetDoctorUnavailability(
    Number(selectedDoctorId),
  );

  const availableTimeSlots = useMemo(() => {
    if (
      !selectedDate ||
      !unavailabilityList ||
      unavailabilityList.length === 0
    ) {
      return TIME_SLOTS;
    }

    const durationMinutes = parseInt(selectedDuration || "60", 10);

    return TIME_SLOTS.filter((time) => {
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
  }, [selectedDate, unavailabilityList, selectedDuration]);

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

  const doctorOptions =
    doctors?.map((doc) => ({
      label: doc.name,
      value: String(doc.userId),
    })) || [];

  const timeSlotOptions = availableTimeSlots.map((time) => ({
    label: time,
    value: time,
  }));

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Agendar Nova Consulta"
      form={form}
      onSubmit={handleFormSubmit}
      isSubmitting={isPending}
      submitLabel="Agendar Consulta"
      className="max-w-md"
    >
      <FormSelect
        control={form.control}
        name="doctorId"
        label="Doutor"
        placeholder={
          isLoadingDoctors
            ? "Carregando..."
            : !hasDoctors
              ? "Nenhum médico disponível"
              : "Selecione o doutor"
        }
        options={doctorOptions}
        disabled={
          isLoadingDoctors || isPending || !!defaultDoctorId || !hasDoctors
        }
        description={
          !hasDoctors && !isLoadingDoctors
            ? "Nenhum médico completou o perfil para realizar consultas no momento."
            : undefined
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <FormDatePicker
          control={form.control}
          name="appointmentDate"
          label="Data"
          placeholder="Selecione"
          disabled={isPending || !selectedDoctorId}
          disabledDate={(date) =>
            date < new Date(new Date().setHours(0, 0, 0, 0))
          }
        />

        <FormSelect
          control={form.control}
          name="duration"
          label="Duração"
          placeholder="Duração"
          options={DURATION_OPTIONS}
          disabled={isPending}
        />
      </div>

      <FormSelect
        control={form.control}
        name="appointmentTime"
        label="Horário de Início"
        placeholder={
          selectedDate ? "Selecione o horário" : "Selecione a data primeiro"
        }
        options={timeSlotOptions}
        disabled={isPending || !selectedDate}
        description={`Mostrando horários livres para duração de ${selectedDuration} min.`}
      />

      <FormCombobox
        control={form.control}
        name="reason"
        label="Motivo da Consulta"
        placeholder="Selecione ou digite o motivo"
        options={appointmentReasons}
        disabled={isPending}
      />

      <FormRadioGroup
        control={form.control}
        name="type"
        label="Tipo de Consulta"
        options={APPOINTMENT_TYPE_OPTIONS}
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
    </FormDialog>
  );
};
