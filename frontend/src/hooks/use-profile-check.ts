import { useProfile } from "@/services/queries/profile-queries";
import type { PatientProfile } from "@/types/patient.types";
import type { DoctorProfile } from "@/types/doctor.types";

export const useProfileStatus = () => {
  const { profile, isLoading, user, isError } = useProfile();

  if (isLoading) {
    return { isComplete: false, isLoading: true };
  }

  if (isError || !profile) {
    return { isComplete: false, isLoading: false };
  }

  let isComplete = false;

  if (user?.role === "PATIENT") {
    const p = profile as PatientProfile;
    // Verifica campos vitais para o funcionamento do sistema
    // Ex: Sem CPF e Telefone, o sistema não consegue gerar receitas/agendamentos corretamente
    isComplete = Boolean(p.cpf && p.phoneNumber && p.gender && p.bloodGroup);
  } else if (user?.role === "DOCTOR") {
    const d = profile as DoctorProfile;
    // Para médicos, CRM e Especialização serão obrigatórios
    isComplete = Boolean(d.crmNumber && d.specialization && d.department);
  } else if (user?.role === "ADMIN") {
    isComplete = true;
  }

  return {
    isComplete,
    isLoading: false,
    role: user?.role,
  };
};
