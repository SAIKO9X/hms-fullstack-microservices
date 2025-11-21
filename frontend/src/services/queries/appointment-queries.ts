import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { useRoleBasedQuery } from "../../hooks/use-role-based";
import { PatientService, DoctorService, AppointmentService } from "@/services";
import type {
  AdverseEffectReportCreateRequest,
  Appointment,
} from "@/types/appointment.types";
import type { MedicalDocumentCreateRequest } from "@/types/document.types";
import type { AppointmentFormData } from "@/lib/schemas/appointment.schema";
import type {
  AppointmentRecordFormData,
  AppointmentRecordUpdateData,
} from "@/lib/schemas/record.schema";
import type {
  PrescriptionFormData,
  PrescriptionUpdateData,
} from "@/lib/schemas/prescription.schema";
import type { HealthMetricFormData } from "@/lib/schemas/healthMetric.schema";

export interface AppointmentWithDoctor extends Appointment {
  doctorName?: string;
  doctorSpecialty?: string;
}

export const appointmentKeys = {
  all: ["appointments"] as const,
  patient: () => [...appointmentKeys.all, "patient"] as const,
  doctor: () => [...appointmentKeys.all, "doctor"] as const,
  detail: (id: number) => [...appointmentKeys.all, "detail", id] as const,
  doctors: ["doctorsDropdown"] as const,
  record: (appointmentId: number) =>
    [...appointmentKeys.all, "record", appointmentId] as const,
  prescription: (appointmentId: number) =>
    [...appointmentKeys.all, "prescription", appointmentId] as const,
  next: () => [...appointmentKeys.all, "patient", "next"] as const,
  latestPrescription: () =>
    [...appointmentKeys.all, "patient", "latestPrescription"] as const,
  stats: () => [...appointmentKeys.all, "patient", "stats"] as const,
  latestHealthMetric: () => ["healthMetrics", "patient", "latest"] as const,
  prescriptionsHistory: () =>
    [...appointmentKeys.all, "patient", "prescriptionsHistory"] as const,
  myDocuments: () => ["documents", "patient"] as const,
  doctorDetails: (dateFilter?: string) =>
    [...appointmentKeys.doctor(), "details", dateFilter || "all"] as const,
};

export const useAppointments = () => {
  return useRoleBasedQuery<Appointment[]>({
    queryKey: appointmentKeys.all,
    patientFn: PatientService.getMyAppointments,
    doctorFn: DoctorService.getMyAppointmentsAsDoctor,
    options: {
      staleTime: 3 * 60 * 1000,
    },
  });
};

export const useDoctorAppointmentDetails = (
  dateFilter?: "today" | "week" | "month"
) => {
  return useQuery({
    queryKey: appointmentKeys.doctorDetails(dateFilter),
    queryFn: () => DoctorService.getDoctorAppointmentDetails(dateFilter),
    staleTime: 1 * 60 * 1000,
  });
};

export const useAppointmentsWithDoctorNames = () => {
  const { user } = useAppSelector((state) => state.auth);
  const appointmentsQuery = useAppointments();

  const doctorsQuery = useQuery({
    queryKey: appointmentKeys.doctors,
    queryFn: AppointmentService.getDoctorsForDropdown,
    staleTime: 10 * 60 * 1000,
    enabled: !!appointmentsQuery.data && user?.role === "PATIENT",
  });

  const appointmentsWithDoctorNames: AppointmentWithDoctor[] = useMemo(() => {
    if (!appointmentsQuery.data) return [];

    if (user?.role === "DOCTOR" || !doctorsQuery.data) {
      return appointmentsQuery.data;
    }

    return appointmentsQuery.data.map((appointment) => {
      const doctor = doctorsQuery.data.find(
        (doc) => doc.userId === appointment.doctorId
      );
      return {
        ...appointment,
        doctorName: doctor?.name || `Doutor ID: ${appointment.doctorId}`,
      };
    });
  }, [appointmentsQuery.data, doctorsQuery.data, user?.role]);

  return {
    data: appointmentsWithDoctorNames,
    isLoading:
      appointmentsQuery.isLoading ||
      (user?.role === "PATIENT" && doctorsQuery.isLoading),
    isError:
      appointmentsQuery.isError ||
      (user?.role === "PATIENT" && doctorsQuery.isError),
    error:
      appointmentsQuery.error ||
      (user?.role === "PATIENT" && doctorsQuery.error),
  };
};

export const useAppointmentById = (id: number) => {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => AppointmentService.getAppointmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentData: AppointmentFormData) =>
      PatientService.createAppointment(appointmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AppointmentService.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newDateTime }: { id: number; newDateTime: string }) =>
      AppointmentService.rescheduleAppointment(id, newDateTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      DoctorService.completeAppointment(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

export const useDoctorsDropdown = () => {
  return useQuery({
    queryKey: appointmentKeys.doctors,
    queryFn: AppointmentService.getDoctorsForDropdown,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
};

export const useAppointmentRecord = (appointmentId: number) => {
  return useQuery({
    queryKey: appointmentKeys.record(appointmentId),
    queryFn: () =>
      AppointmentService.getAppointmentRecordByAppointmentId(appointmentId),
    enabled: !!appointmentId,
  });
};

export const useCreateAppointmentRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AppointmentRecordFormData) =>
      AppointmentService.createAppointmentRecord(data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        appointmentKeys.record(data.appointmentId),
        data
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

export const useUpdateAppointmentRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; data: AppointmentRecordUpdateData }) =>
      AppointmentService.updateAppointmentRecord(vars),
    onSuccess: (data) => {
      queryClient.setQueryData(
        appointmentKeys.record(data.appointmentId),
        data
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

export const usePrescription = (appointmentId: number) => {
  return useQuery({
    queryKey: appointmentKeys.prescription(appointmentId),
    queryFn: () =>
      AppointmentService.getPrescriptionByAppointmentId(appointmentId),
    enabled: !!appointmentId,
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PrescriptionFormData) =>
      AppointmentService.createPrescription(data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        appointmentKeys.prescription(data.appointmentId),
        data
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

export const useUpdatePrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; data: PrescriptionUpdateData }) =>
      AppointmentService.updatePrescription(vars),
    onSuccess: (data) => {
      queryClient.setQueryData(
        appointmentKeys.prescription(data.appointmentId),
        data
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

export const useNextAppointment = () => {
  return useQuery({
    queryKey: appointmentKeys.next(),
    queryFn: PatientService.getNextAppointment,
  });
};

export const useLatestPrescription = () => {
  return useQuery({
    queryKey: appointmentKeys.latestPrescription(),
    queryFn: PatientService.getLatestPrescription,
  });
};

export const useAppointmentStats = () => {
  return useQuery({
    queryKey: appointmentKeys.stats(),
    queryFn: PatientService.getAppointmentStats,
  });
};

export const useLatestHealthMetric = () => {
  return useQuery({
    queryKey: appointmentKeys.latestHealthMetric(),
    queryFn: AppointmentService.getLatestHealthMetric,
  });
};

export const useCreateHealthMetric = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HealthMetricFormData) =>
      AppointmentService.createHealthMetric(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.latestHealthMetric(),
      });
    },
  });
};

export const useMyPrescriptionsHistory = () => {
  return useQuery({
    queryKey: appointmentKeys.prescriptionsHistory(),
    queryFn: PatientService.getMyPrescriptionsHistory,
  });
};

export const useCreateAdverseEffectReport = () => {
  return useMutation({
    mutationFn: (data: AdverseEffectReportCreateRequest) =>
      AppointmentService.createAdverseEffectReport(data),
  });
};

export const useMyDocuments = () => {
  return useQuery({
    queryKey: appointmentKeys.myDocuments(),
    queryFn: AppointmentService.getMyDocuments,
  });
};

export const useDocumentsByPatientId = (
  patientId?: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...appointmentKeys.myDocuments(), patientId],
    queryFn: () => AppointmentService.getDocumentsByPatientId(patientId!),
    enabled: !!patientId && enabled,
  });
};

export const useCreateMedicalDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MedicalDocumentCreateRequest) =>
      AppointmentService.createMedicalDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.myDocuments(),
      });
    },
  });
};

export const useDeleteMedicalDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => AppointmentService.deleteMedicalDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.myDocuments(),
      });
    },
  });
};

export const useDoctorDashboardStats = () => {
  return useQuery({
    queryKey: ["doctorDashboardStats"],
    queryFn: DoctorService.getDoctorDashboardStats,
    retry: 1,
  });
};

export const useUniquePatientsCount = () => {
  return useQuery({
    queryKey: ["doctorUniquePatients"],
    queryFn: DoctorService.getUniquePatientsCount,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDoctorPatientGroups = () => {
  return useQuery({
    queryKey: ["doctorPatientGroups"],
    queryFn: DoctorService.getDoctorPatientGroups,
  });
};

export const useAdverseEffectReports = () => {
  return useQuery({
    queryKey: ["adverseEffectReports"],
    queryFn: AppointmentService.getAdverseEffectReports,
  });
};
