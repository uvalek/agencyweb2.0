import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · AlekAgency",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="relative z-10 min-h-dvh">{children}</div>;
}
