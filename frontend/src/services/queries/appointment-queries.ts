import { useAppSelector } from "@/store/hooks";
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AppointmentFormData } from "@/lib/schemas/appointment";
import type {
  AdverseEffectReportCreateRequest,
  Appointment,
} from "@/types/appointment.types";
import type {
  AppointmentRecordFormData,
  AppointmentRecordUpdateData,
} from "@/lib/schemas/record";
import type {
  PrescriptionFormData,
  PrescriptionUpdateData,
} from "@/lib/schemas/prescription";
import type { HealthMetricFormData } from "@/lib/schemas/healthMetric.schema";
import type { MedicalDocumentCreateRequest } from "@/types/document.types";
import { PatientService, DoctorService, AppointmentService } from "@/services";

// Tipo estendido com informações do médico
export interface AppointmentWithDoctor extends Appointment {
  doctorName?: string;
  doctorSpecialty?: string;
}

// Query Keys
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

// === HOOKS PARA APPOINTMENTS ===
export const useAppointments = () => {
  const { user } = useAppSelector((state) => state.auth);

  return useQuery({
    queryKey:
      user?.role === "DOCTOR"
        ? appointmentKeys.doctor()
        : appointmentKeys.patient(),
    queryFn: async (): Promise<Appointment[]> => {
      if (!user) throw new Error("Usuário não autenticado");

      if (user.role === "DOCTOR") {
        return await DoctorService.getMyAppointmentsAsDoctor();
      } else if (user.role === "PATIENT") {
        return await PatientService.getMyAppointments();
      } else {
        throw new Error("Role de usuário não suportada");
      }
    },
    enabled: !!user && (user.role === "PATIENT" || user.role === "DOCTOR"),
    staleTime: 3 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
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

  const appointmentsQuery = useQuery({
    queryKey:
      user?.role === "DOCTOR"
        ? appointmentKeys.doctor()
        : appointmentKeys.patient(),
    queryFn: async (): Promise<Appointment[]> => {
      if (!user) throw new Error("Usuário não autenticado");

      if (user.role === "DOCTOR") {
        return await DoctorService.getMyAppointmentsAsDoctor();
      } else if (user.role === "PATIENT") {
        return await PatientService.getMyAppointments();
      } else {
        throw new Error("Role de usuário não suportada");
      }
    },
    enabled: !!user && (user.role === "PATIENT" || user.role === "DOCTOR"),
    staleTime: 3 * 60 * 1000,
  });

  const doctorsQuery = useQuery({
    queryKey: appointmentKeys.doctors,
    queryFn: AppointmentService.getDoctorsForDropdown,
    staleTime: 10 * 60 * 1000,
    enabled: !!appointmentsQuery.data && user?.role === "PATIENT",
  });

  const appointmentsWithDoctorNames: AppointmentWithDoctor[] = useMemo(() => {
    if (!appointmentsQuery.data) {
      return [];
    }

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
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.patient(),
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.doctor(),
      });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => AppointmentService.cancelAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
      });
    },
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newDateTime }: { id: number; newDateTime: string }) =>
      AppointmentService.rescheduleAppointment(id, newDateTime),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
      });
    },
  });
};

export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      DoctorService.completeAppointment(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.doctor(),
      });
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

// === HOOKS PARA APPOINTMENT RECORDS ===
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
      queryClient.invalidateQueries({ queryKey: appointmentKeys.doctor() });
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
      queryClient.invalidateQueries({ queryKey: appointmentKeys.doctor() });
    },
  });
};

// === HOOKS PARA PRESCRIPTIONS ===
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
      queryClient.invalidateQueries({ queryKey: appointmentKeys.doctor() });
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
      queryClient.invalidateQueries({ queryKey: appointmentKeys.doctor() });
    },
  });
};

// === HOOKS PARA DASHBOARD DO PACIENTE ===
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

// === HOOKS PARA DOCUMENTOS MÉDICOS ===
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

// === HOOKS PARA DASHBOARD DO MÉDICO ===
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
