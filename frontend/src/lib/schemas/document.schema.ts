import { z } from "zod";
import { DocumentType } from "@/types/document.types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export const DocumentSchema = z.object({
  documentName: z
    .string()
    .min(3, { error: "O nome do documento é obrigatório." }),

  documentType: z.enum(DocumentType, {
    error: "Selecione um tipo de documento válido.",
  }),

  appointmentId: z
    .number({
      error: (issue) =>
        issue.code === "invalid_type" ? "Selecione uma consulta." : undefined,
    })
    .positive({ error: "Selecione uma consulta para associar." }),

  file: z
    .instanceof(File, { error: "Por favor, selecione um ficheiro." })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      error: "O ficheiro deve ter menos de 5MB.",
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      error: "Formato inválido. Apenas .jpg, .png e .pdf são aceites.",
    }),
});

export type DocumentFormData = z.infer<typeof DocumentSchema>;
