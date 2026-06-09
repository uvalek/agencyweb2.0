import type { NextConfig } from "next";

// Security headers applied to every response. The CSP is intentionally
// strict — only same-origin scripts/styles, plus the third parties we
// actually integrate with (Supabase REST + Auth + Storage, Meta Pixel,
// Google Fonts, YouTube embeds).
//
// `'unsafe-inline'` stays under style-src because Tailwind v4 injects
// runtime <style> blocks. Next injects a small inline runtime script
// too — when we wire a nonce-based CSP we'll drop `'unsafe-inline'`
// for scripts.

const SUPABASE_HOST = "https://*.supabase.co";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net https://*.facebook.com https://challenges.cloudflare.com`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `font-src 'self' https://fonts.gstatic.com data:`,
  `img-src 'self' data: blob: https: ${SUPABASE_HOST} https://www.facebook.com`,
  `media-src 'self' blob: ${SUPABASE_HOST}`,
  `connect-src 'self' ${SUPABASE_HOST} wss://*.supabase.co https://www.facebook.com https://challenges.cloudflare.com`,
  `frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), browsing-topics=(), payment=()",
  },
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
