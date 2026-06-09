import type { Metadata } from "next";
import WizardForm from "@/components/wizard/WizardForm";

export const metadata: Metadata = {
  title: "Prueba de 14 días gratis | AlekAgency",
  description:
    "Cuéntanos sobre tu inmobiliaria y activamos tu chatbot con IA personalizado en días, no en meses. Prueba 14 días gratis, sin tarjeta.",
};

export default function PruebaPage() {
  return <WizardForm />;
}
