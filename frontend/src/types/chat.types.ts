export interface ChatMessageRequest {
  senderId: number;
  recipientId: number;
  content: string;
}

export interface ChatMessageResponse {
  id: string;
  chatId: string;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string; // O backend envia Date, aqui recebe como string ISO
  status: "SENT" | "DELIVERED" | "READ";
}
