// Representa o registo de uma consulta
export interface AppointmentRecord {
  id: number;
  appointmentId: number;
  symptoms: string[];
  diagnosis: string;
  tests: string[];
  notes?: string;
  prescription: string[];
  createdAt: string;
}

// Representa uma prescrição
export interface Prescription {
  id: number;
  appointmentId: number;
  notes?: string;
  medicines: Medicine[];
  createdAt: string;
}

// Representa um medicamento dentro de uma prescrição
export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: number;
}
