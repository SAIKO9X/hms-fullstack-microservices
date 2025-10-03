export interface DoctorProfile {
  crmNumber: string;
  specialization: string;
  department: string;
  phoneNumber: string;
  yearsOfExperience: number;
  qualifications?: string;
  biography?: string;
  dateOfBirth: Date;
}

export interface DoctorDropdown {
  userId: number;
  name: string;
}
