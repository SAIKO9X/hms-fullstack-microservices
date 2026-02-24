import type { PagedResponse } from "./pagination.types";

export interface AdminDashboardStats {
  totalPatients: number;
  totalDoctors: number;
}

export interface DailyActivity {
  date: string;
  newPatients: number;
  appointments: number;
}

export interface DoctorStatus {
  id: number;
  name: string;
  specialization: string;
  status: "Disponível" | "Em Consulta";
  profilePictureUrl?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  resourceName: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export type AuditLogResponse = PagedResponse<AuditLog>;
