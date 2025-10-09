import { Routes, Route } from "react-router";
import { AuthLayout } from "@/layouts/AuthLayout";
import { PatientDashboard } from "@/layouts/PatientDashboard";
import { DoctorDashboard } from "@/layouts/DoctorDashboard";
import { AuthPage } from "@/pages/AuthPage";
import { LandingPage } from "@/pages/LandingPage";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import { RoleBasedGuard } from "./RoleBasedGuard";
import { PatientProfilePage } from "@/pages/patient/PatientProfilePage";
import { DoctorProfilePage } from "@/pages/doctor/DoctorProfilePage";
import { PatientAppointmentsPage } from "@/pages/patient/PatientAppointmentsPage";
import { DoctorAppointmentsPage } from "@/pages/doctor/DoctorAppointmentsPage";
import { DoctorAppointmentsDetailPage } from "@/pages/doctor/DoctorAppointmentsDetailPage";
import { AdminDashboard } from "@/layouts/AdminDashboard";
import { AdminMedicinesPage } from "@/pages/admin/AdminMedicinePage";
import { AdminInventoryPage } from "@/pages/admin/AdminInventoryPage";
import { AdminSalesPage } from "@/pages/admin/AdminSalesPage";
import { AdminSaleDetailPage } from "@/pages/admin/AdminSaleDetailPage";
import { AdminNewSalePage } from "@/pages/admin/AdminNewSalePage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminPatientDetailPage } from "@/pages/admin/AdminPatientDetailPage";
import { AdminDoctorDetailPage } from "@/pages/admin/AdminDoctorDetailPage";
import { PatientDashboardPage } from "@/pages/patient/PatientDashboardPage";
import { PatientAppointmentDetailPage } from "@/pages/patient/PatientAppointmentDetailPage";
import { PatientPrescriptionsPage } from "@/pages/patient/PatientPrescriptionsPage";
import { PatientDocumentsPage } from "@/components/patient/PatientDocumentsPage";
import { DoctorDashboardPage } from "@/pages/doctor/DoctorDashboardPage";

const DoctorHomePage = () => <h2>Bem-vindo, Doutor!</h2>;

export const AppRoutes = () => {
  return (
    <Routes>
      {/* --- Rota Pública Principal --- */}
      <Route path="/" element={<LandingPage />} />

      {/* --- Rotas de Autenticação (Apenas para deslogados) --- */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>
      </Route>

      {/* --- Rotas Privadas --- */}
      <Route element={<PrivateRoute />}>
        {/* Paciente */}
        <Route element={<RoleBasedGuard allowedRoles={["PATIENT"]} />}>
          <Route path="/patient/*" element={<PatientDashboard />}>
            <Route path="dashboard" element={<PatientDashboardPage />} />
            <Route path="profile" element={<PatientProfilePage />} />
            <Route path="appointments" element={<PatientAppointmentsPage />} />
            <Route
              path="appointments/:id"
              element={<PatientAppointmentDetailPage />}
            />
            <Route
              path="prescriptions"
              element={<PatientPrescriptionsPage />}
            />
            <Route path="documents" element={<PatientDocumentsPage />} />
          </Route>
        </Route>

        {/* Doutor */}
        <Route element={<RoleBasedGuard allowedRoles={["DOCTOR"]} />}>
          <Route path="/doctor/*" element={<DoctorDashboard />}>
            <Route path="dashboard" element={<DoctorDashboardPage />} />
            <Route path="dashboard" element={<DoctorHomePage />} />
            <Route path="profile" element={<DoctorProfilePage />} />
            <Route path="appointments" element={<DoctorAppointmentsPage />} />
            <Route
              path="appointments/:id"
              element={<DoctorAppointmentsDetailPage />}
            />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<RoleBasedGuard allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/*" element={<AdminDashboard />}>
            <Route path="medicines" element={<AdminMedicinesPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="sales" element={<AdminSalesPage />} />
            <Route path="sales/:id" element={<AdminSaleDetailPage />} />
            <Route path="new-sale" element={<AdminNewSalePage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route
              path="users/patient/:id"
              element={<AdminPatientDetailPage />}
            />
            <Route
              path="users/doctor/:id"
              element={<AdminDoctorDetailPage />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<h2>Página não encontrada</h2>} />
    </Routes>
  );
};
