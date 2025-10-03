import { Navigate } from "react-router";
import { PatientDashboard } from "./PatientDashboard";
import { DoctorDashboard } from "./DoctorDashboard";
import { useAppSelector } from "@/hooks/hooks";
import { AdminDashboard } from "./AdminDashboard";

export const DashboardLayout = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  switch (user.role) {
    case "PATIENT":
      return <PatientDashboard />;
    case "DOCTOR":
      return <DoctorDashboard />;
    case "ADMIN":
      return <AdminDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};
