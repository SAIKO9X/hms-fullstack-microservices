export const UserRole = {
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
  ADMIN: "ADMIN",
} as const;

// Define e exporta o tipo para o objeto User que vem na resposta
export type UserResponse = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
};

// Define e exporta o tipo para a resposta completa do login
export type AuthResponse = {
  token: string;
  tokenType: string;
  user: UserResponse;
  expiresIn: number;
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
