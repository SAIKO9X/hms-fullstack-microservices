import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MessageSquare, Stethoscope } from "lucide-react";
import { ChatWindow } from "@/features/chat/components/ChatWindow";
import { useMyDoctors } from "@/services/queries/patient-queries";

export const PatientMessagesPage = () => {
  const { data: doctors, isLoading } = useMyDoctors();

  const [selectedDoctor, setSelectedDoctor] = useState<{
    id: number;
    name: string;
    profilePicture?: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredDoctors =
    doctors?.filter(
      (d) =>
        d.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      <Card className="w-1/3 flex flex-col h-full border-r">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Seus Médicos</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar médico..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {isLoading && (
              <p className="p-4 text-center text-sm">Carregando...</p>
            )}

            {filteredDoctors.map((doc) => (
              <Button
                key={doc.doctorId}
                variant={
                  selectedDoctor?.id === doc.userId ? "secondary" : "ghost"
                }
                className="justify-start px-3 py-6 h-auto"
                onClick={() =>
                  setSelectedDoctor({
                    id: doc.userId,
                    name: doc.doctorName,
                    profilePicture: doc.profilePicture,
                  })
                }
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar>
                    <AvatarImage src={doc.profilePicture} />
                    <AvatarFallback>
                      <Stethoscope className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left overflow-hidden">
                    <span className="font-semibold truncate w-full">
                      {doc.doctorName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {doc.specialization}
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <div className="flex-1 h-full overflow-hidden flex flex-col rounded-xl border shadow-sm bg-card text-card-foreground">
        {selectedDoctor ? (
          <ChatWindow
            recipientId={selectedDoctor.id}
            recipientName={selectedDoctor.name}
            recipientProfilePictureUrl={selectedDoctor.profilePicture}
            className="h-full border-0 shadow-none"
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
            <h3 className="text-lg font-semibold">Selecione uma conversa</h3>
          </div>
        )}
      </div>
    </div>
  );
};
