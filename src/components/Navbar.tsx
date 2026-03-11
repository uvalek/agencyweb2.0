export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#050505]/70 border-b border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="#" className="font-heading font-bold text-xl tracking-tight text-[#F0F0F5] cursor-pointer">
          Alek<span className="gradient-text">Agency</span>
        </a>
        <a
          href="#agendar"
          className="gradient-btn text-white text-sm font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-full cursor-pointer inline-flex items-center gap-2 whitespace-nowrap"
        >
          <span>Agendar</span>
          <span className="hidden sm:inline"> Tu Llamada</span>
        </a>
      </div>
    </nav>
  );
}
