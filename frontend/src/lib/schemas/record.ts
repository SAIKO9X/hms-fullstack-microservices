import { z } from "zod";

// Schema para o formulário de Registo da Consulta
export const AppointmentRecordSchema = z.object({
  appointmentId: z.number(),
  symptoms: z
    .array(z.string())
    .min(1, { message: "Pelo menos um sintoma é necessário." }),
  diagnosis: z
    .string()
    .min(10, { message: "O diagnóstico deve ter pelo menos 10 caracteres." }),
  tests: z.array(z.string()).optional(),
  notes: z.string().optional(),
  prescription: z.array(z.string()).optional(),
});

export const AppointmentRecordUpdateSchema = AppointmentRecordSchema.omit({
  appointmentId: true,
});
export type AppointmentRecordUpdateData = z.infer<
  typeof AppointmentRecordUpdateSchema
>;
export type AppointmentRecordFormData = z.infer<typeof AppointmentRecordSchema>;
