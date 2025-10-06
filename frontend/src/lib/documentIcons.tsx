import {
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFileExcel,
  FaFileArchive,
  FaFileAlt,
} from "react-icons/fa";

// Interface para retornar ícone e cor
interface DocumentIconConfig {
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

export const getDocumentIcon = (fileName: string): DocumentIconConfig => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "pdf":
      return {
        icon: FaFilePdf,
        colorClass: "text-red-600 dark:text-red-400",
      };

    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
    case "svg":
      return {
        icon: FaFileImage,
        colorClass: "text-blue-600 dark:text-blue-400",
      };

    case "doc":
    case "docx":
      return {
        icon: FaFileWord,
        colorClass: "text-blue-700 dark:text-blue-500",
      };

    case "xls":
    case "xlsx":
    case "csv":
      return {
        icon: FaFileExcel,
        colorClass: "text-green-600 dark:text-green-400",
      };

    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return {
        icon: FaFileArchive,
        colorClass: "text-purple-600 dark:text-purple-400",
      };

    default:
      return {
        icon: FaFileAlt,
        colorClass: "text-gray-600 dark:text-gray-400",
      };
  }
};
