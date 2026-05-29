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

  // Keep the latest callbacks in refs so the render effect below can
  // depend only on `siteKey`. Otherwise the effect re-runs on every
  // parent render (e.g. every keystroke in the login form), which would
  // remove and re-create the widget — causing the loading spinner to
  // flash, the checkbox to reset, and the layout to bounce.
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
  });

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
        callback: (token: string) => onVerifyRef.current(token),
        "expired-callback": () => onExpireRef.current?.(),
        "error-callback": () => onExpireRef.current?.(),
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
  }, [siteKey]);

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
