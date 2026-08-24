import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import logoMark from "../../assets/logo-mark.png";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SALUDO: ChatMessage = {
  role: "assistant",
  content:
    "¡Hola! 👋 Soy el asistente virtual de Gerencia Contable & Tributaria. Puedo orientarte con preguntas generales sobre impuestos y contabilidad en Colombia (IVA, régimen simple, retención en la fuente, nómina...). ¿En qué te puedo ayudar?",
};

const MAX_HISTORY_SENT = 16;

// In local dev the API lives on the same origin (Vite's dev middleware).
// In production the site (HostCarriel) and the AI backend (Railway) are on
// different domains — set VITE_CHAT_API_URL at build time to the deployed
// backend's full URL, e.g. https://gct-api.up.railway.app/api/chat.
const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL || "/api/chat";

export function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<ChatMessage[]>([SALUDO]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [mensajes, cargando, abierto]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const texto = input.trim();
    if (!texto || cargando) return;

    const historial = [...mensajes, { role: "user", content: texto } as ChatMessage];
    setMensajes(historial);
    setInput("");
    setError(null);
    setCargando(true);

    try {
      const res = await fetch(CHAT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historial.slice(-MAX_HISTORY_SENT) }),
      });

      const data = (await res.json().catch(() => null)) as { reply?: string; error?: string } | null;

      if (!res.ok || !data?.reply) {
        setError(data?.error ?? "No pude conectarme con el asistente. Intenta de nuevo en un momento.");
        return;
      }

      setMensajes((prev) => [...prev, { role: "assistant", content: data.reply as string }]);
    } catch {
      setError("No pude conectarme con el asistente. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      {abierto && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[32rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-ash-light/20 bg-white shadow-2xl shadow-black/20">
          <div className="flex items-center gap-2.5 bg-ink px-4 py-3.5">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-magenta/25 blur-md" aria-hidden />
              <img src={logoMark} alt="" className="relative h-8 w-8 object-contain" />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-white">Asesor virtual</p>
              <p className="flex items-center gap-1 text-[11px] text-paper/50">
                <Sparkles size={10} className="text-magenta-soft" /> Impulsado por IA
              </p>
            </div>
            <button
              onClick={() => setAbierto(false)}
              className="shrink-0 rounded-md p-1.5 text-paper/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Cerrar chat"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-paper-dim px-4 py-4">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-gradient-to-br from-magenta to-magenta-deep text-white"
                      : "rounded-bl-sm border border-ash-light/25 bg-white text-ink"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {cargando && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-xl rounded-bl-sm border border-ash-light/25 bg-white px-3.5 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-magenta/60 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-magenta/60 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-magenta/60" />
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-folio-red/30 bg-folio-red/10 px-3 py-2 text-xs text-folio-red">
                {error}
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-ash-light/20 bg-white p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              maxLength={800}
              disabled={cargando}
              className="min-w-0 flex-1 rounded-lg border border-ash-light/40 bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-magenta disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={cargando || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-magenta to-magenta-deep text-white transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              aria-label="Enviar"
            >
              <Send size={15} />
            </button>
          </form>
          <p className="border-t border-ash-light/10 bg-paper-dim px-4 py-2 text-center text-[10px] leading-snug text-ash">
            Información general, no reemplaza una asesoría personalizada.
          </p>
        </div>
      )}

      <button
        onClick={() => setAbierto((v) => !v)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-magenta to-magenta-deep text-white shadow-lg shadow-magenta/30 transition-transform hover:scale-105"
        aria-label={abierto ? "Cerrar asistente" : "Abrir asistente virtual"}
      >
        {abierto ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </>
  );
}
