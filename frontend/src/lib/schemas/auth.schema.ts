import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  password: z.string().min(1, { message: "A senha é obrigatória." }),
});

export const RegisterFormSchema = z
  .object({
    name: z.string().min(1, { message: "O nome é obrigatório." }),
    email: z.string().email({ message: "Por favor, insira um email válido." }),
    password: z
      .string()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/, {
        message:
          "A senha precisa conter uma letra maiúscula, uma minúscula e um número.",
      }),
    confirmPassword: z.string(),
    role: z.enum(["PATIENT", "DOCTOR"], "Selecione um tipo de usuário."),
    cpfOuCrm: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (data.role && data.cpfOuCrm.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          data.role === "PATIENT"
            ? "O CPF é obrigatório."
            : "O CRM é obrigatório.",
        path: ["cpfOuCrm"],
      });
    }
  });

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Formato de e-mail inválido"),
});

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/,
        "A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterFormData = z.infer<typeof RegisterFormSchema>;
export type RegisterData = Omit<RegisterFormData, "confirmPassword">;
