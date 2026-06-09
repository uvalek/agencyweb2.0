import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-brand-black/70 border-b border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-24">
        <Link href="/" className="cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo Monocromatico Blanco.svg"
            alt="AlekAgency"
            className="h-14 sm:h-24 w-auto"
          />
        </Link>
        <Link
          href="/prueba"
          className="shiny-cta shiny-cta-white shiny-cta-sm whitespace-nowrap"
        >
          <span className="sm:hidden">Prueba gratis</span>
          <span className="hidden sm:inline">Prueba 14 días gratis</span>
        </Link>
      </div>
    </nav>
  );
}
