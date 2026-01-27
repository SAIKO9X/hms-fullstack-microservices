import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChatService } from "@/services";
import type { ChatMessageResponse } from "@/types/chat.types";

export const chatKeys = {
  all: ["chat"] as const,
  conversation: (senderId: number, recipientId: number) =>
    [...chatKeys.all, "conversation", senderId, recipientId] as const,
};

export const useChatMessages = (
  senderId: number | undefined,
  recipientId: number | undefined,
) => {
  return useQuery({
    queryKey: chatKeys.conversation(senderId!, recipientId!),
    queryFn: () => ChatService.fetchChatMessages(senderId!, recipientId!),
    // só executa se tiver os dois IDs
    enabled: !!senderId && !!recipientId,
    staleTime: Infinity,
  });
};

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
      // evita mensagens duplicadas
      if (oldMessages.some((m) => m.id === newMessage.id)) return oldMessages;
      return [...oldMessages, newMessage];
    });
  };

  return { addMessageToCache };
};
