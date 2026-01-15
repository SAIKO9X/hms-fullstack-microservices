export interface DoctorProfile {
  id: number;
  userId: number;
  name: string;
  crmNumber: string;
  specialization: string;
  department: string;
  phoneNumber: string;
  yearsOfExperience: number;
  qualifications?: string;
  biography?: string;
  dateOfBirth: Date;
  profilePictureUrl?: string;
  active: boolean;
}

export interface DoctorDropdown {
  userId: number;
  name: string;
}

export interface PatientSummary {
  patientId: number;
  patientName: string;
  patientEmail: string;
  totalAppointments: number;
  lastAppointmentDate: string;
  status: "ACTIVE" | "INACTIVE";
}
