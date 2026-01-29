import { useQuery } from "@tanstack/react-query";

import { PatientService } from "@/services";

// === QUERY KEYS ===
export const patientKeys = {
  myDoctors: ["my-doctors-chat-list"] as const,
};

// === QUERIES ===
export const useMyDoctors = (enabled: boolean = true) => {
  return useQuery({
    queryKey: patientKeys.myDoctors,
    queryFn: PatientService.getMyDoctors,
    enabled: enabled,
  });
};
