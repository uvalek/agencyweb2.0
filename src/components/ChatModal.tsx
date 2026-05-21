"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles, X } from "lucide-react";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";

type Message = { id: number; text: string };

export default function ChatModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = value.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: Date.now(), text }]);
    setValue("");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Chat con AlekAgency AI"
    >
      {/* Backdrop */}
      <div
        className="chat-fade-in absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="chat-panel-in relative m-3 flex h-[min(560px,calc(100dvh-1.5rem))] w-[calc(100vw-1.5rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-purple-400/20 bg-[#0A0A0F] shadow-[0_0_60px_rgba(124,58,237,0.25),0_20px_60px_rgba(0,0,0,0.6)] sm:m-6">
        {/* Header */}
        <div className="flex items-center justify-end border-b border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
          <button
            onClick={onClose}
            aria-label="Cerrar chat"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-muted transition-colors hover:bg-white/[0.06] hover:text-brand-white"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5">
          <div className="flex items-end gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/40 to-purple-400/10">
              <Sparkles className="h-3.5 w-3.5 text-purple-300" />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-[#1C1C22] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#d4d4d8]">
              ¡Hola! 👋 Soy el asistente con IA de AlekAgency. Pronto podré
              responder al instante tus dudas sobre propiedades, precios y
              disponibilidad.
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/40 to-purple-400/10">
              <Sparkles className="h-3.5 w-3.5 text-purple-300" />
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-[#1C1C22] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#d4d4d8]">
              Esta es una vista previa de la interfaz. Muy pronto será un
              chatbot conversacional completamente funcional.
            </div>
          </div>

          {messages.length === 0 && (
            <div className="mt-auto flex justify-center pt-2">
              <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-purple-200">
                Próximamente · Chat con IA
              </span>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-br from-purple-600 to-purple-500 px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
                {msg.text}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.06] bg-white/[0.02] p-3">
          <PromptInput
            value={value}
            onValueChange={setValue}
            onSubmit={sendMessage}
            className="border-white/[0.08] bg-[#111114]"
          >
            <PromptInputTextarea
              placeholder="Escribe tu mensaje..."
              className="text-brand-white placeholder:text-brand-muted"
            />
            <PromptInputActions className="justify-end pt-1">
              <PromptInputAction tooltip="Enviar mensaje">
                <button
                  onClick={sendMessage}
                  aria-label="Enviar mensaje"
                  disabled={!value.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp className="h-4.5 w-4.5" />
                </button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
          <p className="mt-2 text-center text-[10px] text-brand-muted/70">
            El asistente con IA estará disponible muy pronto.
          </p>
        </div>
      </div>
    </div>
  );
}
