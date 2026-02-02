import api from "@/config/axios";
import type { ApiResponse } from "@/types/api.types";

interface MediaFileDto {
  id: number;
  name: string;
  type: string;
  size: number;
  url: string;
}

// FILE UPLOAD
export const uploadFile = async (file: File): Promise<MediaFileDto> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<ApiResponse<MediaFileDto>>(
    "/media/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data.data;
};
