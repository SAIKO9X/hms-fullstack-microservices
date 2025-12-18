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
