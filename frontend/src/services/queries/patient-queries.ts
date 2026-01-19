import { useQuery } from "@tanstack/react-query";
import { getMyDoctors } from "@/services/patient";

export const useMyDoctors = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["my-doctors-chat-list"],
    queryFn: getMyDoctors,
    enabled: enabled,
  });
};
