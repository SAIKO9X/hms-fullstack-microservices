export type UserRole = "PATIENT" | "DOCTOR" | "ADMIN";

// Define e exporta o tipo para o objeto User que vem na resposta
export type UserResponse = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

// Define e exporta o tipo para a resposta completa do login
export type AuthResponse = {
  token: string;
  tokenType: string;
  user: UserResponse;
  expiresIn: number;
};
