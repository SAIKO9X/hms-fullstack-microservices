export type AppointmentStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELED"
  | "NO_SHOW";

export interface DoctorDashboardStats {
  appointmentsTodayCount: number;
  completedThisWeekCount: number;
  statusDistribution: {
    SCHEDULED: number;
    COMPLETED: number;
    CANCELED: number;
  };
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  doctorName?: string;
  appointmentDateTime: string; // ISO string format
  reason: string;
  status: AppointmentStatus;
  notes?: string | null;
}

export interface AppointmentDetail {
  id: number;
  patientId: number;
  patientName: string;
  patientPhoneNumber: string;
  doctorId: number;
  doctorName: string;
  appointmentDateTime: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
}

export interface AppointmentFormInput {
  doctorId: string; // String no form, será convertido para number
  appointmentDate: Date;
  appointmentTime: string; // "HH:mm" format
  reason: string;
}

export interface AppointmentCreateRequest {
  doctorId: number;
  appointmentDateTime: string; // ISO string
  reason: string;
}

export interface AppointmentUpdateRequest {
  appointmentDateTime?: string;
  notes?: string;
}

export interface AppointmentStats {
  total: number;
  scheduled: number;
  completed: number;
  canceled: number;
}

export interface AdverseEffectReportCreateRequest {
  prescriptionId: number;
  doctorId: number;
  description: string;
}

export interface PatientGroup {
  groupName: string;
  patientCount: number;
}

export interface AdverseEffectReport {
  id: number;
  patientId: number;
  doctorId: number;
  prescriptionId: number;
  description: string;
  status: "REPORTED" | "REVIEWED";
  reportedAt: string;
}

export interface DoctorUnavailability {
  id: number;
  doctorId: number;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
}

export interface DoctorUnavailabilityRequest {
  doctorId: number;
  startDateTime: string;
  endDateTime: string;
  reason?: string;
}
