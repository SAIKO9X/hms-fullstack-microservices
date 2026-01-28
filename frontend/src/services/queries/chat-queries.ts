import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatService } from "@/services";
import type { ChatMessageResponse } from "@/types/chat.types";

// QUERY KEYS
export const chatKeys = {
  all: ["chat"] as const,
  conversation: (senderId: number, recipientId: number) =>
    [...chatKeys.all, "conversation", senderId, recipientId] as const,
};

// QUERIES
export const useChatMessages = (
  senderId: number | undefined,
  recipientId: number | undefined,
) => {
  return useQuery({
    queryKey: chatKeys.conversation(senderId!, recipientId!),
    queryFn: () => ChatService.fetchChatMessages(senderId!, recipientId!),
    enabled: !!senderId && !!recipientId,
    staleTime: Infinity,
  });
};

// CACHE UTILITIES
export const useChatCacheUpdater = () => {
  const queryClient = useQueryClient();

  const addMessageToCache = (
    senderId: number,
    recipientId: number,
    newMessage: ChatMessageResponse,
  ) => {
    const key = chatKeys.conversation(senderId, recipientId);
    queryClient.setQueryData<ChatMessageResponse[]>(key, (oldMessages) => {
      if (!oldMessages) return [newMessage];
      if (oldMessages.some((m) => m.id === newMessage.id)) return oldMessages;
      return [...oldMessages, newMessage];
    });
  };

  return { addMessageToCache };
};
