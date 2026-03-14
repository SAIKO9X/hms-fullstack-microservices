export const UserRole = {
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
  ADMIN: "ADMIN",
} as const;

export type UserResponse = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
};

export type AuthResponse = {
  token: string;
  tokenType: string;
  user: UserResponse;
  expiresIn: number;
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
