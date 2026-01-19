import api from "@/config/axios";
import type {
  InsuranceProvider,
  Invoice,
  PatientInsurance,
} from "@/types/billing.types";

export const billingService = {
  // Buscar faturas do paciente
  getPatientInvoices: async (patientId: string) => {
    const { data } = await api.get<Invoice[]>(
      `/billing/invoices/patient/${patientId}`,
    );
    return data;
  },

  // Buscar faturas do médico
  getDoctorInvoices: async (doctorId: string) => {
    const { data } = await api.get<Invoice[]>(
      `/billing/invoices/doctor/${doctorId}`,
    );
    return data;
  },

  // Pagar fatura
  payInvoice: async (invoiceId: string) => {
    const { data } = await api.post<Invoice>(
      `/billing/invoices/${invoiceId}/pay`,
    );
    return data;
  },

  // Cadastrar convênio
  registerInsurance: async (
    patientId: string,
    providerId: number,
    policyNumber: string,
  ) => {
    const { data } = await api.post<PatientInsurance>("/billing/insurance", {
      patientId,
      providerId,
      policyNumber,
    });
    return data;
  },

  // Listar convênios disponíveis (mocked)
  getProviders: async () => {
    return [
      { id: 1, name: "Unimed", coveragePercentage: 0.8, active: true },
      { id: 2, name: "Amil", coveragePercentage: 0.5, active: true },
      { id: 3, name: "Particular", coveragePercentage: 0, active: true },
    ] as InsuranceProvider[];
  },
};
