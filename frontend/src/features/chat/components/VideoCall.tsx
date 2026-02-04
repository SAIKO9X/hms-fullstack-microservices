import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  RefreshCw,
  Info,
} from "lucide-react";
import { cn } from "@/utils/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  isInitiator: boolean;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  isOpen,
  onClose,
  recipientName,
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      startLocalVideo();
    } else {
      stopLocalVideo();
    }
    return () => stopLocalVideo();
  }, [isOpen]);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Erro ao acessar media devices:", error);
    }
  };

  const stopLocalVideo = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    setLocalStream(null);
    setIsTestMode(false);
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);
    }
  };

  const toggleTestMode = () => {
    if (!isTestMode) {
      // Pega o stream local e joga no vídeo remoto (Loopback)
      if (remoteVideoRef.current && localStream) {
        remoteVideoRef.current.srcObject = localStream;
        setIsTestMode(true);
      }
    } else {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
        setIsTestMode(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl bg-black border-gray-800 text-white p-0 overflow-hidden h-[80vh] flex flex-col">
        <DialogHeader className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
          {!isTestMode && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-zinc-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Conexão P2P Local (Sem servidor TURN configurado)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <DialogTitle className="text-sm font-normal flex items-center gap-2">
            {isTestMode ? (
              <span className="text-yellow-400 font-bold flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> MODO DE TESTE (ESPELHO)
              </span>
            ) : (
              <>Chamada com {recipientName}</>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 relative bg-zinc-900 flex items-center justify-center">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {!isTestMode && !remoteVideoRef.current?.srcObject && (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500 animate-pulse">
              Aguardando conexão...
            </div>
          )}

          <div className="absolute bottom-24 right-4 w-32 h-48 bg-zinc-800 rounded-xl overflow-hidden shadow-2xl border border-white/10 z-20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                "w-full h-full object-cover mirror-mode",
                !isCameraOn && "hidden",
              )}
            />
            {!isCameraOn && (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                <VideoOff className="w-8 h-8 text-zinc-500" />
              </div>
            )}
          </div>
        </div>

        <div className="h-20 bg-zinc-900 border-t border-white/10 flex items-center justify-center gap-4 z-30">
          <Button
            variant={isMicOn ? "secondary" : "destructive"}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={toggleMic}
          >
            {isMicOn ? <Mic /> : <MicOff />}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="rounded-full h-14 w-14 shadow-lg hover:bg-red-600"
            onClick={onClose}
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          <Button
            variant={isCameraOn ? "secondary" : "destructive"}
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={toggleCamera}
          >
            {isCameraOn ? <Video /> : <VideoOff />}
          </Button>

          {/* Botão de Teste */}
          <Button
            variant={isTestMode ? "default" : "outline"}
            size="sm"
            className="absolute right-4 rounded-full text-xs border-white/20 text-white hover:bg-white/10"
            onClick={toggleTestMode}
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            {isTestMode ? "Parar Teste" : "Testar Video"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
