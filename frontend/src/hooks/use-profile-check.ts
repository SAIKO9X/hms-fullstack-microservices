import { useProfile } from "@/services/queries/profile-queries";
import type { PatientProfile } from "@/types/patient.types";
import type { DoctorProfile } from "@/types/doctor.types";

export const useProfileStatus = () => {
  const { profile, isLoading, user, isError, error } = useProfile();

  if (isLoading) {
    return { isComplete: false, isLoading: true, isError: false };
  }

  if (isError) {
    return {
      isComplete: false,
      isLoading: false,
      isError: true,
      error, 
    };
  }

  if (!profile) {
    return { isComplete: false, isLoading: false, isError: false };
  }

  let isComplete = false;

  if (user?.role === "PATIENT") {
    const p = profile as PatientProfile;
    isComplete = Boolean(p.cpf && p.phoneNumber && p.gender && p.bloodGroup);
  } else if (user?.role === "DOCTOR") {
    const d = profile as DoctorProfile;
    isComplete = Boolean(d.crmNumber && d.specialization && d.department);
  } else if (user?.role === "ADMIN") {
    isComplete = true;
  }

  return {
    isComplete,
    isLoading: false,
    role: user?.role,
    isError: false,
  };
};
