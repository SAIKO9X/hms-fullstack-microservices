import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useEffect } from "react";
import {
  AppointmentFormInputSchema,
  AppointmentFormSchema,
  type AppointmentFormInput,
  type AppointmentFormData,
} from "@/lib/schemas/appointment.schema";
import {
  useDoctorsDropdown,
  useAvailableSlots,
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
      duration: "30",
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

  const formattedDate = selectedDate
    ? format(new Date(selectedDate), "yyyy-MM-dd")
    : undefined;

  const { data: availableSlots = [], isLoading: isLoadingSlots } =
    useAvailableSlots(
      selectedDoctorId ? Number(selectedDoctorId) : undefined,
      formattedDate,
      Number(selectedDuration),
    );

  const { data: availabilityList } = useGetDoctorAvailability(
    selectedDoctorId ? Number(selectedDoctorId) : 0,
  );

  const handleFormSubmit = (data: AppointmentFormInput) => {
    const timeValue = data.appointmentTime.substring(0, 5);
    const isValidSlot = availableSlots.some(
      (slot) => slot.substring(0, 5) === timeValue,
    );

    if (!isValidSlot) {
      form.setError("appointmentTime", {
        message: "O horário selecionado não está mais disponível.",
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

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;

    if (selectedDoctorId && availabilityList) {
      if (availabilityList.length === 0) return true;
      const JAVA_DAYS_OF_WEEK = [
        "SUNDAY",
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
      ];
      const dayStr = JAVA_DAYS_OF_WEEK[date.getDay()];

      const worksOnThisDay = availabilityList.some(
        (a) => a.dayOfWeek === dayStr,
      );
      return !worksOnThisDay;
    }
    return false;
  };

  const hasDoctors = doctors && doctors.length > 0;

  const doctorOptions =
    doctors?.map((doc) => ({
      label: doc.name,
      value: String(doc.id),
    })) || [];

  const timeSlotOptions = availableSlots.map((time) => {
    const formattedTime = time.substring(0, 5);
    return {
      label: formattedTime,
      value: formattedTime,
    };
  });

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
          disabledDate={isDateDisabled}
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
            : isLoadingSlots
              ? "Carregando..."
              : timeSlotOptions.length === 0
                ? "Nenhum horário livre"
                : "Selecione o horário"
        }
        options={timeSlotOptions}
        disabled={
          isPending ||
          !selectedDate ||
          isLoadingSlots ||
          timeSlotOptions.length === 0
        }
        description={
          selectedDate && !isLoadingSlots && timeSlotOptions.length === 0
            ? "O médico não possui vagas para o dia selecionado."
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
