"use client";

import { useEffect } from "react";

export default function RevealEffects() {
  useEffect(() => {
    if (history.scrollRestoration) history.scrollRestoration = "manual";

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const target = parseInt(el.dataset.target || "0", 10);
          const suffix =
            target === 5 ? " seg" : target === 24 ? "/7" : target === 20 ? "+ hrs" : "";
          let cur = 0;
          const increment = Math.max(1, Math.floor(target / 30));
          const timer = setInterval(() => {
            cur += increment;
            if (cur >= target) {
              cur = target;
              clearInterval(timer);
            }
            el.textContent = cur + suffix;
          }, 40);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll(".stat-number").forEach((el) => counterObserver.observe(el));

    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  return null;
}
