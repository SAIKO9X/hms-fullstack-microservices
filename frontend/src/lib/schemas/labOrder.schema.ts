import { z } from "zod";

export const LabTestItemSchema = z.object({
  testName: z.string().min(2, "Nome do exame é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  clinicalIndication: z.string().optional(),
  instructions: z.string().optional(),
});

export const LabOrderSchema = z.object({
  appointmentId: z.number(),
  patientId: z.number(),
  notes: z.string().optional(),
  tests: z.array(LabTestItemSchema).min(1, "Adicione pelo menos um exame"),
});

export type LabOrderFormData = z.infer<typeof LabOrderSchema>;
