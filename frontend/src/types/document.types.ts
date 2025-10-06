export interface MedicalDocument {
  id: number;
  patientId: number;
  appointmentId: number;
  documentName: string;
  documentType: string;
  mediaUrl: string;
  uploadedAt: string; // ISO String
}
