"use client";

import { useEffect, useRef, useState } from "react";
import ScrollReveal from "./ScrollReveal";

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let current = 0;
          const increment = Math.max(1, Math.floor(target / 30));
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            setCount(current);
          }, 40);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <p ref={ref} className="stat-number">
      {count}
      {suffix}
    </p>
  );
}

const stats = [
  { target: 5, suffix: " seg", label: "seg. de respuesta" },
  { target: 24, suffix: "/7", label: "horas activo / 7 días" },
  { target: 20, suffix: "+ hrs", label: "hrs/mes ahorradas" },
  { target: 0, suffix: "", label: "mensajes perdidos" },
];

export default function StatsBar() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04]">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s, i) => (
          <ScrollReveal key={s.label} delay={i * 0.1}>
            <Counter target={s.target} suffix={s.suffix} />
            <p className="text-sm text-[#8B8B9E] mt-1">{s.label}</p>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
