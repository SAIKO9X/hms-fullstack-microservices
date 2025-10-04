import { z } from "zod";

export const saleFormSchema = z.object({
  patientId: z.number().min(1, "Selecione um comprador"),
  medicineId: z.number().min(1, "Selecione um medicamento"),
  items: z
    .array(
      z.object({
        medicineId: z.number().min(1, "Selecione um medicamento"),
        quantity: z.number().min(1, "A quantidade deve ser no mínimo 1"),
      })
    )
    .min(1, "Adicione pelo menos um medicamento à venda."),
});

export type SaleFormData = z.infer<typeof saleFormSchema>;
