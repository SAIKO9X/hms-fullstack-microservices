import { Routes, Route } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/features/auth/layouts/AuthLayout";
import {
  adminNavGroups,
  doctorNavGroups,
  patientNavGroups,
} from "@/config/navigation";
import { PrivateRoute } from "./PrivateRoute";
import { PublicRoute } from "./PublicRoute";
import { RoleBasedGuard } from "./RoleBasedGuard";
import { ProfileCompletionGuard } from "./ProfileCompletionGuard";
import { AuthPage } from "@/features/auth/pages/AuthPage";
import VerifyAccountPage from "@/features/auth/pages/VerifyAccountPage";
import { LandingPage } from "@/components/shared/LandingPage";
import { PatientDashboardPage } from "@/features/patient/pages/PatientDashboardPage";
import { PatientProfilePage } from "@/features/patient/pages/PatientProfilePage";
import { PatientAppointmentsPage } from "@/features/patient/pages/PatientAppointmentsPage";
import { PatientAppointmentDetailPage } from "@/features/patient/pages/PatientAppointmentDetailPage";
import { PatientPrescriptionsPage } from "@/features/patient/pages/PatientPrescriptionsPage";
import { PatientDocumentsPage } from "@/features/patient/pages/PatientDocumentsPage";
import { PatientMedicalHistoryPage } from "@/features/patient/pages/PatientMedicalHistoryPage";
import { PatientDoctorsListPage } from "@/features/patient/pages/PatientDoctorsListPage";
import { PatientViewDoctorProfilePage } from "@/features/patient/pages/PatientViewDoctorProfilePage";
import { PatientMessagesPage } from "@/features/patient/pages/PatientMessagesPage";
import { DoctorDashboardPage } from "@/features/doctor/pages/DoctorDashboardPage";
import { DoctorProfilePage } from "@/features/doctor/pages/DoctorProfilePage";
import { DoctorAppointmentsPage } from "@/features/doctor/pages/DoctorAppointmentsPage";
import { DoctorAppointmentsDetailPage } from "@/features/doctor/pages/DoctorAppointmentsDetailPage";
import { DoctorPatientsPage } from "@/features/doctor/pages/DoctorPatientsPage";
import { DoctorRecordsPage } from "@/features/doctor/pages/DoctorRecordsPage";
import { DoctorAvailabilityPage } from "@/features/doctor/pages/DoctorAvailabilityPage";
import { ConsultationPage } from "@/features/doctor/pages/ConsultationPage";
import { DoctorMessagesPage } from "@/features/doctor/pages/DoctorMessagesPage";
import DoctorFinancePage from "@/features/doctor/pages/DoctorFinancePage";
import { AdminDashboardPage } from "@/features/admin/pages/AdminDashboardPage";
import { AdminMedicinesPage } from "@/features/admin/pages/AdminMedicinePage";
import { AdminInventoryPage } from "@/features/admin/pages/AdminInventoryPage";
import { AdminSalesPage } from "@/features/admin/pages/AdminSalesPage";
import { AdminSaleDetailPage } from "@/features/admin/pages/AdminSaleDetailPage";
import { AdminNewSalePage } from "@/features/admin/pages/AdminNewSalePage";
import AdminUsersPage from "@/features/admin/pages/AdminUsersPage";
import { AdminPatientDetailPage } from "@/features/admin/pages/AdminPatientDetailPage";
import { AdminDoctorDetailPage } from "@/features/admin/pages/AdminDoctorDetailPage";
import { AdminDoctorSchedulePage } from "@/features/admin/pages/AdminDoctorSchedulePage";
import { AdminDoctorHistoryPage } from "@/features/admin/pages/AdminDoctorHistoryPage";
import { AdminPatientMedicalHistoryPage } from "@/features/admin/pages/AdminPatientMedicalHistoryPage";
import { AdminInsurancePage } from "@/features/admin/pages/AdminInsurancePage";
import AuditLogsPage from "@/features/admin/pages/AuditLogsPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Rotas de Autenticação */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/verify" element={<VerifyAccountPage />} />
        </Route>
      </Route>

      {/* Rotas Privadas */}
      <Route element={<PrivateRoute />}>
        {/* PACIENTE */}
        <Route element={<ProfileCompletionGuard />}>
          <Route element={<RoleBasedGuard allowedRoles={["PATIENT"]} />}>
            <Route
              path="/patient/*"
              element={
                <AppLayout
                  subtitle="Portal do Paciente"
                  groups={patientNavGroups}
                  checkProfile={true}
                />
              }
            >
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

          {/* ÁREA DO MÉDICO */}
          <Route element={<RoleBasedGuard allowedRoles={["DOCTOR"]} />}>
            <Route
              path="/doctor/*"
              element={
                <AppLayout
                  subtitle="Portal do Médico"
                  groups={doctorNavGroups}
                  checkProfile={true}
                />
              }
            >
              <Route path="dashboard" element={<DoctorDashboardPage />} />
              <Route path="profile" element={<DoctorProfilePage />} />
              <Route path="appointments" element={<DoctorAppointmentsPage />} />
              <Route path="finance" element={<DoctorFinancePage />} />
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

        {/* ÁREA DO ADMINISTRADOR */}
        <Route element={<RoleBasedGuard allowedRoles={["ADMIN"]} />}>
          <Route
            path="/admin/*"
            element={
              <AppLayout
                subtitle="Administração"
                groups={adminNavGroups}
                checkProfile={false} // admin não precisa completar perfil
              />
            }
          >
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="medicines" element={<AdminMedicinesPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
            <Route path="sales" element={<AdminSalesPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="sales/:id" element={<AdminSaleDetailPage />} />
            <Route path="new-sale" element={<AdminNewSalePage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="insurance" element={<AdminInsurancePage />} />

            {/* Rotas aninhadas */}
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

      <Route
        path="*"
        element={
          <div className="flex items-center justify-center h-screen">
            <h2 className="text-2xl font-bold text-muted-foreground">
              Página não encontrada (404)
            </h2>
          </div>
        }
      />
    </Routes>
  );
};
