import { z } from "zod";

export const PatientProfileSchema = z.object({
  cpf: z.string().min(14, { error: "CPF deve ter 11 dígitos." }),
  dateOfBirth: z.date({ error: "A data de nascimento é obrigatória." }),
  phoneNumber: z.string().min(15, { error: "O telefone é obrigatório." }),
  bloodGroup: z.enum([
    "A_POSITIVE",
    "A_NEGATIVE",
    "B_POSITIVE",
    "B_NEGATIVE",
    "AB_POSITIVE",
    "AB_NEGATIVE",
    "O_POSITIVE",
    "O_NEGATIVE",
  ]),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  address: z.string().min(1, { error: "O endereço é obrigatório." }),
  emergencyContactName: z
    .string()
    .min(1, { error: "O nome do contato é obrigatório." }),
  emergencyContactPhone: z
    .string()
    .min(15, { error: "O telefone do contato é obrigatório." }),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
});

export const DoctorProfileSchema = z.object({
  dateOfBirth: z.date({ error: "A data de nascimento é obrigatória." }),
  specialization: z
    .string()
    .min(2, { error: "A especialização é obrigatória." }),
  department: z.string().min(2, { error: "O departamento é obrigatório." }),
  phoneNumber: z.string().min(15, { error: "O telefone é obrigatório." }),
  yearsOfExperience: z.coerce
    .number<number>({ error: "Deve ser um número válido." })
    .min(0, { error: "A experiência não pode ser negativa." })
    .max(70, { error: "A experiência não pode ser maior que 70 anos." }),
  qualifications: z.string().optional(),
  biography: z.string().min(10, {
    error: "Uma breve biografia é obrigatória para seu perfil público.",
  }),
  consultationFee: z.coerce
    .number<number>({ error: "Defina um valor para a consulta." })
    .min(1, {
      error: "O valor da consulta é obrigatório para ativar a agenda.",
    }),
});

export type DoctorProfileFormInput = z.input<typeof DoctorProfileSchema>;
export type DoctorProfileFormData = z.output<typeof DoctorProfileSchema>;
