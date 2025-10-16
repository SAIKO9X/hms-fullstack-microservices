import { z } from "zod";
import { UserRole } from "@/types/auth.types";

export const adminCreateUserSchema = z
  .object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
    email: z.email("Por favor, insira um email válido."),
    password: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres.")
      .max(50, "A senha deve ter no máximo 50 caracteres."),
    role: z.enum(["PATIENT", "DOCTOR"], {
      error: "Selecione um tipo de utilizador.",
    }),
    cpf: z.string().optional(),
    crmNumber: z.string().optional(),
    specialization: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === UserRole.PATIENT) {
      if (!data.cpf || data.cpf.length < 11) {
        ctx.addIssue({
          code: "custom",
          message: "O CPF é obrigatório para pacientes.",
          path: ["cpf"],
        });
      }
    } else if (data.role === UserRole.DOCTOR) {
      if (!data.crmNumber || data.crmNumber.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "O CRM é obrigatório para médicos.",
          path: ["crmNumber"],
        });
      }
      if (!data.specialization || data.specialization.trim() === "") {
        ctx.addIssue({
          code: "custom",
          message: "A especialidade é obrigatória para médicos.",
          path: ["specialization"],
        });
      }
    }
  });

export type AdminCreateUserFormData = z.infer<typeof adminCreateUserSchema>;
