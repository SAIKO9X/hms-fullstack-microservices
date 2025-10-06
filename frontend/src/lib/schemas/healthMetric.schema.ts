import { z } from "zod";

export const HealthMetricFormSchema = z.object({
  bloodPressure: z.string().optional(),
  glucoseLevel: z.coerce.number().positive().optional(),
  weight: z.coerce.number().positive("O peso é obrigatório."),
  height: z.coerce.number().positive("A altura é obrigatória."),
  heartRate: z.coerce.number().int().positive().optional(),
});

export type HealthMetricFormData = z.infer<typeof HealthMetricFormSchema>;
