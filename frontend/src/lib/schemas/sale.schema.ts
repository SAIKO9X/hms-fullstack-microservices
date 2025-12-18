import { z } from "zod";

const SaleItemSchema = z.object({
  medicineId: z.number().positive("Selecione um medicamento válido."),
  quantity: z.number().positive("A quantidade deve ser no mínimo 1."),
});

export const saleFormSchema = z.object({
  patientId: z.number().positive("Selecione um comprador."),
  items: z
    .array(SaleItemSchema)
    .min(1, "Adicione pelo menos um medicamento à venda."),
});

export type SaleFormData = z.infer<typeof saleFormSchema>;
