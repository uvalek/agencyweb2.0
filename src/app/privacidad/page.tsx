import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad | AlekAgency",
  description:
    "Política de privacidad de AlekAgency. Conoce cómo recopilamos, usamos y protegemos tu información personal.",
};

export default function PrivacidadPage() {
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-6 pt-16 pb-20 leading-relaxed text-[#d1d1d6]">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-1.5 text-sm text-brand-muted transition-colors hover:text-brand-white"
      >
        ← Volver a AlekAgency
      </Link>

      <div className="font-heading mb-12 text-xl font-bold text-brand-white">
        Alek<span className="gradient-text">Agency</span>
      </div>

      <h1 className="font-heading mb-2 text-4xl font-bold leading-tight text-brand-white">
        Política de Privacidad
      </h1>
      <p className="mb-10 text-sm text-brand-muted">
        Última actualización: 8 de abril de 2025
      </p>

      <p className="mb-4">
        En <strong className="text-brand-white">AlekAgency</strong> nos
        comprometemos a proteger la privacidad y seguridad de tu información
        personal. Esta Política de Privacidad describe cómo recopilamos, usamos,
        almacenamos y protegemos los datos que nos proporcionas a través de
        nuestros formularios de contacto, campañas publicitarias y sitio web.
      </p>
      <p className="mb-4">
        Al proporcionarnos tu información, aceptas las prácticas descritas en
        esta política.
      </p>

      <Section title="1. Responsable del tratamiento">
        <Box>
          <p className="mb-2">
            <strong className="text-brand-white">Empresa:</strong> AlekAgency
          </p>
          <p>
            <strong className="text-brand-white">Contacto:</strong>{" "}
            <A href="mailto:agencyalek@gmail.com">agencyalek@gmail.com</A>
          </p>
        </Box>
      </Section>

      <Section title="2. Información que recopilamos">
        <p className="mb-4">
          Recopilamos los siguientes datos personales cuando completas nuestros
          formularios de contacto o formularios de captación en campañas
          publicitarias (incluyendo formularios de Meta/Facebook Ads):
        </p>
        <List
          items={[
            "Nombre completo",
            "Número de teléfono",
            "Correo electrónico",
          ]}
        />
        <p>
          Estos datos son proporcionados de forma voluntaria por ti al completar
          los formularios.
        </p>
      </Section>

      <Section title="3. Finalidad del tratamiento">
        <p className="mb-4">
          Utilizamos tu información personal para las siguientes finalidades:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            Contactarte para dar seguimiento a tu solicitud de información sobre
            nuestros servicios de inteligencia artificial para el sector
            inmobiliario.
          </li>
          <li>Agendar demos o reuniones sobre nuestras soluciones.</li>
          <li>
            Enviarte información comercial relevante sobre nuestros servicios
            (solo si diste tu consentimiento).
          </li>
          <li>
            Mejorar nuestras campañas publicitarias y la experiencia del
            usuario.
          </li>
        </ul>
      </Section>

      <Section title="4. Base legal del tratamiento">
        <p className="mb-4">El tratamiento de tus datos se basa en:</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong className="text-brand-white">Tu consentimiento</strong>,
            otorgado al completar voluntariamente el formulario y enviar tu
            información.
          </li>
          <li>
            <strong className="text-brand-white">Interés legítimo</strong> para
            dar seguimiento a solicitudes comerciales.
          </li>
        </ul>
      </Section>

      <Section title="5. Compartición de datos">
        <p className="mb-4">
          No vendemos, alquilamos ni compartimos tu información personal con
          terceros, salvo en los siguientes casos:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong className="text-brand-white">
              Meta (Facebook/Instagram):
            </strong>{" "}
            Tus datos pueden ser recopilados a través de formularios de Meta Ads
            (Lead Ads). Meta actúa como plataforma intermediaria y tiene su
            propia{" "}
            <A href="https://www.facebook.com/privacy/policy/">
              Política de Privacidad
            </A>
            .
          </li>
          <li>
            <strong className="text-brand-white">
              Proveedores de servicios:
            </strong>{" "}
            Podemos utilizar herramientas de terceros (CRM, email marketing,
            etc.) para gestionar la comunicación contigo. Estos proveedores están
            obligados a proteger tu información.
          </li>
          <li>
            <strong className="text-brand-white">Obligación legal:</strong>{" "}
            Cuando sea requerido por ley o autoridad competente.
          </li>
        </ul>
      </Section>

      <Section title="6. Conservación de datos">
        <p>
          Conservaremos tu información personal durante el tiempo necesario para
          cumplir con las finalidades descritas, o hasta que solicites su
          eliminación. En general, los datos se conservan por un máximo de{" "}
          <strong className="text-brand-white">24 meses</strong> desde su
          recopilación, salvo obligación legal que requiera un período mayor.
        </p>
      </Section>

      <Section title="7. Tus derechos">
        <p className="mb-4">Tienes derecho a:</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong className="text-brand-white">Acceder</strong> a tus datos
            personales que tenemos almacenados.
          </li>
          <li>
            <strong className="text-brand-white">Rectificar</strong> datos
            incorrectos o incompletos.
          </li>
          <li>
            <strong className="text-brand-white">Eliminar</strong> tus datos
            personales (derecho al olvido).
          </li>
          <li>
            <strong className="text-brand-white">Oponerte</strong> al
            tratamiento de tus datos con fines comerciales.
          </li>
          <li>
            <strong className="text-brand-white">Revocar tu consentimiento</strong>{" "}
            en cualquier momento.
          </li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, envíanos un correo a{" "}
          <A href="mailto:agencyalek@gmail.com">agencyalek@gmail.com</A> con el
          asunto &quot;Derechos de Privacidad&quot; y te responderemos en un
          plazo máximo de 30 días.
        </p>
      </Section>

      <Section title="8. Seguridad de los datos">
        <p>
          Implementamos medidas técnicas y organizativas razonables para
          proteger tu información personal contra acceso no autorizado, pérdida,
          alteración o destrucción. Sin embargo, ningún sistema de transmisión o
          almacenamiento es 100% seguro.
        </p>
      </Section>

      <Section title="9. Cookies y tecnologías de seguimiento">
        <p className="mb-4">Nuestro sitio web utiliza las siguientes tecnologías:</p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <strong className="text-brand-white">
              Meta Pixel (Facebook Pixel):
            </strong>{" "}
            Para medir la efectividad de nuestras campañas publicitarias en Meta
            y optimizar los anuncios mostrados. Este pixel recopila datos de
            navegación de forma anónima. Puedes gestionar tus preferencias de
            anuncios en{" "}
            <A href="https://www.facebook.com/adpreferences">
              la configuración de anuncios de Facebook
            </A>
            .
          </li>
        </ul>
      </Section>

      <Section title="10. Cambios a esta política">
        <p>
          Nos reservamos el derecho de actualizar esta Política de Privacidad en
          cualquier momento. Cualquier cambio será publicado en esta misma página
          con la fecha de actualización. Te recomendamos revisarla
          periódicamente.
        </p>
      </Section>

      <Section title="11. Contacto">
        <p className="mb-4">
          Si tienes preguntas, comentarios o solicitudes relacionadas con esta
          Política de Privacidad, puedes contactarnos en:
        </p>
        <Box>
          <p>
            <strong className="text-brand-white">Email:</strong>{" "}
            <A href="mailto:agencyalek@gmail.com">agencyalek@gmail.com</A>
          </p>
        </Box>
      </Section>

      <hr className="my-12 border-brand-border" />

      <p className="text-center text-sm text-brand-muted">
        Al completar cualquiera de nuestros formularios, confirmas que has leído
        y aceptas esta Política de Privacidad.
      </p>

      <footer className="mt-12 border-t border-brand-border pt-8 text-center text-[13px] text-brand-muted">
        © 2025 AlekAgency. Todos los derechos reservados.
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-heading mt-10 mb-4 text-[22px] font-semibold text-brand-white">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-brand-border bg-brand-card p-6">
      {children}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="mb-4 list-disc space-y-2 pl-6">
      {items.map((item) => (
        <li key={item}>
          <strong className="text-brand-white">{item}</strong>
        </li>
      ))}
    </ul>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      className="text-[#7c6af4] hover:underline"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
