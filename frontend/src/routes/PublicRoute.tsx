import { useAppSelector } from "@/hooks/hooks";
import { Navigate, Outlet } from "react-router";

export const PublicRoute = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (user) {
    const destination =
      user.role === "DOCTOR" ? "/doctor/dashboard" : "/patient/dashboard";

    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
};
