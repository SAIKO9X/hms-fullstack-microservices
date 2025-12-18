import { Navigate } from "react-router";
import { PatientDashboard } from "../features/patient/layouts/PatientLayout";
import { DoctorDashboard } from "../features/doctor/layouts/DoctorLayout";
import { useAppSelector } from "@/store/hooks";
import { AdminDashboard } from "../features/admin/layouts/AdminLayout";

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
