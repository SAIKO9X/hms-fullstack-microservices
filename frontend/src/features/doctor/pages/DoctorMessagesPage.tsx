import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageSquare, User } from "lucide-react";
import { ChatWindow } from "@/features/chat/components/ChatWindow";

export const DoctorMessagesPage = () => {
  const [selectedContact, setSelectedContact] = useState<{
    id: number;
    name: string;
    detail: string;
    avatar?: string;
  } | null>(null);

  // MOCK DE DADOS
  const contacts = [
    { id: 201, name: "João Silva", detail: "Paciente desde 2023", avatar: "" },
    { id: 202, name: "Maria Santos", detail: "Retorno agendado", avatar: "" },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      <Card className="w-1/3 flex flex-col h-full border-r">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Chat com Pacientes</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar paciente..." className="pl-8" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {contacts.map((contact) => (
              <Button
                key={contact.id}
                variant={
                  selectedContact?.id === contact.id ? "secondary" : "ghost"
                }
                className="justify-start px-3 py-6 h-auto"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar>
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <span className="font-semibold truncate w-full">
                      {contact.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {contact.detail}
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="flex-1 h-full overflow-hidden flex flex-col">
        {selectedContact ? (
          <ChatWindow
            recipientId={selectedContact.id}
            recipientName={selectedContact.name}
            className="h-full border-0 shadow-none"
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 bg-muted/20">
            <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">Central de Mensagens</h3>
            <p className="text-sm text-center max-w-sm mt-2">
              Selecione um paciente para iniciar o atendimento via chat.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
