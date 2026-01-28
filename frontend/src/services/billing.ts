import api from "@/config/axios";

import type {
  InsuranceProvider,
  Invoice,
  PatientInsurance,
} from "@/types/billing.types";

// PATIENT INVOICES
export const getPatientInvoices = async (
  patientId: string,
): Promise<Invoice[]> => {
  const { data } = await api.get<Invoice[]>(
    `/billing/invoices/patient/${patientId}`,
  );
  return data;
};

export const payInvoice = async (invoiceId: string): Promise<Invoice> => {
  const { data } = await api.post<Invoice>(
    `/billing/invoices/${invoiceId}/pay`,
  );
  return data;
};

export const downloadInvoicePdf = async (invoiceId: string): Promise<void> => {
  try {
    const response = await api.get(`/billing/invoices/${invoiceId}/pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `fatura_${invoiceId}.pdf`);

    document.body.appendChild(link);
    link.click();

    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erro ao baixar PDF da fatura:", error);
    throw error;
  }
};

// DOCTOR INVOICES
export const getDoctorInvoices = async (
  doctorId: string,
): Promise<Invoice[]> => {
  const { data } = await api.get<Invoice[]>(
    `/billing/invoices/doctor/${doctorId}`,
  );
  return data;
};

// INSURANCE
export const registerInsurance = async (
  patientId: string,
  providerId: number,
  policyNumber: string,
): Promise<PatientInsurance> => {
  const { data } = await api.post<PatientInsurance>("/billing/insurance", {
    patientId,
    providerId,
    policyNumber,
  });
  return data;
};

export const getProviders = async (): Promise<InsuranceProvider[]> => {
  // TODO: Implementar chamada à API
  return [
    { id: 1, name: "Unimed", coveragePercentage: 0.8, active: true },
    { id: 2, name: "Amil", coveragePercentage: 0.5, active: true },
    { id: 3, name: "Particular", coveragePercentage: 0, active: true },
  ] as InsuranceProvider[];
};

export const getPendingInsuranceInvoices = async (): Promise<Invoice[]> => {
  const { data } = await api.get<Invoice[]>(
    "/billing/invoices/pending-insurance",
  );
  return data;
};

export const processInsurancePayment = async (
  invoiceId: string,
): Promise<void> => {
  await api.post(`/billing/invoices/${invoiceId}/process-insurance`);
};
