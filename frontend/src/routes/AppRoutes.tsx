import { Routes, Route } from "react-router";
import { AuthLayout } from "@/features/auth/layouts/AuthLayout";
import { PatientDashboard } from "@/features/patient/layouts/PatientLayout";
import { DoctorDashboard } from "@/features/doctor/layouts/DoctorLayout";
import { AuthPage } from "@/features/auth/pages/AuthPage";
import { LandingPage } from "@/components/shared/LandingPage";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import { RoleBasedGuard } from "./RoleBasedGuard";
import { PatientProfilePage } from "@/features/patient/pages/PatientProfilePage";
import { DoctorProfilePage } from "@/features/doctor/pages/DoctorProfilePage";
import { PatientAppointmentsPage } from "@/features/patient/pages/PatientAppointmentsPage";
import { DoctorAppointmentsPage } from "@/features/doctor/pages/DoctorAppointmentsPage";
import { DoctorAppointmentsDetailPage } from "@/features/doctor/pages/DoctorAppointmentsDetailPage";
import { DoctorPatientsPage } from "@/features/doctor/pages/DoctorPatientsPage";
import { DoctorRecordsPage } from "@/features/doctor/pages/DoctorRecordsPage";
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
import { AdminDoctorSchedulePage } from "@/features/admin/pages/AdminDoctorSchedulePage";
import { AdminDoctorHistoryPage } from "@/features/admin/pages/AdminDoctorHistoryPage";
import { AdminPatientMedicalHistoryPage } from "@/features/admin/pages/AdminPatientMedicalHistoryPage";
import { ProfileCompletionGuard } from "./ProfileCompletionGuard";
import { PatientDoctorsListPage } from "@/features/patient/pages/PatientDoctorsListPage";
import { PatientViewDoctorProfilePage } from "@/features/patient/pages/PatientViewDoctorProfilePage";
import VerifyAccountPage from "@/features/auth/pages/VerifyAccountPage";
import { DoctorAvailabilityPage } from "@/features/doctor/pages/DoctorAvailabilityPage";
// IMPORTANTE: Adicione o import da ConsultationPage
import { ConsultationPage } from "@/features/doctor/pages/ConsultationPage";
import { PatientMessagesPage } from "@/features/patient/pages/PatientMessagesPage";
import { DoctorMessagesPage } from "@/features/doctor/pages/DoctorMessagesPage";
import DoctorFinancePage from "@/features/doctor/pages/DoctorFinancePage";

export const AppRoutes = () => {
  return (
    <Routes>
      {/* --- Rota Pública Principal --- */}
      <Route path="/" element={<LandingPage />} />

      {/* --- Rotas de Autenticação (Apenas para deslogados) --- */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/verify" element={<VerifyAccountPage />} />
        </Route>
      </Route>

      {/* --- Rotas Privadas --- */}
      <Route element={<PrivateRoute />}>
        {/* Paciente */}
        <Route element={<ProfileCompletionGuard />}>
          <Route element={<RoleBasedGuard allowedRoles={["PATIENT"]} />}>
            <Route path="/patient/*" element={<PatientDashboard />}>
              <Route path="dashboard" element={<PatientDashboardPage />} />
              <Route path="profile" element={<PatientProfilePage />} />
              <Route
                path="appointments"
                element={<PatientAppointmentsPage />}
              />
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
              <Route path="doctors" element={<PatientDoctorsListPage />} />
              <Route
                path="doctors/:id"
                element={<PatientViewDoctorProfilePage />}
              />
              <Route path="messages" element={<PatientMessagesPage />} />
            </Route>
          </Route>

          {/* Doutor */}
          <Route element={<RoleBasedGuard allowedRoles={["DOCTOR"]} />}>
            <Route path="/doctor/*" element={<DoctorDashboard />}>
              <Route path="dashboard" element={<DoctorDashboardPage />} />
              <Route path="profile" element={<DoctorProfilePage />} />
              <Route path="appointments" element={<DoctorAppointmentsPage />} />
              <Route path="/doctor/finance" element={<DoctorFinancePage />} />
              <Route
                path="appointments/:id"
                element={<DoctorAppointmentsDetailPage />}
              />
              <Route
                path="appointments/:id/consultation"
                element={<ConsultationPage />}
              />
              <Route path="availability" element={<DoctorAvailabilityPage />} />
              <Route path="patients" element={<DoctorPatientsPage />} />
              <Route path="records" element={<DoctorRecordsPage />} />
              <Route
                path="records/:patientId"
                element={<PatientMedicalHistoryPage />}
              />
              <Route path="messages" element={<DoctorMessagesPage />} />
            </Route>
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
              path="users/patient/:id/history"
              element={<AdminPatientMedicalHistoryPage />}
            />
            <Route
              path="users/patient/:id"
              element={<AdminPatientDetailPage />}
            />
            <Route
              path="users/doctor/:id"
              element={<AdminDoctorDetailPage />}
            />
            <Route
              path="users/doctor/:id/schedule"
              element={<AdminDoctorSchedulePage />}
            />
            <Route
              path="users/doctor/:id/history"
              element={<AdminDoctorHistoryPage />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<h2>Página não encontrada</h2>} />
    </Routes>
  );
};
