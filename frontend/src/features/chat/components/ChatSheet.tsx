import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChatWindow } from "./ChatWindow";

interface ChatSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: number;
  recipientName: string;
  recipientProfilePictureUrl?: string;
}

export const ChatSheet: React.FC<ChatSheetProps> = ({
  isOpen,
  onOpenChange,
  recipientId,
  recipientName,
  recipientProfilePictureUrl,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0"
      >
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatWindow
            recipientId={recipientId}
            recipientName={recipientName}
            recipientProfilePictureUrl={recipientProfilePictureUrl}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
