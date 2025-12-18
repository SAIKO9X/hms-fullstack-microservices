import {
  useQuery,
  type UseQueryOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { useAppSelector } from "@/store/hooks";
import type { UserRole } from "@/types/auth.types";

// Configuração para queries baseadas em role
interface RoleBasedQueryConfig<TData> {
  /** Query key base (será combinada com o role) */
  queryKey: QueryKey;

  /** Função a ser executada para PATIENT */
  patientFn: () => Promise<TData>;

  /** Função a ser executada para DOCTOR */
  doctorFn: () => Promise<TData>;

  /** Roles permitidas (padrão: ['PATIENT', 'DOCTOR']) */
  allowedRoles?: UserRole[];

  /** Opções adicionais do React Query */
  options?: Omit<
    UseQueryOptions<TData, Error, TData, QueryKey>,
    "queryKey" | "queryFn" | "enabled"
  >;
}

// Hook genérico para queries que variam baseadas no role do usuário
export const useRoleBasedQuery = <TData>({
  queryKey,
  patientFn,
  doctorFn,
  allowedRoles = ["PATIENT", "DOCTOR"],
  options = {},
}: RoleBasedQueryConfig<TData>) => {
  const { user } = useAppSelector((state) => state.auth);

  return useQuery({
    // Combina a queryKey base com o role do usuário
    queryKey: user?.role
      ? [...(Array.isArray(queryKey) ? queryKey : [queryKey]), user.role]
      : queryKey,

    queryFn: async (): Promise<TData> => {
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      if (!allowedRoles.includes(user.role as UserRole)) {
        throw new Error(
          `Role '${
            user.role
          }' não suportada. Roles permitidas: ${allowedRoles.join(", ")}`
        );
      }

      // Executa a função apropriada baseada no role
      if (user.role === "PATIENT") {
        return await patientFn();
      } else if (user.role === "DOCTOR") {
        return await doctorFn();
      } else {
        throw new Error(`Role de usuário '${user.role}' não suportada`);
      }
    },

    // Query só executa se o usuário estiver autenticado e tiver um role permitido
    enabled: !!user && allowedRoles.includes(user.role as UserRole),

    // Merge das opções customizadas
    ...options,

    // Não tenta novamente em caso de 401/404
    retry: (failureCount: number, error: any): boolean => {
      if (error?.response?.status === 401 || error?.response?.status === 404) {
        return false;
      }

      if (typeof options.retry === "function") {
        return options.retry(failureCount, error);
      }

      if (typeof options.retry === "number") {
        return failureCount < options.retry;
      }

      if (typeof options.retry === "boolean") {
        return options.retry;
      }

      return failureCount < 2;
    },
  });
};

// Variante do hook para mutations baseadas em role
interface RoleBasedMutationConfig<TData, TVariables> {
  patientFn: (data: TVariables) => Promise<TData>;
  doctorFn: (data: TVariables) => Promise<TData>;
  allowedRoles?: UserRole[];
}

// Hook auxiliar para obter a função de mutation correta baseada no role
export const useRoleBasedMutationFn = <TData, TVariables>({
  patientFn,
  doctorFn,
  allowedRoles = ["PATIENT", "DOCTOR"],
}: RoleBasedMutationConfig<TData, TVariables>) => {
  const { user } = useAppSelector((state) => state.auth);

  return async (data: TVariables): Promise<TData> => {
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      throw new Error(
        `Role '${
          user.role
        }' não suportada. Roles permitidas: ${allowedRoles.join(", ")}`
      );
    }

    if (user.role === "PATIENT") {
      return await patientFn(data);
    } else if (user.role === "DOCTOR") {
      return await doctorFn(data);
    } else {
      throw new Error(`Role de usuário '${user.role}' não suportada`);
    }
  };
};
