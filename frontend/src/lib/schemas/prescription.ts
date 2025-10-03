// /lib/schemas/prescription.ts - CORRIGIDO
import { z } from "zod";

const MedicineSchema = z.object({
  name: z
    .string({ error: "Nome do medicamento é obrigatório." })
    .min(2, { error: "Nome deve ter pelo menos 2 caracteres." }),

  dosage: z
    .string({ error: "Dosagem é obrigatória." })
    .min(1, { error: "Dosagem é obrigatória." }),

  frequency: z
    .string({ error: "Frequência é obrigatória." })
    .min(1, { error: "Frequência é obrigatória." }),

  duration: z
    .number({ error: "Duração é obrigatória." })
    .positive({ error: "Duração deve ser maior que zero." })
    .int({ error: "Duração deve ser um número inteiro." }),
});

export const PrescriptionSchema = z.object({
  appointmentId: z
    .number({ error: "ID da consulta é obrigatório." })
    .positive({ error: "ID da consulta deve ser válido." }),

  medicines: z
    .array(MedicineSchema)
    .min(1, { error: "Pelo menos um medicamento é obrigatório." }),

  notes: z.string().optional(),
});

export const PrescriptionUpdateSchema = PrescriptionSchema.omit({
  appointmentId: true,
});
export type PrescriptionUpdateData = z.infer<typeof PrescriptionUpdateSchema>;
export type PrescriptionFormData = z.infer<typeof PrescriptionSchema>;
export type MedicineFormData = z.infer<typeof MedicineSchema>;
