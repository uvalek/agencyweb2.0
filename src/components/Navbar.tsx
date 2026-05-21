export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-brand-black/70 border-b border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-24">
        <a href="#" className="cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo Monocromatico Blanco.svg"
            alt="AlekAgency"
            className="h-14 sm:h-24 w-auto"
          />
        </a>
        <a
          href="https://cal.com/alek-nava-i4gvq6/30min?overlayCalendar=true"
          target="_blank"
          rel="noopener noreferrer"
          className="shiny-cta shiny-cta-white shiny-cta-sm whitespace-nowrap"
        >
          <span className="sm:hidden">Agenda</span>
          <span className="hidden sm:inline">Agenda Tu Llamada</span>
        </a>
      </div>
    </nav>
  );
}
