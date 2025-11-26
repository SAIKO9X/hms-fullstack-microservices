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
}

export const ChatSheet: React.FC<ChatSheetProps> = ({
  isOpen,
  onOpenChange,
  recipientId,
  recipientName,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Chat com {recipientName}</SheetTitle>
        </SheetHeader>
        <div className="flex-1">
          <ChatWindow recipientId={recipientId} recipientName={recipientName} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
