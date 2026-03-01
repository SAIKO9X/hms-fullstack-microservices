import { Navigate } from "react-router";
import { useAppSelector } from "@/store/hooks";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  adminNavGroups,
  doctorNavGroups,
  patientNavGroups,
} from "@/config/navigation";

export const DashboardLayout = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  switch (user.role) {
    case "PATIENT":
      return (
        <AppLayout
          subtitle="Portal do Paciente"
          groups={patientNavGroups}
          checkProfile={true}
        />
      );
    case "DOCTOR":
      return (
        <AppLayout
          subtitle="Portal do Médico"
          groups={doctorNavGroups}
          checkProfile={true}
        />
      );
    case "ADMIN":
      return (
        <AppLayout
          subtitle="Administração"
          groups={adminNavGroups}
          checkProfile={false}
        />
      );
    default:
      return <Navigate to="/" replace />;
  }
};
