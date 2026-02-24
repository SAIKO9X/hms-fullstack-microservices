import { z } from "zod";

export const AppointmentFormInputSchema = z.object({
  doctorId: z
    .string({ message: "Por favor, selecione um doutor." })
    .min(1, { message: "Por favor, selecione um doutor." }),
  appointmentDate: z.date({
    message: "A data da consulta é obrigatória.",
  }),
  appointmentTime: z.string().min(1, { message: "O horário é obrigatório." }),
  duration: z.string().min(1),
  reason: z
    .string()
    .min(5, { message: "O motivo deve ter pelo menos 5 caracteres." }),
  type: z.enum(["IN_PERSON", "ONLINE"], {
    message: "Selecione o tipo de consulta.",
  }),
});

export const AppointmentFormSchema = AppointmentFormInputSchema.transform(
  (data) => {
    const d = new Date(data.appointmentDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const time = data.appointmentTime;
    const localDateTimeStr = `${year}-${month}-${day}T${time}:00`;

    return {
      doctorId: parseInt(data.doctorId, 10),
      appointmentDateTime: localDateTimeStr,
      duration: parseInt(data.duration, 10),
      reason: data.reason,
      type: data.type,
    };
  },
);

export type AppointmentFormInput = z.infer<typeof AppointmentFormInputSchema>;
export type AppointmentFormData = z.infer<typeof AppointmentFormSchema>;
