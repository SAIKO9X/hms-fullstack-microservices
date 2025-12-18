import { z } from "zod";

export const PatientProfileSchema = z.object({
  cpf: z.string().min(14, { message: "CPF deve ter 11 dígitos." }),
  dateOfBirth: z.date("A data de nascimento é obrigatória."),
  phoneNumber: z.string().min(15, { message: "O telefone é obrigatório." }),
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
  address: z.string().min(1, { message: "O endereço é obrigatório." }),
  emergencyContactName: z
    .string()
    .min(1, { message: "O nome do contato é obrigatório." }),
  emergencyContactPhone: z
    .string()
    .min(15, { message: "O telefone do contato é obrigatório." }),
  allergies: z.string().optional(),
  chronicDiseases: z.string().optional(),
});

export const DoctorProfileSchema = z.object({
  dateOfBirth: z.date({ error: "A data de nascimento é obrigatória." }),
  specialization: z
    .string()
    .min(2, { message: "A especialização é obrigatória." }),
  department: z.string().min(2, { message: "O departamento é obrigatório." }),
  phoneNumber: z.string().min(15, { message: "O telefone é obrigatório." }),
  yearsOfExperience: z
    .number({
      message: "Deve ser um número válido.",
    })
    .min(0, { message: "A experiência não pode ser negativa." })
    .max(70, { message: "A experiência não pode ser maior que 70 anos." }),
  qualifications: z.string().optional(),
  biography: z.string().optional(),
});

export type DoctorProfileFormData = z.infer<typeof DoctorProfileSchema>;
export type PatientProfileFormData = z.infer<typeof PatientProfileSchema>;
