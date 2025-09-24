import { useAppSelector } from "@/hooks/hooks";
import { Navigate, Outlet } from "react-router";

export const PublicRoute = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (user) {
    let destination = "/"; // Um fallback seguro

    switch (user.role) {
      case "ADMIN":
        destination = "/admin/dashboard";
        break;
      case "DOCTOR":
        destination = "/doctor/dashboard";
        break;
      case "PATIENT":
        destination = "/patient/dashboard";
        break;
    }

    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
};
