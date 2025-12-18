import api from "@/config/axios";

// DTO que o media-service retorna
interface MediaFileDto {
  id: number;
  name: string;
  type: string;
  size: number;
  url: string;
}

export const uploadFile = async (file: File): Promise<MediaFileDto> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<MediaFileDto>("/media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};
