"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatModal from "./ChatModal";

export const OPEN_CHAT_EVENT = "alek:open-chat";

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, handler);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, handler);
  }, []);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir chat con AlekAgency AI"
          className="group fixed bottom-5 right-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-white shadow-[0_0_30px_rgba(124,58,237,0.5),0_8px_24px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:scale-110 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
        >
          <span className="chat-fab-ring" aria-hidden="true" />
          <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      )}

      <ChatModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
