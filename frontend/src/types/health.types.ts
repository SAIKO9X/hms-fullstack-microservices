export interface HealthMetric {
  id: number;
  patientId: number;
  bloodPressure?: string;
  glucoseLevel?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  heartRate?: number;
  recordedAt: string; // ISO string
}
