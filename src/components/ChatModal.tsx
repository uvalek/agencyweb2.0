"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles, X } from "lucide-react";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";

type Role = "user" | "bot";
type Message = { id: number; role: Role; text: string };

// El bot manda las fotos en Markdown:
//   ![Foto principal](url)  -> imagen
//   [Recámara](url)         -> enlace azul
// y a veces URLs de imagen sueltas. Tokenizamos el texto para renderizar
// cada tipo. El grupo de captura hace que String.split deje los tokens
// intercalados en el array resultante.
const TOKEN_SPLIT =
  /(!\[[^\]]*\]\(https?:\/\/[^\s)]+\)|\[[^\]]*\]\(https?:\/\/[^\s)]+\)|https?:\/\/\S+?\.(?:jpe?g|png|webp|gif)(?:\?\S*)?)/gi;
const MD_IMAGE = /^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/;
const MD_LINK = /^\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)$/;
const BARE_IMG = /^https?:\/\/\S+?\.(?:jpe?g|png|webp|gif)(?:\?\S*)?$/i;

function Photo({ url, alt }: { url: string; alt: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1.5 block overflow-hidden rounded-xl border border-white/[0.08]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt || "Foto de propiedad"}
        loading="lazy"
        className="max-h-56 w-full object-cover"
      />
    </a>
  );
}

// Renderiza un mensaje: texto plano, imágenes como <img> y enlaces como
// palabra azul clickeable.
function MessageContent({ text }: { text: string }) {
  const parts = text.split(TOKEN_SPLIT);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        const token = part.trim();

        const img = token.match(MD_IMAGE);
        if (img) return <Photo key={i} url={img[2]} alt={img[1]} />;

        if (BARE_IMG.test(token))
          return <Photo key={i} url={token} alt="Foto de propiedad" />;

        const link = token.match(MD_LINK);
        if (link) {
          return (
            <a
              key={i}
              href={link[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 underline underline-offset-2 hover:text-purple-200"
            >
              {link[1] || "Ver foto"}
            </a>
          );
        }

        return (
          <span key={i} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      })}
    </>
  );
}

// URL del backend del chatbot (EasyPanel). Se puede sobreescribir con la
// variable de entorno NEXT_PUBLIC_CHATBOT_URL en Vercel.
const CHATBOT_URL =
  process.env.NEXT_PUBLIC_CHATBOT_URL ??
  "https://megachatbot-chatbotmain.aslx54.easypanel.host";

const CHAT_ID_KEY = "alek_webchat_id";

const GREETING =
  "¡Hola! 👋 Soy el asistente con IA de Luce Real Estate. Puedo ayudarte con dudas sobre propiedades, precios, disponibilidad y agendar una visita. ¿En qué te puedo ayudar?";

// Genera o recupera un id estable por visitante para mantener el hilo.
function getChatId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(CHAT_ID_KEY);
  if (!id) {
    const rand =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    id = `web-${rand}`;
    window.localStorage.setItem(CHAT_ID_KEY, id);
  }
  return id;
}

export default function ChatModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "bot", text: GREETING },
  ]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatIdRef = useRef<string>("");

  useEffect(() => {
    chatIdRef.current = getChatId();
  }, []);

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
  }, [messages, sending]);

  const sendMessage = useCallback(async () => {
    const text = value.trim();
    if (!text || sending) return;

    setValue("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text },
    ]);
    setSending(true);

    try {
      const res = await fetch(`${CHATBOT_URL}/api/webchat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatIdRef.current, text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { chunks?: string[] } = await res.json();
      const chunks = (data.chunks ?? []).filter((c) => c && c.trim());
      if (chunks.length === 0) {
        chunks.push(
          "Disculpa, no pude generar una respuesta. ¿Puedes reformular tu mensaje?"
        );
      }
      setMessages((prev) => [
        ...prev,
        ...chunks.map((c, i) => ({
          id: Date.now() + i + 1,
          role: "bot" as Role,
          text: c,
        })),
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "bot",
          text: "Hubo un problema de conexión. Intenta de nuevo en un momento.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [value, sending]);

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
          {messages.map((msg) =>
            msg.role === "bot" ? (
              <div key={msg.id} className="flex items-end gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/40 to-purple-400/10">
                  <Sparkles className="h-3.5 w-3.5 text-purple-300" />
                </div>
                <div className="flex max-w-[80%] flex-col rounded-2xl rounded-bl-md bg-[#1C1C22] px-3.5 py-2.5 text-[13px] leading-relaxed text-[#d4d4d8]">
                  <MessageContent text={msg.text} />
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-gradient-to-br from-purple-600 to-purple-500 px-3.5 py-2.5 text-[13px] leading-relaxed text-white">
                  {msg.text}
                </div>
              </div>
            )
          )}

          {sending && (
            <div className="flex items-end gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600/40 to-purple-400/10">
                <Sparkles className="h-3.5 w-3.5 text-purple-300" />
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-[#1C1C22] px-3.5 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-300/70 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-300/70 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-300/70" />
              </div>
            </div>
          )}

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
                  disabled={!value.trim() || sending}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400 text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp className="h-4.5 w-4.5" />
                </button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
          <p className="mt-2 text-center text-[10px] text-brand-muted/70">
            Asistente con IA de Luce Real Estate · puede cometer errores.
          </p>
        </div>
      </div>
    </div>
  );
}
