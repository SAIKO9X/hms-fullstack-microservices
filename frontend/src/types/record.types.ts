// frontend/src/types/record.types.ts

export interface AppointmentRecord {
  id: number;
  appointmentId: number;
  // Anamnese
  chiefComplaint: string; // Queixa Principal
  historyOfPresentIllness?: string; // HMA
  symptoms: string[];

  // Exame Físico
  physicalExamNotes?: string;

  // Diagnóstico e Plano
  diagnosisCid10?: string;
  diagnosisDescription: string;
  treatmentPlan?: string;

  // Outros
  requestedTests: string[];
  notes?: string; // Observações gerais
  createdAt: string;
}

export interface Prescription {
  id: number;
  appointmentId: number;
  patientId: number;
  notes?: string;
  medicines: Medicine[];
  createdAt: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: number;
}
