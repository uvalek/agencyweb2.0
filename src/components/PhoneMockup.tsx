export default function PhoneMockup() {
  return (
    <div className="phone-mockup">
      <div className="phone-screen">
        <p className="text-[10px] text-[#8B8B9E] text-center mb-4 tracking-wide uppercase">
          AlekAgency AI &middot; Activo 24/7
        </p>
        <div className="flex flex-col flex-1">
          <div className="chat-bubble chat-guest">
            Hola, no encuentro la contraseña del WiFi
          </div>
          <div className="chat-bubble chat-ai">
            Hola Maria! La red es &quot;Casa Azul 5G&quot; y la contraseña es:
            Sol&amp;Luna2024. Te envío también las reglas de la casa?
          </div>
          <div className="chat-bubble chat-guest">
            Sí porfa, y cómo llego desde el aeropuerto?
          </div>
          <div className="chat-bubble chat-ai">
            Claro! Aquí tienes las indicaciones desde el aeropuerto. El trayecto
            es de ~25 min. Te recomiendo Uber, cuesta aprox $180 MXN.
          </div>
          <div className="chat-bubble chat-guest">
            Genial, gracias!! Súper rápido
          </div>
        </div>
        <div className="mt-auto pt-3 border-t border-white/[0.06] flex items-center gap-2">
          <div className="flex-1 bg-white/[0.04] rounded-full px-3 py-2 text-[11px] text-[#8B8B9E]">
            Escribe un mensaje...
          </div>
          <div className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
