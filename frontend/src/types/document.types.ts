export const DocumentType = {
  BLOOD_REPORT: "BLOOD_REPORT",
  XRAY: "XRAY",
  PRESCRIPTION: "PRESCRIPTION",
  MRI: "MRI",
  CT_SCAN: "CT_SCAN",
  ULTRASOUND: "ULTRASOUND",
  OTHER: "OTHER",
} as const;

export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export interface MedicalDocument {
  id: number;
  patientId: number;
  appointmentId: number;
  documentName: string;
  documentType: DocumentType;
  mediaUrl: string;
  uploadedAt: string;
}

export interface MedicalDocumentCreateRequest {
  patientId: number;
  appointmentId: number;
  documentName: string;
  documentType: DocumentType;
  mediaUrl: string;
}
