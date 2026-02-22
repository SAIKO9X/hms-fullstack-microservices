export interface ReviewRequest {
  appointmentId: number;
  doctorId: number;
  rating: number; // 1 a 5
  comment: string;
}

export interface ReviewResponse {
  id: number;
  appointmentId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  patientName?: string;
  patientPhotoUrl?: string;
}

export interface DoctorRatingStats {
  averageRating: number;
  totalReviews: number;
}
