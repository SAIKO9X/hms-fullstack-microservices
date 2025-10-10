import { Routes, Route } from "react-router";
import { AuthLayout } from "@/features/auth/layouts/AuthLayout";
import { PatientDashboard } from "@/features/patient/layouts/PatientLayout";
import { DoctorDashboard } from "@/features/doctor/layouts/DoctorLayout";
import { AuthPage } from "@/features/auth/pages/AuthPage";
import { LandingPage } from "@/pages/LandingPage";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import { RoleBasedGuard } from "./RoleBasedGuard";
import { PatientProfilePage } from "@/features/patient/pages/PatientProfilePage";
import { DoctorProfilePage } from "@/features/doctor/pages/DoctorProfilePage";
import { PatientAppointmentsPage } from "@/features/patient/pages/PatientAppointmentsPage";
import { DoctorAppointmentsPage } from "@/features/doctor/pages/DoctorAppointmentsPage";
import { DoctorAppointmentsDetailPage } from "@/features/doctor/pages/DoctorAppointmentsDetailPage";
import { AdminDashboard } from "@/features/admin/layouts/AdminLayout";
import { AdminMedicinesPage } from "@/features/admin/pages/AdminMedicinePage";
import { AdminInventoryPage } from "@/features/admin/pages/AdminInventoryPage";
import { AdminSalesPage } from "@/features/admin/pages/AdminSalesPage";
import { AdminSaleDetailPage } from "@/features/admin/pages/AdminSaleDetailPage";
import { AdminNewSalePage } from "@/features/admin/pages/AdminNewSalePage";
import { AdminUsersPage } from "@/features/admin/pages/AdminUsersPage";
import { AdminPatientDetailPage } from "@/features/admin/pages/AdminPatientDetailPage";
import { AdminDoctorDetailPage } from "@/features/admin/pages/AdminDoctorDetailPage";
import { PatientDashboardPage } from "@/features/patient/pages/PatientDashboardPage";
import { PatientAppointmentDetailPage } from "@/features/patient/pages/PatientAppointmentDetailPage";
import { PatientPrescriptionsPage } from "@/features/patient/pages/PatientPrescriptionsPage";
import { DoctorDashboardPage } from "@/features/doctor/pages/DoctorDashboardPage";
import { PatientDocumentsPage } from "@/features/patient/pages/PatientDocumentsPage";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { PatientMedicalHistoryPage } from "@/features/patient/pages/PatientMedicalHistoryPage";

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
            <Route
              path="medical-history"
              element={<PatientMedicalHistoryPage />}
            />
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
            <Route path="dashboard" element={<AdminDashboardPage />} />
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
