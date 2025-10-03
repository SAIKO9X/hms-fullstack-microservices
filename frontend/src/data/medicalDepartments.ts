// Lista de departamentos hospitalares mais comuns
export const medicalDepartments = [
  { label: "Ambulatório", value: "ambulatorio" },
  { label: "Centro Cirúrgico", value: "centro-cirurgico" },
  { label: "Centro de Diagnóstico por Imagem", value: "diagnostico-imagem" },
  { label: "Centro Obstétrico", value: "centro-obstetrico" },
  { label: "Clínica Médica", value: "clinica-medica" },
  { label: "Emergência", value: "emergencia" },
  { label: "Hemodiálise", value: "hemodialise" },
  { label: "Laboratório", value: "laboratorio" },
  { label: "Maternidade", value: "maternidade" },
  { label: "Oncologia", value: "oncologia" },
  { label: "Pediatria", value: "pediatria" },
  { label: "Pronto Socorro", value: "pronto-socorro" },
  { label: "Psiquiatria", value: "psiquiatria" },
  { label: "Quimioterapia", value: "quimioterapia" },
  { label: "Radiologia", value: "radiologia" },
  { label: "Reabilitação", value: "reabilitacao" },
  { label: "Terapia Intensiva (UTI)", value: "uti" },
  { label: "Unidade Coronariana (UCO)", value: "uco" },
  { label: "Unidade Neonatal", value: "neonatal" },
] as const;

export type MedicalDepartment = (typeof medicalDepartments)[number]["value"];

export const findDepartmentByValue = (value: string) => {
  return medicalDepartments.find((dept) => dept.value === value);
};

export const findDepartmentByLabel = (label: string) => {
  return medicalDepartments.find(
    (dept) => dept.label.toLowerCase() === label.toLowerCase()
  );
};
