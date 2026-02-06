import { useQuery } from "@tanstack/react-query";

import { DoctorService } from "@/services";

// === QUERY KEYS ===
export const doctorKeys = {
  patients: (doctorId?: number) => ["doctor-patients", doctorId] as const,
  profile: ["doctor-profile"] as const,
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

export const useGetDoctorProfile = () => {
  return useQuery({
    queryKey: doctorKeys.profile,
    queryFn: () => DoctorService.getMyDoctorProfile(), // Chama a função que criamos acima
    staleTime: 10 * 60 * 1000, // Cache de 10 minutos (perfil muda pouco)
  });
};
