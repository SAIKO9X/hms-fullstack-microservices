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
import { Card, CardContent } from "@/components/ui/card";
import {
  Send,
  Loader2,
  MessageSquareOff,
  CheckCheck,
  Check,
  Video,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatMessageResponse } from "@/types/chat.types";
import { cn } from "@/utils/utils";
import { VideoCall } from "./VideoCall";

interface ChatWindowProps {
  recipientId: number;
  recipientName: string;
  recipientProfilePictureUrl?: string;
  className?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  recipientId,
  recipientName,
  recipientProfilePictureUrl,
  className,
}) => {
  const { user, token } = useAuth();
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

  const {
    data: historyMessages,
    isLoading,
    isError,
  } = useChatMessages(user?.id, recipientId);

  const { addMessageToCache } = useChatCacheUpdater();
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const stompClientRef = useRef<Stomp.Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyMessages) {
      setMessages(historyMessages);
    }
  }, [historyMessages]);

  useEffect(() => {
    if (!user || !token) return;

    const socket = new SockJS(`${API_BASE_URL}/chat/ws`);
    const client = Stomp.over(socket);

    client.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        setIsConnected(true);
        client.subscribe("/user/queue/messages", (payload) => {
          const receivedMessage: ChatMessageResponse = JSON.parse(payload.body);

          if (
            (receivedMessage.senderId === recipientId &&
              receivedMessage.recipientId === user.id) ||
            (receivedMessage.senderId === user.id &&
              receivedMessage.recipientId === recipientId)
          ) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === receivedMessage.id)) {
                return prev;
              }

              let updatedList = prev;
              if (receivedMessage.senderId === user.id) {
                updatedList = prev.filter(
                  (m) =>
                    !(
                      m.id.toString().startsWith("temp-") &&
                      m.content === receivedMessage.content
                    ),
                );
              }
              const newList = [...updatedList, receivedMessage];
              addMessageToCache(user.id, recipientId, receivedMessage);
              return newList;
            });
          }
        });
      },
      (error) => {
        console.error("❌ Erro WebSocket:", error);
        setIsConnected(false);
      },
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
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !stompClientRef.current || !user) return;

    const chatRequest = {
      senderId: user.id,
      recipientId: recipientId,
      content: newMessage,
    };

    stompClientRef.current.send(
      "/app/chat.sendMessage",
      {},
      JSON.stringify(chatRequest),
    );

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Ontem";
    } else {
      return date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
      });
    }
  };

  return (
    <>
      <Card
        className={cn(
          "w-full h-full flex flex-col border-0 shadow-none rounded-none p-0 gap-0 bg-gradient-to-b from-background to-muted/20",
          className,
        )}
      >
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={cn(
                  "absolute -right-0.5 -bottom-0.5 w-3 h-3 rounded-full border-2 border-background z-10",
                  isConnected ? "bg-green-500" : "bg-gray-400",
                )}
              />
              <Avatar className="h-9 w-9 border border-border/50">
                <AvatarImage
                  src={
                    recipientProfilePictureUrl
                      ? `${API_BASE_URL}${recipientProfilePictureUrl}`
                      : undefined
                  }
                  alt={recipientName}
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-xs">
                  {getInitials(recipientName)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none tracking-tight">
                {recipientName}
              </span>
              <span className="text-[11px] text-muted-foreground mt-1 font-medium">
                {isConnected ? (
                  isTyping ? (
                    <span className="text-primary animate-pulse">
                      digitando...
                    </span>
                  ) : (
                    "Online"
                  )
                ) : (
                  "Offline"
                )}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => setIsVideoCallOpen(true)}
            disabled={!isConnected}
            title="Iniciar Videochamada"
          >
            <Video className="w-5 h-5" />
          </Button>
        </div>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {isLoading && (
                <div className="space-y-4">
                  <div className="flex items-end gap-2">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <Skeleton className="h-16 w-[65%] rounded-2xl rounded-bl-sm" />
                  </div>
                  <div className="flex items-end gap-2 justify-end">
                    <Skeleton className="h-14 w-[50%] rounded-2xl rounded-br-sm" />
                  </div>
                </div>
              )}

              {isError && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
                  <div className="rounded-full bg-destructive/10 p-4 mb-3">
                    <MessageSquareOff className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-sm font-medium">
                    Erro ao carregar mensagens
                  </p>
                </div>
              )}

              {!isLoading && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
                  <div className="rounded-full bg-primary/10 p-4 mb-3">
                    <Send className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Nenhuma mensagem ainda</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Comece a conversa!
                  </p>
                </div>
              )}

              {messages.map((msg, index) => {
                const isMe = msg.senderId === user?.id;
                const prevMsg = messages[index - 1];
                const nextMsg = messages[index + 1];
                const isFirstInGroup =
                  !prevMsg || prevMsg.senderId !== msg.senderId;
                const isLastInGroup =
                  !nextMsg || nextMsg.senderId !== msg.senderId;
                const showAvatar = !isMe && isLastInGroup;
                const showTimestamp = isLastInGroup;
                const isTemp = msg.id.toString().startsWith("temp-");

                return (
                  <div
                    key={msg.id || index}
                    className={cn(
                      "flex gap-2 items-end",
                      isMe ? "justify-end" : "justify-start",
                      !isFirstInGroup && "mt-1",
                    )}
                  >
                    {!isMe && (
                      <Avatar
                        className={cn(
                          "h-6 w-6 shrink-0 mb-1",
                          !showAvatar && "opacity-0",
                        )}
                      >
                        <AvatarImage
                          src={
                            recipientProfilePictureUrl
                              ? `${API_BASE_URL}${recipientProfilePictureUrl}`
                              : undefined
                          }
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-[9px]">
                          {getInitials(recipientName)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn(
                        "flex flex-col gap-1 max-w-[75%]",
                        isMe ? "items-end" : "items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "px-4 py-2 shadow-sm transition-all",
                          "relative group",
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground border border-border/40",
                          isMe
                            ? cn(
                                "rounded-2xl",
                                isFirstInGroup && "rounded-tr-md",
                                isLastInGroup && "rounded-br-md",
                              )
                            : cn(
                                "rounded-2xl",
                                isFirstInGroup && "rounded-tl-md",
                                isLastInGroup && "rounded-bl-md",
                              ),
                          isTemp && "opacity-70",
                        )}
                      >
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>

                      {showTimestamp && (
                        <div
                          className={cn(
                            "flex items-center gap-1 px-1",
                            isMe ? "flex-row-reverse" : "flex-row",
                          )}
                        >
                          <span className="text-[10px] text-muted-foreground/60 select-none">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                          {isMe && (
                            <div className="text-muted-foreground/60">
                              {isTemp ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : msg.status === "READ" ? (
                                <CheckCheck className="w-3 h-3 text-primary" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-xl shrink-0">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Escreva uma mensagem..."
                  className={cn(
                    "min-h-[44px] rounded-3xl pr-4 pl-5 py-3",
                    "bg-muted/50 border-transparent hover:border-border/50",
                    "focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/50",
                    "transition-all duration-200",
                    "resize-none shadow-sm",
                    !isConnected && "opacity-50 cursor-not-allowed",
                  )}
                  disabled={!isConnected}
                  autoComplete="off"
                />
              </div>

              <Button
                onClick={handleSendMessage}
                disabled={!isConnected || !newMessage.trim()}
                size="icon"
                className={cn(
                  "rounded-full h-11 w-11 shrink-0 shadow-md",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "transition-all duration-300",
                  "hover:scale-105 active:scale-95",
                  newMessage.trim()
                    ? "opacity-100 scale-100"
                    : "opacity-80 scale-95",
                )}
              >
                {isConnected ? (
                  <Send className="w-4 h-4 ml-0.5" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <VideoCall
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        recipientName={recipientName}
        isInitiator={true}
      />
    </>
  );
};
