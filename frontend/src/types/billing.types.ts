export type InvoiceStatus =
  | "PENDING"
  | "PAID"
  | "INSURANCE_PENDING"
  | "CANCELLED";

export interface InsuranceProvider {
  id: number;
  name: string;
  coveragePercentage: number;
  active: boolean;
}

export interface PatientInsurance {
  id: number;
  patientId: string;
  policyNumber: string;
  validUntil: string;
  provider: InsuranceProvider;
}

export interface Invoice {
  id: string;
  appointmentId: number;
  patientId: string;
  totalAmount: number;
  insuranceCovered: number;
  patientPayable: number;
  status: InvoiceStatus;
  issuedAt: string;
  paidAt?: string;
}
