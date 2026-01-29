import { useQuery } from "@tanstack/react-query";

import { DoctorService } from "@/services";

// === QUERY KEYS ===
export const doctorKeys = {
  patients: (doctorId?: number) => ["doctor-patients", doctorId] as const,
};

// === QUERIES ===
export const useDoctorPatients = (doctorId: number | undefined) => {
  return useQuery({
    queryKey: doctorKeys.patients(doctorId),
    queryFn: () => DoctorService.getMyPatients(),
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000,
  });
};
