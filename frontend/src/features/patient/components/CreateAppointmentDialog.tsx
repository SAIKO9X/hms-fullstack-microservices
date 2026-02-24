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
  useGetDoctorAvailability,
} from "@/services/queries/appointment-queries";
import { appointmentReasons } from "@/data/appointmentReasons";
import { FormDialog } from "@/components/shared/FormDialog";
import { formatCurrency } from "@/utils/utils";
import {
  FormSelect,
  FormDatePicker,
  FormRadioGroup,
  FormCombobox,
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
  }, [selectedDuration, selectedDate, form]);

  const selectedDoctor = doctors?.find(
    (d) => String(d.id) === selectedDoctorId,
  );

  const { data: unavailabilityList } = useGetDoctorUnavailability(
    Number(selectedDoctorId),
  );

  const { data: availabilityList } = useGetDoctorAvailability(
    Number(selectedDoctorId),
  );

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) {
      return TIME_SLOTS;
    }

    const durationMinutes = parseInt(selectedDuration || "60", 10);
    const dateObj = new Date(selectedDate);
    const jsDay = dateObj.getDay();
    const JAVA_DAYS_OF_WEEK = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];
    const javaDayOfWeekString = JAVA_DAYS_OF_WEEK[jsDay];

    const dayAvailabilities = availabilityList?.filter(
      (a) => a.dayOfWeek === javaDayOfWeekString,
    );

    if (
      availabilityList &&
      availabilityList.length > 0 &&
      (!dayAvailabilities || dayAvailabilities.length === 0)
    ) {
      return [];
    }

    return TIME_SLOTS.filter((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      const slotStart = new Date(selectedDate);
      slotStart.setHours(hours, minutes, 0, 0);
      const slotEnd = addMinutes(slotStart, durationMinutes);

      const slotTimeStartStr = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:00`;

      const endHours = slotEnd.getHours();
      const endMinutes = slotEnd.getMinutes();
      const slotTimeEndStr = `${endHours
        .toString()
        .padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}:00`;

      if (dayAvailabilities && dayAvailabilities.length > 0) {
        const isWithinWorkingHours = dayAvailabilities.some((avail) => {
          return (
            slotTimeStartStr >= avail.startTime &&
            slotTimeEndStr <= avail.endTime
          );
        });
        if (!isWithinWorkingHours) return false;
      }

      if (unavailabilityList && unavailabilityList.length > 0) {
        const isBlocked = unavailabilityList.some((block) => {
          const blockStart = parseISO(block.startDateTime);
          const blockEnd = parseISO(block.endDateTime);
          return slotStart < blockEnd && slotEnd > blockStart;
        });

        if (isBlocked) return false;
      }

      return true;
    });
  }, [selectedDate, unavailabilityList, availabilityList, selectedDuration]);

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
      value: String(doc.id),
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
          !selectedDate
            ? "Selecione a data primeiro"
            : timeSlotOptions.length === 0
              ? "Nenhum horário livre"
              : "Selecione o horário"
        }
        options={timeSlotOptions}
        disabled={isPending || !selectedDate || timeSlotOptions.length === 0}
        description={
          selectedDate && timeSlotOptions.length > 0
            ? `Mostrando horários livres para duração de ${selectedDuration} min.`
            : undefined
        }
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
