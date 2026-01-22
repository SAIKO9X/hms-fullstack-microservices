export type AppointmentType = "IN_PERSON" | "ONLINE";

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
  duration?: number;
  appointmentEndTime?: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string | null;
  type: AppointmentType;
  meetingUrl?: string | null;
}

export interface AppointmentDetail {
  id: number;
  patientId: number;
  patientName: string;
  patientPhoneNumber: string;
  doctorId: number;
  doctorName: string;
  appointmentDateTime: string;
  duration?: number;
  appointmentEndTime?: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
}

export interface AppointmentFormInput {
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: string;
  duration?: number;
  reason: string;
  type: AppointmentType;
}

export interface AppointmentCreateRequest {
  doctorId: number;
  appointmentDateTime: string;
  duration?: number;
  reason: string;
  type: AppointmentType;
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
