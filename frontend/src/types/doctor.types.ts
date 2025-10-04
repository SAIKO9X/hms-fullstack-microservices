export interface DoctorProfile {
  id: number;
  name: string;
  crmNumber: string;
  specialization: string;
  department: string;
  phoneNumber: string;
  yearsOfExperience: number;
  qualifications?: string;
  biography?: string;
  dateOfBirth: Date;
  profilePictureUrl?: string;
}

export interface DoctorDropdown {
  userId: number;
  name: string;
}
