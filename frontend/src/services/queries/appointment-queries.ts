import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import { useRoleBasedQuery } from "../../hooks/use-role-based";
import { PatientService, DoctorService, AppointmentService } from "@/services";
import type {
  AdverseEffectReportCreateRequest,
  Appointment,
  DoctorUnavailabilityRequest,
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
import type { LabOrderFormData } from "@/lib/schemas/labOrder.schema";
import type { Page } from "@/types/pagination.types";
import type { PatientSummary } from "@/types/doctor.types";
import { getAvailableSlots } from "../appointment";

export interface AppointmentWithDoctor extends Appointment {
  doctorName?: string;
  doctorSpecialty?: string;
}

// === QUERY KEYS ===
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
  prescriptionsHistory: (page?: number, size?: number) =>
    [
      ...appointmentKeys.all,
      "patient",
      "prescriptionsHistory",
      { page, size },
    ] as const,
  myDocuments: (page?: number, size?: number) =>
    ["documents", "patient", { page, size }] as const,
  adverseEffectReports: (page?: number, size?: number) =>
    ["adverseEffectReports", { page, size }] as const,
  doctorDetails: (dateFilter?: string) =>
    [...appointmentKeys.doctor(), "details", dateFilter || "all"] as const,
  labOrders: (appointmentId: number) =>
    [...appointmentKeys.all, "lab-orders", appointmentId] as const,
  unavailability: (doctorId: number) =>
    [...appointmentKeys.all, "unavailability", doctorId] as const,
  doctorDashboardStats: ["doctorDashboardStats"] as const,
  doctorUniquePatients: ["doctorUniquePatients"] as const,
  doctorPatientGroups: ["doctorPatientGroups"] as const,
  doctorPatients: ["doctor-patients"] as const,
  history: (patientId: number) =>
    [...appointmentKeys.all, "history", patientId] as const,
  availableSlots: (doctorId: number, date: string, duration: number) =>
    [
      ...appointmentKeys.all,
      "available-slots",
      doctorId,
      date,
      duration,
    ] as const,
};

// === APPOINTMENTS QUERIES ===
export const useAppointments = (page = 0, size = 10) => {
  return useRoleBasedQuery<Page<Appointment>>({
    queryKey: [...appointmentKeys.all, { page, size }],
    patientFn: () => PatientService.getMyAppointments(page, size),
    doctorFn: () => DoctorService.getMyAppointmentsAsDoctor(page, size),
    options: {
      staleTime: 3 * 60 * 1000,
      placeholderData: keepPreviousData,
    },
  });
};

export const useAppointmentById = (id: number) => {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => AppointmentService.getAppointmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useAppointmentsWithDoctorNames = (page = 0, size = 10) => {
  const { user } = useAppSelector((state) => state.auth);
  const appointmentsQuery = useAppointments(page, size);

  const doctorsQuery = useQuery({
    queryKey: appointmentKeys.doctors,
    queryFn: AppointmentService.getDoctorsForDropdown,
    staleTime: 10 * 60 * 1000,
    enabled: !!appointmentsQuery.data && user?.role === "PATIENT",
  });

  const appointmentsWithDoctorNames: AppointmentWithDoctor[] = useMemo(() => {
    if (!appointmentsQuery.data) return [];

    const appointmentsList = appointmentsQuery.data.content;

    if (user?.role === "DOCTOR" || !doctorsQuery.data) {
      return appointmentsList;
    }

    return appointmentsList.map((appointment) => {
      const doctor = doctorsQuery.data.find(
        (doc) => doc.id === appointment.doctorId,
      );
      return {
        ...appointment,
        doctorName: doctor?.name || `Doutor ID: ${appointment.doctorId}`,
      };
    });
  }, [appointmentsQuery.data, doctorsQuery.data, user?.role]);

  return {
    data: appointmentsWithDoctorNames,
    totalPages: appointmentsQuery.data?.totalPages,
    totalElements: appointmentsQuery.data?.totalElements,
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

export const useNextAppointment = () => {
  return useQuery({
    queryKey: appointmentKeys.next(),
    queryFn: PatientService.getNextAppointment,
  });
};

export const useAppointmentStats = () => {
  return useQuery({
    queryKey: appointmentKeys.stats(),
    queryFn: PatientService.getAppointmentStats,
  });
};

export const useDoctorAppointmentDetails = (
  dateFilter?: "today" | "week" | "month",
) => {
  return useQuery({
    queryKey: appointmentKeys.doctorDetails(dateFilter),
    queryFn: () => DoctorService.getDoctorAppointmentDetails(dateFilter),
    staleTime: 1 * 60 * 1000,
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

// === APPOINTMENT RECORDS ===
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
        data,
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
        data,
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

// === PRESCRIPTIONS ===

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
        data,
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

export const useAppointmentsByPatientId = (patientId: number) => {
  return useQuery({
    queryKey: appointmentKeys.history(patientId),
    queryFn: () => AppointmentService.getAppointmentsByPatientId(patientId),
    enabled: !!patientId, // só executa se tiver um ID
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
        data,
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
};

export const useLatestPrescription = () => {
  return useQuery({
    queryKey: appointmentKeys.latestPrescription(),
    queryFn: PatientService.getLatestPrescription,
  });
};

export const useMyPrescriptionsHistory = (page = 0, size = 10) => {
  return useQuery({
    queryKey: appointmentKeys.prescriptionsHistory(page, size),
    queryFn: () => PatientService.getMyPrescriptionsHistory(page, size),
    placeholderData: keepPreviousData,
  });
};

// === HEALTH METRICS ===
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

// === ADVERSE EFFECTS ===
export const useCreateAdverseEffectReport = () => {
  return useMutation({
    mutationFn: (data: AdverseEffectReportCreateRequest) =>
      AppointmentService.createAdverseEffectReport(data),
  });
};

export const useAdverseEffectReports = (page = 0, size = 10) => {
  return useQuery({
    queryKey: appointmentKeys.adverseEffectReports(page, size),
    queryFn: () => AppointmentService.getAdverseEffectReports(page, size),
    placeholderData: keepPreviousData,
  });
};

// === MEDICAL DOCUMENTS ===
export const useMyDocuments = (page = 0, size = 10) => {
  return useQuery({
    queryKey: appointmentKeys.myDocuments(page, size),
    queryFn: () => AppointmentService.getMyDocuments(page, size),
    placeholderData: keepPreviousData,
  });
};

export const useDocumentsByPatientId = (
  patientId?: number,
  page = 0,
  size = 10,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: [...appointmentKeys.myDocuments(page, size), patientId],
    queryFn: () =>
      AppointmentService.getDocumentsByPatientId(patientId!, page, size),
    enabled: !!patientId && enabled,
    placeholderData: keepPreviousData,
  });
};

export const useCreateMedicalDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MedicalDocumentCreateRequest) =>
      AppointmentService.createMedicalDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", "patient"] });
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

// === LAB ORDERS ===
export const useLabOrders = (appointmentId: number) => {
  return useQuery({
    queryKey: appointmentKeys.labOrders(appointmentId),
    queryFn: () => AppointmentService.getLabOrdersByAppointment(appointmentId),
    enabled: !!appointmentId,
  });
};

export const useCreateLabOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LabOrderFormData) =>
      AppointmentService.createLabOrder(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.labOrders(variables.appointmentId),
      });
    },
  });
};

// === DOCTOR UNAVAILABILITY ===
export const useGetDoctorUnavailability = (doctorId: number) => {
  return useQuery({
    queryKey: appointmentKeys.unavailability(doctorId),
    queryFn: () => AppointmentService.getDoctorUnavailability(doctorId),
    enabled: !!doctorId,
  });
};

export const useCreateDoctorUnavailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DoctorUnavailabilityRequest) =>
      AppointmentService.createUnavailability(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.unavailability(variables.doctorId),
      });
    },
  });
};

export const useDeleteDoctorUnavailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AppointmentService.deleteUnavailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["appointments", "unavailability"],
      });
    },
  });
};

export const useGetDoctorAvailability = (doctorId: number) => {
  return useQuery({
    queryKey: [...appointmentKeys.all, "availability", doctorId],
    queryFn: () => AppointmentService.getDoctorAvailability(doctorId),
    enabled: !!doctorId,
  });
};

export const useAvailableSlots = (
  doctorId?: number,
  date?: string,
  duration?: number,
) => {
  return useQuery({
    queryKey: appointmentKeys.availableSlots(doctorId!, date!, duration!),
    queryFn: () => getAvailableSlots(doctorId!, date!, duration!),
    enabled: !!doctorId && !!date && !!duration,
    staleTime: 1 * 60 * 1000,
  });
};

// === DOCTOR DASHBOARD ===
export const useDoctorDashboardStats = () => {
  return useQuery({
    queryKey: appointmentKeys.doctorDashboardStats,
    queryFn: DoctorService.getDoctorDashboardStats,
    retry: 1,
  });
};

export const useUniquePatientsCount = () => {
  return useQuery({
    queryKey: appointmentKeys.doctorUniquePatients,
    queryFn: DoctorService.getUniquePatientsCount,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDoctorPatientGroups = () => {
  return useQuery({
    queryKey: appointmentKeys.doctorPatientGroups,
    queryFn: DoctorService.getDoctorPatientGroups,
  });
};

export const useDoctorPatients = () => {
  return useQuery<PatientSummary[]>({
    queryKey: appointmentKeys.doctorPatients,
    queryFn: AppointmentService.getDoctorPatients,
  });
};

// === APPOINTMENT MUTATIONS ===
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
