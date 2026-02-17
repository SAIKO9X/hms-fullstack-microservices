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
  consultationFee?: number;
}

export interface DoctorDropdown {
  id: number;
  userId: number;
  name: string;
  consultationFee?: number;
}

export interface PatientSummary {
  patientId: number;
  userId: number;
  patientName: string;
  patientEmail: string;
  totalAppointments: number;
  lastAppointmentDate: string;
  status: "ACTIVE" | "INACTIVE";
  profilePicture?: string;
}

export interface AvailabilitySlot {
  id?: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface DoctorSummary {
  doctorId: number;
  doctorName: string;
  specialization: string;
  profilePicture?: string;
  lastAppointmentDate: string;
}
