import Image from "next/image";
import Navbar from "@/components/Navbar";
import VideoPlayer from "@/components/VideoPlayer";
import RevealEffects from "@/components/RevealEffects";
import ChatLauncher from "@/components/ChatLauncher";
import OpenChatButton from "@/components/OpenChatButton";

const CAL_LINK = "https://cal.com/alek-nava-i4gvq6/30min?overlayCalendar=true";

export default function Home() {
  return (
    <>
      <RevealEffects />
      <ChatLauncher />
      <Navbar />

      <main className="relative z-10" style={{ overflowX: "clip" }}>
        {/* ===== HERO ===== */}
        <section className="hero-section relative w-full">
          <div className="hero-bg" aria-hidden="true">
            <div className="hero-blob hero-blob-1" />
            <div className="hero-blob hero-blob-2" />
            <div className="hero-blob hero-blob-3" />
            <div className="hero-streak" />
            <div className="hero-streak-2" />
            <div className="hero-center-glow" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center pt-28 pb-4 sm:pt-40 sm:pb-16 px-4 sm:px-6">
            <div className="hidden sm:flex gap-3 mb-8 hero-fade-in-down justify-center flex-wrap">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-md border border-purple-400/20 rounded-full px-5 py-2.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs font-medium tracking-wide text-purple-200 uppercase">
                  IA para Property Managers
                </span>
              </div>
              <div className="inline-flex items-center gap-2 bg-purple-500/10 backdrop-blur-md border border-purple-400/20 rounded-full px-5 py-2.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs font-medium tracking-wide text-purple-200 uppercase">
                  IA para Sector Inmobiliario
                </span>
              </div>
            </div>

            <div className="text-center space-y-5 sm:space-y-6 max-w-5xl mx-auto">
              <h1 className="font-heading text-[1.75rem] sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight hero-fade-in-up hero-delay-200 hero-text-shadow">
                <span className="text-brand-white">
                  Respuestas en Segundos a tus Clientes, a
                </span>
                <span className="gradient-text-glow block mt-1 sm:mt-2">
                  {" "}
                  Cualquier Hora del Día.
                </span>
              </h1>

              <div className="max-w-3xl mx-auto hero-fade-in-up hero-delay-400">
                <p className="text-sm sm:text-xl text-purple-100 leading-snug sm:leading-relaxed hero-text-shadow">
                  Atiende prospectos, gestiona propiedades y cierra más operaciones
                  con un sistema de IA que trabaja por ti{" "}
                  <strong className="text-brand-white">las 24 horas.</strong>
                </p>
              </div>

              <div className="sm:hidden flex justify-center gap-2 flex-wrap hero-fade-in-up hero-delay-500">
                <div className="inline-flex items-center gap-1.5 bg-purple-500/10 backdrop-blur-md border border-purple-400/20 rounded-full px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-[10px] font-medium tracking-wide text-purple-200 uppercase">
                    IA para Property Managers
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-purple-500/10 backdrop-blur-md border border-purple-400/20 rounded-full px-3 py-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-[10px] font-medium tracking-wide text-purple-200 uppercase">
                    IA para Sector Inmobiliario
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-1 sm:pt-4 hero-fade-in-up hero-delay-600">
                <a
                  href={CAL_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shiny-cta"
                >
                  <span>Agenda Tu Demo Gratis</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>

              <p className="hidden sm:block text-sm text-brand-muted hero-fade-in-up hero-delay-800">
                15 min que pueden transformar tu operación inmobiliaria
              </p>
            </div>
          </div>
        </section>

        {/* ===== VIDEO DEMO ===== */}
        <section className="pt-3 sm:pt-8 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto reveal">
            <VideoPlayer />
          </div>
        </section>

        {/* ===== PHONE DEMO + STATS ===== */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm font-medium tracking-widest uppercase text-purple-400 mb-10 text-center reveal">
              Así se ve en acción
            </p>

            <div className="flex flex-col md:flex-row items-center md:items-center md:justify-center gap-12 md:gap-16 lg:gap-24">
              <div className="reveal reveal-delay-1">
                <div className="phone-mockup">
                  <div className="phone-screen">
                    <p className="text-[10px] text-brand-muted text-center mb-4 tracking-wide uppercase">
                      AlekAgency AI · Activo 24/7
                    </p>
                    <div className="flex flex-col flex-1">
                      <div className="chat-bubble chat-guest">
                        Hola, me interesa el depa de 2 recámaras en Polanco
                      </div>
                      <div className="chat-bubble chat-ai">
                        Hola Carlos! El departamento en Polanco tiene 85m², 2
                        recámaras, 2 baños, estacionamiento y amenidades. Precio:
                        $4.2M MXN. ¿Te agendo una visita?
                      </div>
                      <div className="chat-bubble chat-guest">
                        Si, puede ser este sábado?
                      </div>
                      <div className="chat-bubble chat-ai">
                        Perfecto! Te agendo el sábado a las 11:00 AM. Te envío la
                        ubicación exacta y los documentos que necesitas si decides
                        apartar. ¿Alguna otra duda?
                      </div>
                      <div className="chat-bubble chat-guest">
                        Genial, gracias!! Super rapido
                      </div>
                    </div>
                    <div className="mt-auto pt-3 border-t border-white/[0.06] flex items-center gap-2">
                      <div className="flex-1 bg-white/[0.04] rounded-full px-3 py-2 text-[11px] text-brand-muted">
                        Escribe un mensaje...
                      </div>
                      <div className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-3.5 h-3.5 text-purple-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-8 text-center md:text-left">
                  <div className="reveal">
                    <p className="stat-number" data-target="5">0</p>
                    <p className="text-sm text-brand-muted mt-1">seg. de respuesta</p>
                  </div>
                  <div className="reveal reveal-delay-1">
                    <p className="stat-number" data-target="24">0</p>
                    <p className="text-sm text-brand-muted mt-1">horas activo, 7 días</p>
                  </div>
                  <div className="reveal reveal-delay-2">
                    <p className="stat-number" data-target="20">0</p>
                    <p className="text-sm text-brand-muted mt-1">hrs/mes ahorradas</p>
                  </div>
                  <div className="reveal reveal-delay-3">
                    <p className="stat-number" data-target="0">0</p>
                    <p className="text-sm text-brand-muted mt-1">prospectos perdidos</p>
                  </div>
                </div>
                <div className="hidden md:block mt-10 reveal">
                  <OpenChatButton className="shiny-cta shiny-cta-white whitespace-nowrap">
                    Mira Cómo Funciona
                  </OpenChatButton>
                </div>

                {/* Social channels */}
                <div className="mt-8 reveal">
                  <p className="mb-3 text-sm text-brand-muted text-center md:text-left">
                    Tu chatbot atiende en{" "}
                    <strong className="text-brand-white">
                      WhatsApp, Messenger e Instagram
                    </strong>
                  </p>
                  <div className="flex w-full items-center justify-around rounded-2xl border border-purple-400/15 bg-white/[0.03] px-5 py-5 sm:px-8 sm:py-7">
                    {/* eslint-disable @next/next/no-img-element */}
                    <img
                      src="/whatsapp-icon.svg"
                      alt="WhatsApp"
                      className="h-13 w-13 transition-transform duration-200 hover:scale-110 sm:h-16 sm:w-16"
                    />
                    <img
                      src="/messenger.svg"
                      alt="Messenger"
                      className="h-13 w-13 transition-transform duration-200 hover:scale-110 sm:h-16 sm:w-16"
                    />
                    <img
                      src="/instagram-icon.svg"
                      alt="Instagram"
                      className="h-13 w-13 transition-transform duration-200 hover:scale-110 sm:h-16 sm:w-16"
                    />
                    {/* eslint-enable @next/next/no-img-element */}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:hidden text-center mt-10 reveal">
              <OpenChatButton className="shiny-cta shiny-cta-white whitespace-nowrap">
                Mira Cómo Funciona
              </OpenChatButton>
            </div>
          </div>
        </section>

        {/* ===== PLATFORM ===== */}
        <section id="plataforma" className="py-28 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 reveal">
              <h2 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
                Una Plataforma Completa para{" "}
                <span className="gradient-text">Controlar tu Operación</span>
              </h2>
            </div>

            <div className="max-w-5xl mx-auto space-y-16">
              {/* Feature 1: Dashboard — text + photo */}
              <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-12">
                <div className="reveal">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-14 h-14 text-purple-400 mb-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="7" height="9" rx="1" />
                    <rect x="14" y="3" width="7" height="5" rx="1" />
                    <rect x="14" y="12" width="7" height="9" rx="1" />
                    <rect x="3" y="16" width="7" height="5" rx="1" />
                  </svg>
                  <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                    Dashboard de Propiedades
                  </h3>
                  <p className="text-brand-muted leading-relaxed text-lg sm:text-xl">
                    Administra todo tu inventario desde un panel simple e
                    intuitivo: metros cuadrados, recámaras, baños, zona,
                    dirección, fotos y descripción.{" "}
                    <strong className="text-brand-white">
                      Todo organizado en un solo lugar.
                    </strong>
                  </p>
                </div>
                {/* Dashboard screenshot */}
                <div className="reveal reveal-delay-2 overflow-hidden rounded-2xl border border-purple-400/15 bg-white/[0.02] shadow-[0_0_50px_rgba(124,58,237,0.12)]">
                  <Image
                    src="/dashboard.png"
                    alt="Dashboard de gestión de propiedades de AlekAgency"
                    width={1547}
                    height={1080}
                    className="h-auto w-full"
                  />
                </div>
              </div>

              {/* Features 2 & 3: two columns */}
              <div className="reveal grid gap-10 sm:grid-cols-2 sm:gap-12">
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-purple-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M3 5v14a9 3 0 0 0 18 0V5" />
                    <path d="M3 12a9 3 0 0 0 18 0" />
                  </svg>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold mb-3">
                    Respuestas 100% Verídicas
                  </h3>
                  <p className="text-brand-muted leading-relaxed text-[17px]">
                    El chatbot se conecta directo a tu base de datos y responde
                    siempre con información real de tus propiedades.{" "}
                    <strong className="text-brand-white">
                      Nunca inventa precios ni características.
                    </strong>
                  </p>
                </div>
                <div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-purple-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold mb-3">
                    CRM Integrado
                  </h3>
                  <p className="text-brand-muted leading-relaxed text-[17px]">
                    Cada prospecto que conversa con el bot se registra
                    automáticamente en tu CRM con todos sus datos de contacto.{" "}
                    <strong className="text-brand-white">
                      Ningún cliente se te escapa.
                    </strong>
                  </p>
                </div>
              </div>

              {/* Feature 4: Monitoring — full width */}
              <div className="reveal">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-purple-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <h3 className="font-heading text-xl sm:text-2xl font-bold mb-3">
                  Monitoreo e Intervención Humana
                </h3>
                <p className="text-brand-muted leading-relaxed text-[17px] max-w-3xl">
                  Observa cada conversación en tiempo real. Cuando quieras, toma
                  el control: apaga o enciende el bot en cualquier chat para{" "}
                  <strong className="text-brand-white">
                    atender tú personalmente.
                  </strong>
                </p>
              </div>
            </div>

            <p className="text-center text-brand-muted text-lg mt-14 reveal">
              Tú tienes el control total.{" "}
              <strong className="text-purple-400">
                Nosotros la tecnología.
              </strong>
            </p>
          </div>
        </section>

        <div className="line-divider max-w-3xl mx-auto" />

        {/* ===== PAIN POINTS ===== */}
        <section className="py-28 px-4 sm:px-6 lg:px-8 content-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 reveal">
              <p className="text-sm font-medium tracking-widest uppercase text-purple-400 mb-4">
                El problema
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                ¿Te suena <span className="gradient-text">familiar</span> esto?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="shader-card cursor-pointer reveal">
                <div className="shader-card-bg shader-card-bg-1" />
                <div className="shader-card-content">
                  <div className="mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="shader-card-icon text-white" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <polyline points="12 6 12 12 16 14" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-3">
                    Prospectos que se enfrían
                  </h3>
                  <p className="text-gray-100 leading-relaxed grow">
                    Son las <strong className="text-purple-300">10 PM</strong> y un
                    prospecto preguntó por una propiedad. Contestas al día siguiente.{" "}
                    <strong>Ya fue con otro agente.</strong>
                  </p>
                  <div className="mt-6 flex items-center text-sm font-bold text-gray-300">
                    <span className="mr-2">Suena familiar?</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="shader-card cursor-pointer reveal reveal-delay-1">
                <div className="shader-card-bg shader-card-bg-2" />
                <div className="shader-card-content">
                  <div className="mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="shader-card-icon text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-3">
                    Preguntas repetitivas
                  </h3>
                  <p className="text-gray-100 leading-relaxed grow">
                    Llevas <strong className="text-purple-300">100 veces</strong>{" "}
                    respondiendo: &quot;¿Cuánto mide?&quot; &quot;¿Tiene
                    estacionamiento?&quot; &quot;¿Acepta crédito?&quot; Y aún quedan{" "}
                    <strong>20 propiedades</strong> por mostrar.
                  </p>
                  <div className="mt-6 flex items-center text-sm font-bold text-gray-300">
                    <span className="mr-2">Suena familiar?</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="shader-card cursor-pointer reveal reveal-delay-2">
                <div className="shader-card-bg shader-card-bg-3" />
                <div className="shader-card-content">
                  <div className="mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="shader-card-icon text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-white mb-3">
                    Operaciones perdidas
                  </h3>
                  <p className="text-gray-100 leading-relaxed grow">
                    Un cliente quería agendar visita a 3 propiedades. No contestaste a
                    tiempo. La comisión{" "}
                    <strong className="text-purple-300">se fue a tu competencia.</strong>
                  </p>
                  <div className="mt-6 flex items-center text-sm font-bold text-gray-300">
                    <span className="mr-2">Suena familiar?</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-brand-muted text-lg mt-14 reveal">
              Si te identificaste con al menos uno...{" "}
              <strong className="text-purple-400">necesitamos hablar.</strong>
            </p>
          </div>
        </section>

        <div className="line-divider max-w-3xl mx-auto" />

        {/* ===== FINAL CTA ===== */}
        <section id="agendar" className="py-28 px-4 sm:px-6 lg:px-8 cta-glow">
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="reveal">
              <p className="text-sm font-medium tracking-widest uppercase text-purple-400 mb-6">
                Da el primer paso
              </p>

              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
                En 15 Minutos Te Mostramos Cuántas Horas
                <span className="gradient-text-glow"> Puedes Recuperar</span>
              </h2>

              <p className="text-brand-muted text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                Agenda tu demo gratuita. Te mostramos en vivo cómo la IA puede
                trabajar para tu operación inmobiliaria.
              </p>

              <a
                href={CAL_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="shiny-cta"
              >
                <span>Quiero Mi Demo Gratis</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>

              <p className="text-brand-muted text-sm mt-6">
                Sin costo · Sin letra chica
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-white/[0.04] py-10 px-4 sm:px-6 lg:px-8 bg-brand-black/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-brand-muted">
          <div className="font-heading font-bold text-base text-brand-white">
            Alek<span className="gradient-text">Agency</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center">
            <a href="mailto:agencyalek@gmail.com" className="hover:text-purple-400 transition-colors duration-200 cursor-pointer">
              agencyalek@gmail.com
            </a>
            <span className="hidden sm:inline text-white/10">·</span>
            <a href="tel:+522461957348" className="hover:text-purple-400 transition-colors duration-200 cursor-pointer">
              246 195 7348
            </a>
            <span className="hidden sm:inline text-white/10">·</span>
            <a href="https://instagram.com/alekagency" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors duration-200 cursor-pointer">
              @alekagency
            </a>
          </div>

          <p className="text-brand-muted/60">© 2026 AlekAgency</p>
        </div>
      </footer>
    </>
  );
}
