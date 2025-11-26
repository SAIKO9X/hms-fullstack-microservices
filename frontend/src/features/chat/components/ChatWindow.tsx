import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { useAuth } from "@/hooks/use-auth";
import {
  useChatMessages,
  useChatCacheUpdater,
} from "@/services/queries/chat-queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, MessageSquareOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessageResponse } from "@/types/chat.types";

interface ChatWindowProps {
  recipientId: number;
  recipientName: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  recipientId,
  recipientName,
}) => {
  const { user, token } = useAuth();

  const {
    data: historyMessages,
    isLoading,
    isError,
  } = useChatMessages(user?.id, recipientId);

  const { addMessageToCache } = useChatCacheUpdater();

  // Estado local para mensagens (combina histórico + tempo real)
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  const stompClientRef = useRef<Stomp.Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyMessages) {
      setMessages(historyMessages);
    }
  }, [historyMessages]);

  useEffect(() => {
    if (!user || !token) return;
    const socket = new SockJS("http://localhost:9000/chat/ws");
    const client = Stomp.over(socket);
    client.debug = () => {};

    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        setIsConnected(true);
        client.subscribe("/user/queue/messages", (payload) => {
          const receivedMessage: ChatMessageResponse = JSON.parse(payload.body);

          // Verifica se a mensagem é desta conversa
          if (
            (receivedMessage.senderId === recipientId &&
              receivedMessage.recipientId === user.id) ||
            (receivedMessage.senderId === user.id &&
              receivedMessage.recipientId === recipientId)
          ) {
            setMessages((prev) => [...prev, receivedMessage]);
            addMessageToCache(user.id, recipientId, receivedMessage);
          }
        });
      },
      (error) => {
        console.error("Erro WebSocket:", error);
        setIsConnected(false);
      }
    );

    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current?.connected) {
        stompClientRef.current.disconnect(() => {});
      }
    };
  }, [user, token, recipientId, addMessageToCache]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !stompClientRef.current || !user) return;

    const chatRequest = {
      senderId: user.id,
      recipientId: recipientId,
      content: newMessage,
    };

    stompClientRef.current.send("/app/chat", {}, JSON.stringify(chatRequest));

    const optimisticMsg: ChatMessageResponse = {
      id: `temp-${Date.now()}`,
      chatId: "temp",
      senderId: user.id,
      recipientId: recipientId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: "SENT",
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");
  };

  return (
    <Card className="w-full h-[600px] flex flex-col shadow-lg border-t-4 border-t-primary">
      <CardHeader className="border-b py-3 bg-muted/10">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {recipientName}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-background">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {isLoading && (
              <div className="space-y-2">
                <Skeleton className="h-10 w-[60%] rounded-xl" />
                <Skeleton className="h-10 w-[40%] ml-auto rounded-xl" />
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageSquareOff className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Erro ao carregar histórico.</p>
              </div>
            )}

            {!isLoading && messages.length === 0 && (
              <p className="text-center text-xs text-muted-foreground mt-10">
                Sem mensagens anteriores. Comece a conversa!
              </p>
            )}

            {messages.map((msg, index) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div
                  key={index}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted text-foreground rounded-bl-none"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span
                      className={`text-[10px] block mt-1 text-right ${
                        isMe ? "opacity-70" : "text-muted-foreground"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-3 border-t bg-muted/5 flex gap-2 items-center">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 rounded-full"
            disabled={!isConnected}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!isConnected || !newMessage.trim()}
            size="icon"
            className="rounded-full w-10 h-10 shrink-0"
          >
            {isConnected ? (
              <Send className="w-4 h-4" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
