import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "@/hooks/hooks";
import type { AppointmentFormData } from "@/lib/schemas/appointment";
import type { Appointment, AppointmentDetail } from "@/types/appointment.types";
import {
  getMyAppointments,
  getMyAppointmentsAsDoctor,
  getAppointmentById,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
  getDoctorsForDropdown,
  getAppointmentRecordByAppointmentId,
  createAppointmentRecord,
  getPrescriptionByAppointmentId,
  createPrescription,
  updateAppointmentRecord,
  updatePrescription,
} from "@/services/appointmentService";
import api from "@/lib/interceptor/AxiosInterceptor";
import type {
  AppointmentRecordFormData,
  AppointmentRecordUpdateData,
} from "@/lib/schemas/record";
import type {
  PrescriptionFormData,
  PrescriptionUpdateData,
} from "@/lib/schemas/prescription";
import { useMemo } from "react";

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
};

// Hook original para buscar consultas baseado na role do usuário
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
        return await getMyAppointmentsAsDoctor();
      } else if (user.role === "PATIENT") {
        return await getMyAppointments();
      } else {
        throw new Error("Role de usuário não suportada");
      }
    },
    enabled: !!user && (user.role === "PATIENT" || user.role === "DOCTOR"),
    staleTime: 3 * 60 * 1000, // 3 minutos
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
};

export const useAppointmentsWithPatientDetails = () => {
  return useQuery({
    queryKey: appointmentKeys.doctor(),
    queryFn: async (): Promise<AppointmentDetail[]> => {
      const { data } = await api.get("/appointments/doctor/details");
      return data;
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
  });
};

// Hook para buscar consultas com nome do doutor
export const useAppointmentsWithDoctorNames = () => {
  const { user } = useAppSelector((state) => state.auth);

  // Buscar appointments
  const appointmentsQuery = useQuery({
    queryKey:
      user?.role === "DOCTOR"
        ? ["appointments", "doctor"]
        : ["appointments", "patient"],
    queryFn: async (): Promise<Appointment[]> => {
      if (!user) throw new Error("Usuário não autenticado");

      if (user.role === "DOCTOR") {
        return await getMyAppointmentsAsDoctor();
      } else if (user.role === "PATIENT") {
        return await getMyAppointments();
      } else {
        throw new Error("Role de usuário não suportada");
      }
    },
    enabled: !!user && (user.role === "PATIENT" || user.role === "DOCTOR"),
    staleTime: 3 * 60 * 1000,
  });

  // Buscar doctors para dropdown (para ter os nomes)
  const doctorsQuery = useQuery({
    queryKey: ["doctorsDropdown"],
    queryFn: getDoctorsForDropdown,
    staleTime: 10 * 60 * 1000,
    enabled: !!appointmentsQuery.data,
  });

  // Combinar os dados
  const appointmentsWithDoctorNames: AppointmentWithDoctor[] = useMemo(() => {
    if (!appointmentsQuery.data || !doctorsQuery.data) {
      return appointmentsQuery.data || [];
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
  }, [appointmentsQuery.data, doctorsQuery.data]);

  return {
    data: appointmentsWithDoctorNames,
    isLoading: appointmentsQuery.isLoading || doctorsQuery.isLoading,
    isError: appointmentsQuery.isError || doctorsQuery.isError,
    error: appointmentsQuery.error || doctorsQuery.error,
  };
};

// Hook para buscar uma consulta específica
export const useAppointmentById = (id: number) => {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => getAppointmentById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para criar consulta
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentData: AppointmentFormData) =>
      createAppointment(appointmentData),
    onSuccess: () => {
      // Invalida as consultas para recarregar a lista
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.patient(),
      });
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.doctor(),
      });
    },
    onError: (error) => {
      console.error("Erro ao criar consulta:", error);
    },
  });
};

// Hook para cancelar consulta
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelAppointment(id),
    onSuccess: () => {
      // Invalida as consultas para recarregar a lista
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
      });
    },
    onError: (error) => {
      console.error("Erro ao cancelar consulta:", error);
    },
  });
};

// Hook para remarcar consulta
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, newDateTime }: { id: number; newDateTime: string }) =>
      rescheduleAppointment(id, newDateTime),
    onSuccess: () => {
      // Invalida as consultas para recarregar a lista
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.all,
      });
    },
    onError: (error) => {
      console.error("Erro ao remarcar consulta:", error);
    },
  });
};

// Hook para completar consulta (médicos)
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      completeAppointment(id, notes),
    onSuccess: () => {
      // Invalida as consultas para recarregar a lista
      queryClient.invalidateQueries({
        queryKey: appointmentKeys.doctor(),
      });
    },
    onError: (error) => {
      console.error("Erro ao completar consulta:", error);
    },
  });
};

// Hook para buscar médicos para dropdown
export const useDoctorsDropdown = () => {
  return useQuery({
    queryKey: appointmentKeys.doctors,
    queryFn: getDoctorsForDropdown,
    staleTime: 10 * 60 * 1000, // 10 minutos (dados menos voláteis)
    retry: 2,
  });
};

// --- Hooks para AppointmentRecord ---
export const useAppointmentRecord = (appointmentId: number) => {
  return useQuery({
    queryKey: appointmentKeys.record(appointmentId),
    queryFn: () => getAppointmentRecordByAppointmentId(appointmentId),
    enabled: !!appointmentId,
  });
};

export const useCreateAppointmentRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AppointmentRecordFormData) =>
      createAppointmentRecord(data),
    onSuccess: (data) => {
      // Atualiza o cache do registo específico e também a lista de consultas para refletir o status
      queryClient.setQueryData(
        appointmentKeys.record(data.appointmentId),
        data
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.doctor() });
    },
  });
};

// --- Hooks para Prescription ---
export const usePrescription = (appointmentId: number) => {
  return useQuery({
    queryKey: appointmentKeys.prescription(appointmentId),
    queryFn: () => getPrescriptionByAppointmentId(appointmentId),
    enabled: !!appointmentId,
  });
};

export const useCreatePrescription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PrescriptionFormData) => createPrescription(data),
    onSuccess: (data) => {
      // Atualiza o cache com a nova prescrição
      queryClient.setQueryData(
        appointmentKeys.prescription(data.appointmentId),
        data
      );
      // Invalida a lista de consultas para atualizar qualquer status ou indicador
      queryClient.invalidateQueries({ queryKey: appointmentKeys.doctor() });
    },
  });
};

export const useUpdateAppointmentRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: number; data: AppointmentRecordUpdateData }) =>
      updateAppointmentRecord(vars),
    onSuccess: (data) => {
      // Atualiza o cache com os dados novos
      queryClient.setQueryData(
        appointmentKeys.record(data.appointmentId),
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
      updatePrescription(vars),
    onSuccess: (data) => {
      queryClient.setQueryData(
        appointmentKeys.prescription(data.appointmentId),
        data
      );
      queryClient.invalidateQueries({ queryKey: appointmentKeys.doctor() });
    },
  });
};
