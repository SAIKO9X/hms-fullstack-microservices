// Lista de especializações médicas mais comuns
export const medicalSpecializations = [
  { label: "Anestesiologia", value: "anestesiologia" },
  { label: "Cardiologia", value: "cardiologia" },
  { label: "Cirurgia Geral", value: "cirurgia-geral" },
  { label: "Cirurgia Cardiovascular", value: "cirurgia-cardiovascular" },
  { label: "Cirurgia Plástica", value: "cirurgia-plastica" },
  { label: "Clínica Médica", value: "clinica-medica" },
  { label: "Dermatologia", value: "dermatologia" },
  { label: "Endocrinologia", value: "endocrinologia" },
  { label: "Gastroenterologia", value: "gastroenterologia" },
  { label: "Ginecologia e Obstetrícia", value: "ginecologia-obstetricia" },
  { label: "Hematologia", value: "hematologia" },
  { label: "Infectologia", value: "infectologia" },
  { label: "Medicina de Emergência", value: "medicina-emergencia" },
  { label: "Medicina de Família", value: "medicina-familia" },
  { label: "Medicina do Trabalho", value: "medicina-trabalho" },
  { label: "Medicina Intensiva", value: "medicina-intensiva" },
  { label: "Nefrologia", value: "nefrologia" },
  { label: "Neurologia", value: "neurologia" },
  { label: "Neurocirurgia", value: "neurocirurgia" },
  { label: "Oftalmologia", value: "oftalmologia" },
  { label: "Oncologia", value: "oncologia" },
  { label: "Ortopedia", value: "ortopedia" },
  { label: "Otorrinolaringologia", value: "otorrinolaringologia" },
  { label: "Patologia", value: "patologia" },
  { label: "Pediatria", value: "pediatria" },
  { label: "Pneumologia", value: "pneumologia" },
  { label: "Psiquiatria", value: "psiquiatria" },
  { label: "Radiologia", value: "radiologia" },
  { label: "Reumatologia", value: "reumatologia" },
  { label: "Urologia", value: "urologia" },
] as const;

// Tipo para TypeScript
export type MedicalSpecialization =
  (typeof medicalSpecializations)[number]["value"];

// Função helper para encontrar uma especialização por value
export const findSpecializationByValue = (value: string) => {
  return medicalSpecializations.find((spec) => spec.value === value);
};

// Função helper para encontrar uma especialização por label
export const findSpecializationByLabel = (label: string) => {
  return medicalSpecializations.find(
    (spec) => spec.label.toLowerCase() === label.toLowerCase()
  );
};
