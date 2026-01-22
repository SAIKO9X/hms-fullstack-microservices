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
});

export const AppointmentFormSchema = AppointmentFormInputSchema.transform(
  (data) => {
    const dateTime = new Date(data.appointmentDate);
    const [hours, minutes] = data.appointmentTime.split(":").map(Number);
    dateTime.setHours(hours, minutes, 0, 0);

    return {
      doctorId: parseInt(data.doctorId, 10),
      appointmentDateTime: dateTime.toISOString(),
      duration: parseInt(data.duration, 10),
      reason: data.reason,
    };
  },
);

export type AppointmentFormInput = z.infer<typeof AppointmentFormInputSchema>;
export type AppointmentFormData = z.infer<typeof AppointmentFormSchema>;
