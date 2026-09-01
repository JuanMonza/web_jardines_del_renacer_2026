import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import EthicsReportButton from '@/components/ethics/EthicsReportButton';
import Container from '@/components/ui/Container';
import FadeIn from '@/components/animations/FadeIn';
import PageHero from '@/components/ui/PageHero';
import SecurePdfViewer from '@/components/clausulas/SecurePdfViewer';

export const metadata: Metadata = {
  title: 'Ética Empresarial | Jardines del Renacer',
  description: 'Canales de ética, cumplimiento y reporte de denuncias de Jardines del Renacer.',
};

const officialChannels = [
  {
    name: 'Superintendencia de Sociedades',
    description: 'Canal oficial para denuncias y orientación ciudadana.',
    href: 'https://www.supersociedades.gov.co/denuncias',
    logo: 'https://www.supersociedades.gov.co/documents/guest/inicio%20imagenes/Footer/cabecera_supersociedades.png',
  },
  {
    name: 'Presidencia de la República',
    description: 'Ventanilla oficial de peticiones, quejas, reclamos, sugerencias y denuncias.',
    href: 'https://psqr.presidencia.gov.co/Publico/IndexWebPQRS.aspx',
    logo: 'https://www.presidencia.gov.co/PublishingImages/og_image.jpg',
  },
];

export default function EticaEmpresarialPage() {
  return (
    <>
      <PageHero
        title="Ética Empresarial"
        subtitle="Actuamos con integridad, transparencia y respeto."
        description="Conoce nuestro Manual Integral de Cumplimiento y los canales disponibles para reportar situaciones que requieran atención."
        image="/images/images-baners/sagrilaft.webp"
        imageAlt="Ética empresarial Jardines del Renacer"
      />

      <section className="py-16 md:py-20">
        <Container maxWidth="2xl">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <FadeIn>
              <article className="glass h-full rounded-3xl border border-primary/15 p-6 shadow-glass md:p-8">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><FileText className="h-6 w-6" aria-hidden /></span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Cumplimiento</p>
                    <h1 className="mt-1 text-2xl font-bold text-text">Manual Integral de Cumplimiento</h1>
                    <p className="mt-3 leading-relaxed text-textLight">Consulta el documento institucional directamente en el sitio. El visor está dispuesto únicamente para lectura.</p>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl border border-primary/15 bg-white p-2 sm:p-3">
                  <div className="mb-2 flex items-center gap-2 px-2 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary"><ShieldCheck className="h-4 w-4" aria-hidden />Manual · solo lectura</div>
                  <SecurePdfViewer pdfSrc="/uploads/MANUAL%20INTEGRAL%20DE%20CUMPLIMIENTO%20.pdf" documentLabel="Manual Integral de Cumplimiento" documentYear="Solo lectura" />
                </div>
              </article>
            </FadeIn>

            <div className="space-y-6">
              <FadeIn delay={0.08}>
                <article className="glass rounded-3xl border border-primary/15 p-6 shadow-glass md:p-8">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck className="h-6 w-6" aria-hidden /></span>
                  <h2 className="mt-4 text-xl font-bold text-text">Canal de reporte confidencial</h2>
                  <p className="mt-2 leading-relaxed text-textLight">Para reportar una situación de manera confidencial, escribe a nuestra Línea Ética. Tu comunicación será dirigida al canal institucional correspondiente.</p>
                  <EthicsReportButton />
                  <p className="mt-3 text-center text-sm font-medium text-primary">Tu reporte será tratado de forma confidencial por Línea Ética.</p>
                  <p className="mt-3 text-center text-xs text-textLight">lineaetica@jardinesdelrenacer.co</p>
                </article>
              </FadeIn>

              <FadeIn delay={0.14}>
                <article className="rounded-3xl border border-primary/15 bg-primary/[0.04] p-6 md:p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Canales externos</p>
                  <h2 className="mt-2 text-xl font-bold text-text">Entidades oficiales</h2>
                  <div className="mt-4 space-y-3">
                    {officialChannels.map((channel) => (
                      <a key={channel.name} href={channel.href} target="_blank" rel="noopener noreferrer" className="group flex items-start justify-between gap-4 rounded-2xl border border-primary/15 bg-white/75 p-4 transition hover:border-primary/35 hover:bg-white">
                        <span className="flex min-w-0 items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl border border-primary/10 bg-white p-1"><img src={channel.logo} alt={`Logo de ${channel.name}`} className="h-full w-full object-contain" /></span><span><strong className="block text-sm text-text">{channel.name}</strong><span className="mt-1 block text-xs leading-relaxed text-textLight">{channel.description}</span></span></span>
                        <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </a>
                    ))}
                  </div>
                </article>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="px-3 text-center text-sm leading-relaxed text-textLight">También puedes conocer nuestra <Link href="/legal/privacidad" className="font-semibold text-primary hover:underline">Política de Privacidad</Link> y el manejo responsable de la información.</p>
              </FadeIn>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
