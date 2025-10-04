export const BloodGroup = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A-",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B-",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB-",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O-",
} as const;

export type BloodGroup = keyof typeof BloodGroup;

export const Gender = {
  MALE: "Masculino",
  FEMALE: "Feminino",
  OTHER: "Outro",
} as const;

export type Gender = keyof typeof Gender;

export interface PatientProfile {
  id: number;
  name: string;
  cpf: string;
  dateOfBirth: Date;
  phoneNumber: string;
  bloodGroup: BloodGroup;
  gender: Gender;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies?: string[];
  chronicDiseases?: string[];
  profilePictureUrl?: string;
}
