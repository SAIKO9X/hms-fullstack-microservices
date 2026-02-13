import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { getErrorMessage } from "@/utils/utils";
import { useCreateUser, useUpdateUser } from "@/services/queries/admin-queries";
import { UserRole } from "@/types/auth.types";
import type { PatientProfile } from "@/types/patient.types";
import type { DoctorProfile } from "@/types/doctor.types";
import {
  createErrorNotification,
  createSuccessNotification,
  type ActionNotification,
} from "@/types/notification.types";
import { FormDialog } from "@/components/shared/FormDialog";
import { CommonUserFields } from "./forms/CommonUserFields";
import { PatientFields } from "./forms/PatientFields";
import { DoctorFields } from "./forms/DoctorFields";

const formatStringOrArray = (
  value: string | string[] | undefined | null,
): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  return value || "";
};

// schema unificado
const userFormSchema = z.object({
  role: z.enum(UserRole).optional(),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres.")
    .optional(),
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.any().optional().nullable(),
  cpf: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  bloodGroup: z.string().optional(),
  gender: z.string().optional(),
  chronicDiseases: z.string().optional(),
  allergies: z.string().optional(),
  crmNumber: z.string().optional(),
  specialization: z.string().optional(),
  department: z.string().optional(),
  biography: z.string().optional(),
  qualifications: z.string().optional(),
  yearsOfExperience: z
    .union([
      z.number().min(0, { message: "Deve ser um valor positivo." }),
      z.null(),
    ])
    .optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface AddEditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user:
    | (PatientProfile & { email?: string })
    | (DoctorProfile & { email?: string })
    | null;
  userType?: "patient" | "doctor";
  setNotification: (notification: ActionNotification | null) => void;
}

export const AddEditUserDialog = ({
  open,
  onOpenChange,
  user,
  userType,
  setNotification,
}: AddEditUserDialogProps) => {
  const isEditing = !!user;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      role: undefined,
      password: "",
      name: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: null,
      cpf: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      bloodGroup: "",
      gender: "",
      chronicDiseases: "",
      allergies: "",
      crmNumber: "",
      specialization: "",
      department: "",
      biography: "",
      qualifications: "",
      yearsOfExperience: null,
    },
  });

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const selectedRole = form.watch("role");
  const effectiveUserType = isEditing
    ? userType
    : (selectedRole?.toLowerCase() as "patient" | "doctor" | undefined);

  useEffect(() => {
    if (open) {
      if (isEditing && user) {
        form.reset({
          name: user.name || "",
          email: user.email || "",
          phoneNumber: user.phoneNumber || "",
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
          cpf: (user as PatientProfile).cpf || "",
          address: (user as PatientProfile).address || "",
          emergencyContactName:
            (user as PatientProfile).emergencyContactName || "",
          emergencyContactPhone:
            (user as PatientProfile).emergencyContactPhone || "",
          bloodGroup: (user as PatientProfile).bloodGroup || "",
          gender: (user as PatientProfile).gender || "",
          chronicDiseases: formatStringOrArray(
            (user as PatientProfile).chronicDiseases,
          ),
          allergies: formatStringOrArray((user as PatientProfile).allergies),
          crmNumber: (user as DoctorProfile).crmNumber || "",
          specialization: (user as DoctorProfile).specialization || "",
          department: (user as DoctorProfile).department || "",
          biography: (user as DoctorProfile).biography || "",
          qualifications: (user as DoctorProfile).qualifications || "",
          yearsOfExperience: (user as DoctorProfile).yearsOfExperience ?? null,
        });
      } else {
        form.reset({
          role: undefined,
          password: "",
          name: "",
          email: "",
          phoneNumber: "",
          dateOfBirth: null,
          cpf: "",
          address: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          bloodGroup: "",
          gender: "",
          chronicDiseases: "",
          allergies: "",
          crmNumber: "",
          specialization: "",
          department: "",
          biography: "",
          qualifications: "",
          yearsOfExperience: null,
        });
      }
    }
  }, [user, form, open, isEditing]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (isEditing && user) {
        const formattedDateOfBirth = data.dateOfBirth
          ? format(new Date(data.dateOfBirth), "yyyy-MM-dd")
          : undefined;

        const payload = {
          userId: user.userId,
          ...data,
          dateOfBirth: formattedDateOfBirth,
          yearsOfExperience: data.yearsOfExperience ?? null,
        };

        await updateMutation.mutateAsync(payload as any);
        setNotification(
          createSuccessNotification("Utilizador atualizado com sucesso!"),
        );
      } else {
        await createMutation.mutateAsync(data as any);
        setNotification(
          createSuccessNotification("Utilizador criado com sucesso!"),
        );
      }
      onOpenChange(false);
    } catch (error) {
      const description =
        getErrorMessage(error) ?? "Ocorreu um erro inesperado.";
      setNotification(
        createErrorNotification(
          isEditing
            ? "Erro ao atualizar utilizador"
            : "Erro ao criar utilizador",
          description,
        ),
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Editar Utilizador" : "Criar Novo Utilizador"}
      description={
        isEditing
          ? `Atualize as informações do ${effectiveUserType === "patient" ? "paciente" : "médico"}.`
          : "Preencha os dados abaixo para registar um novo paciente ou médico no sistema."
      }
      form={form}
      onSubmit={onSubmit}
      isSubmitting={isPending}
      submitLabel={isEditing ? "Guardar Alterações" : "Criar Utilizador"}
      className="sm:max-w-[700px] max-h-[90vh]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Campos Comuns */}
        <CommonUserFields form={form} isEditing={isEditing} />

        {/* Campos Específicos de Paciente */}
        {effectiveUserType === "patient" && (
          <PatientFields form={form} isEditing={isEditing} />
        )}

        {/* Campos Específicos de Médico */}
        {effectiveUserType === "doctor" && (
          <DoctorFields form={form} isEditing={isEditing} />
        )}
      </div>
    </FormDialog>
  );
};
