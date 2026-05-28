"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

// Minimal subset of the runtime turnstile object we touch.
type TurnstileGlobal = {
  render: (
    el: HTMLElement | string,
    opts: Record<string, unknown>
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileGlobal;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export default function TurnstileWidget({
  onVerify,
  onExpire,
  className,
}: {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;

    const tryRender = () => {
      if (cancelled) return;
      const ts = window.turnstile;
      if (!ts) {
        // Script hasn't booted yet — try again shortly.
        setTimeout(tryRender, 200);
        return;
      }
      if (widgetIdRef.current || !containerRef.current) return;
      widgetIdRef.current = ts.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        size: "normal",
        callback: (token: string) => onVerify(token),
        "expired-callback": () => onExpire?.(),
        "error-callback": () => onExpire?.(),
      });
    };

    tryRender();

    return () => {
      cancelled = true;
      const ts = window.turnstile;
      if (ts && widgetIdRef.current) {
        try {
          ts.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onVerify, onExpire]);

  if (!siteKey) {
    // Misconfigured environment: don't render the checkbox so the form
    // remains usable. The server-side verify will pass (no secret) too.
    return null;
  }

  return (
    <>
      <Script src={SCRIPT_SRC} strategy="afterInteractive" />
      <div ref={containerRef} className={className} />
    </>
  );
}
