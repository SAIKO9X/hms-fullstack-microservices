import { z } from "zod";

export const AppointmentRecordSchema = z.object({
  appointmentId: z.number(),

  // Anamnese
  chiefComplaint: z
    .string()
    .min(3, { message: "A queixa principal é obrigatória." }),
  historyOfPresentIllness: z.string().optional(),
  symptoms: z
    .array(z.string())
    .min(1, { message: "Selecione pelo menos um sintoma." }),

  // Exame Físico
  physicalExamNotes: z.string().optional(),

  // Diagnóstico
  diagnosisCid10: z
    .string()
    .regex(/^[A-Z]\d{2}(\.\d{1,2})?$/, {
      message: "Formato inválido. Use o padrão CID-10 (ex: A00, A00.0, A00.01)",
    })
    .optional(),
  diagnosisDescription: z
    .string()
    .min(5, { message: "A descrição do diagnóstico é obrigatória." }),

  // Plano
  treatmentPlan: z.string().optional(),
  requestedTests: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const AppointmentRecordUpdateSchema = AppointmentRecordSchema.omit({
  appointmentId: true,
});

export type AppointmentRecordFormData = z.infer<typeof AppointmentRecordSchema>;
export type AppointmentRecordUpdateData = z.infer<
  typeof AppointmentRecordUpdateSchema
>;
