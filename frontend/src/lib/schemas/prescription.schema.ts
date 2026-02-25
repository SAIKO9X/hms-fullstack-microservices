import { z } from "zod";

const MedicineSchema = z.object({
  name: z
    .string("Nome do medicamento é obrigatório.")
    .min(2, "Nome deve ter pelo menos 2 caracteres."),

  dosage: z.string("Dosagem é obrigatória.").min(1, "Dosagem é obrigatória."),

  frequency: z
    .string("Frequência é obrigatória.")
    .min(1, "Frequência é obrigatória."),

  duration: z.coerce
    .number("Duração é obrigatória.")
    .positive("Duração deve ser maior que zero.")
    .int("Duração deve ser um número inteiro."),
});

export const PrescriptionSchema = z.object({
  appointmentId: z.coerce
    .number("ID da consulta é obrigatório.")
    .positive("ID da consulta deve ser válido."),

  medicines: z
    .array(MedicineSchema)
    .min(1, "Pelo menos um medicamento é obrigatório."),

  notes: z.string().optional(),
});

export const PrescriptionUpdateSchema = PrescriptionSchema.omit({
  appointmentId: true,
});

export type PrescriptionUpdateData = z.infer<typeof PrescriptionUpdateSchema>;
export type PrescriptionFormData = z.infer<typeof PrescriptionSchema>;
export type MedicineFormData = z.infer<typeof MedicineSchema>;
