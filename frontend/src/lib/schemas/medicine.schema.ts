import { z } from "zod";

const MedicineCategoryEnum = z.enum(
  [
    "ANTIBIOTIC",
    "ANALGESIC",
    "ANTIHISTAMINE",
    "ANTISEPTIC",
    "VITAMIN",
    "MINERAL",
    "HERBAL",
    "HOMEOPATHIC",
    "OTHER",
  ],
  { message: "Por favor, selecione uma categoria." }
);

const MedicineTypeEnum = z.enum(
  [
    "TABLET",
    "CAPSULE",
    "SYRUP",
    "INJECTION",
    "OINTMENT",
    "DROPS",
    "INHALER",
    "OTHER",
  ],
  { message: "Por favor, selecione um tipo." }
);

// Schema para a validação do formulário de medicamento.
export const MedicineFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  dosage: z
    .string()
    .min(1, { message: "A dosagem é obrigatória (ex: 500mg, 10ml)." }),
  category: MedicineCategoryEnum,
  type: MedicineTypeEnum,
  manufacturer: z
    .string()
    .min(2, { message: "O nome do fabricante é obrigatório." }),
  unitPrice: z
    .number({ message: "O preço deve ser um número." })
    .positive({ message: "O preço deve ser um número positivo." }),
});

export type MedicineFormData = z.infer<typeof MedicineFormSchema>;
