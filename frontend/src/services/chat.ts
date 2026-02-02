import api from "@/config/axios";
import type { ApiResponse } from "@/types/api.types";
import type { ChatMessageResponse } from "@/types/chat.types";

// CHAT MESSAGES
export const fetchChatMessages = async (
  senderId: number,
  recipientId: number,
): Promise<ChatMessageResponse[]> => {
  const { data } = await api.get<ApiResponse<ChatMessageResponse[]>>(
    `/chat/messages/${senderId}/${recipientId}`,
  );
  return data.data;
};
