import { useQuery } from "@tanstack/react-query";
import { getMyPatients } from "@/services/doctor";

export const useDoctorPatients = (doctorId: number | undefined) => {
  return useQuery({
    queryKey: ["doctor-patients", doctorId],
    queryFn: () => getMyPatients(),
    enabled: !!doctorId,
    staleTime: 5 * 60 * 1000,
  });
};
