import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
        <SheetHeader className="sr-only">
          <SheetTitle>Chat com {recipientName}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatWindow
            recipientId={recipientId}
            recipientName={recipientName}
            recipientProfilePictureUrl={recipientProfilePictureUrl}
            className="h-full border-none"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
