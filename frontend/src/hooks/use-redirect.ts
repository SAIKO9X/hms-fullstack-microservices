import { useNavigate } from "react-router";
import type { UserResponse } from "@/types/auth.types";

export const useRoleRedirect = () => {
  const navigate = useNavigate();

  const redirectBasedOnRole = (user: UserResponse) => {
    switch (user.role) {
      case "DOCTOR":
        navigate("/doctor/dashboard", { replace: true });
        break;
      case "PATIENT":
        navigate("/patient/dashboard", { replace: true });
        break;
      case "ADMIN":
        navigate("/admin/dashboard", { replace: true });
        break;
      default:
        navigate("/", { replace: true });
    }
  };

  return { redirectBasedOnRole };
};
