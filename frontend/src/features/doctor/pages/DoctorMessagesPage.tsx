import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useDoctorPatients } from "@/services/queries/doctor-queries";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MessageSquare,
  User,
  PanelRightClose,
  PanelRightOpen,
  Activity,
} from "lucide-react";
import { ChatWindow } from "@/features/chat/components/ChatWindow";
import { MedicalHistoryTimeline } from "@/features/patient/components/MedicalHistoryTimeline";
import { DocumentsCard } from "@/features/patient/components/DocumentsCard";

export const DoctorMessagesPage = () => {
  const { user } = useAuth();

  const { data: patients, isLoading } = useDoctorPatients(user?.id);

  const [selectedContact, setSelectedContact] = useState<{
    id: number;
    patientId: number;
    name: string;
    profilePicture?: string;
  } | null>(null);

  const [showContextPanel, setShowContextPanel] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients =
    patients?.filter((p) =>
      p.patientName.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || [];

  return (
    <div className="h-[calc(100vh-8rem)] flex border rounded-lg overflow-hidden bg-background">
      <div className="w-80 flex flex-col border-r bg-muted/10">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Meus Pacientes</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filtrar..."
              className="pl-8 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {isLoading && (
              <p className="p-4 text-xs text-center text-muted-foreground">
                Carregando...
              </p>
            )}

            {filteredPatients.map((patient) => (
              <Button
                key={patient.patientId}
                variant={
                  selectedContact?.id === patient.patientId
                    ? "secondary"
                    : "ghost"
                }
                className="justify-start px-3 py-6 h-auto"
                onClick={() =>
                  setSelectedContact({
                    id: patient.userId,
                    patientId: patient.patientId,
                    name: patient.patientName,
                    profilePicture: patient.profilePicture,
                  })
                }
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar>
                    <AvatarImage src={patient.profilePicture} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left overflow-hidden w-full">
                    <span className="font-semibold truncate w-full">
                      {patient.patientName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {patient.totalAppointments} consultas
                    </span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        {selectedContact ? (
          <>
            <div className="absolute top-2 right-4 z-10">
              <Button
                variant="outline"
                size="icon"
                title={
                  showContextPanel ? "Ocultar Prontuário" : "Ver Prontuário"
                }
                onClick={() => setShowContextPanel(!showContextPanel)}
                className="bg-background/80 backdrop-blur"
              >
                {showContextPanel ? (
                  <PanelRightClose className="h-4 w-4" />
                ) : (
                  <PanelRightOpen className="h-4 w-4" />
                )}
              </Button>
            </div>

            <ChatWindow
              recipientId={selectedContact.id}
              recipientName={selectedContact.name}
              recipientProfilePictureUrl={selectedContact.profilePicture}
              className="h-full border-0"
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
            <MessageSquare className="h-16 w-16 mb-4 opacity-10" />
            <p>Selecione um paciente para iniciar.</p>
          </div>
        )}
      </div>

      {selectedContact && showContextPanel && (
        <div className="w-[400px] border-l bg-background flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-3 border-b bg-muted/5 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-sm">Prontuário Rápido</h3>
          </div>

          <ScrollArea className="flex-1 p-4">
            <Tabs defaultValue="history">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="history" className="flex-1">
                  Histórico
                </TabsTrigger>
                <TabsTrigger value="exams" className="flex-1">
                  Exames
                </TabsTrigger>
              </TabsList>

              <TabsContent value="history">
                <MedicalHistoryTimeline
                  patientId={selectedContact.patientId}
                  compactMode={true}
                />
              </TabsContent>

              <TabsContent value="exams">
                <DocumentsCard patientId={selectedContact.patientId} />
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
