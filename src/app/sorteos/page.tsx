'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Container from '@/components/ui/Container';
import FadeIn from '@/components/animations/FadeIn';
import PageHero from '@/components/ui/PageHero';
import { giveawaysData, Giveaway } from '@/content/giveaways';
import CountdownUnit from '@/components/ui/CountdownUnit';
import TitleBand from '@/components/ui/TitleBand';
import { useCountdown } from '@/hooks/useCountdown';
import Button from '@/components/ui/Button';
import { buildWhatsAppUrl } from '@/config/contact';

/**
 * Componente que renderiza la página estática de "Sorteos y Concursos".
 * Muestra el próximo sorteo, una lista de futuros sorteos y ganadores anteriores.
 */
export default function SorteosPage() {
    const { upcoming, next, past } = useMemo(() => {
        const now = new Date();
        const upcomingGiveaways = giveawaysData
            .filter((g) => new Date(g.date) > now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const pastGiveaways = giveawaysData
            .filter((g) => new Date(g.date) <= now && g.winner)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
            upcoming: upcomingGiveaways.slice(1, 7), // Los siguientes 6 después del próximo
            next: upcomingGiveaways[0] || null,
            past: pastGiveaways.slice(0, 6), // Los últimos 6 ganadores
        };
    }, []);

    const timeRemaining = useCountdown(next?.date);

    const whatsappUrl = useMemo(
        () =>
            buildWhatsAppUrl(
                'Hola, quiero actualizar mis datos para participar en los sorteos de Jardines del Renacer.'
            ),
        []
    );

    return (
        <>
            <PageHero
                title="Nuestros Sorteos Mensuales"
                subtitle="Mantén tus datos actualizados y participa para ganar."
                description="En Jardines del Renacer premiamos tu fidelidad. Cada mes tienes una nueva oportunidad de ganar premios increíbles."
                image="/images/images-baners/sorteos.webp"
                imageAlt="Sorteos y Concursos - Jardines del Renacer"
            />

            {/* Próximo Sorteo */}
            {next && (
                <section className="pb-20">
                    <TitleBand
                        title="Próximo Sorteo"
                        subtitle={`¡Prepárate! El ${new Date(next.date).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} las 7:00pm estaremos anunciando al ganador.`}
                    />
                    <Container>
                        <FadeIn>
                            <div className="glass rounded-3xl border border-primary/15 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
                                <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden group">
                                    <Image
                                        src={next.image}
                                        alt={next.title} fill
                                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" />
                                    <div className="absolute bottom-0 w-full bg-primary/80 p-2 text-center text-xs font-semibold text-white backdrop-blur-sm">
                                        *Imagen de referencia. Aplican términos y condiciones.
                                    </div>
                                </div>
                                <div className="p-8 md:p-12 flex flex-col justify-center items-center text-center">
                                    <p className="text-sm uppercase tracking-widest text-primary font-semibold mb-2">Gana un(a)</p>
                                    <h3 className="text-3xl md:text-4xl font-display font-bold text-text mb-4">{next.title}</h3>
                                    <p className="text-textLight mb-8 max-w-md">{next.description}</p>

                                    {timeRemaining ? (
                                        <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-8">
                                            <CountdownUnit value={timeRemaining.days} label="Días" />
                                            <CountdownUnit value={timeRemaining.hours} label="Horas" />
                                            <CountdownUnit value={timeRemaining.minutes} label="Min" />
                                            <CountdownUnit value={timeRemaining.seconds} label="Seg" />
                                        </div>
                                    ) : (
                                        <p className="text-lg font-semibold text-primary mb-8">¡El sorteo es hoy!</p>
                                    )}

                                    <Button as="a" href={whatsappUrl} target="_blank" size="lg" variant="primary">
                                        Actualizar mis Datos
                                    </Button>
                                </div>
                            </div>
                        </FadeIn>
                    </Container>
                </section>
            )}

            {/* Siguientes Sorteos */}
            {upcoming.length > 0 && (
                <section className="py-20 bg-background-light">
                    <TitleBand title="Siguientes Sorteos" subtitle="Estos son los premios que podrías ganar en los próximos meses." />
                    <Container>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcoming.map((giveaway, index) => (
                                <FadeIn key={giveaway.id} delay={index * 0.1}>
                                    <div className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 h-72">
                                        <Image src={giveaway.image} alt={giveaway.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        <span className="absolute top-4 left-4 rounded-full bg-primary/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white">
                                            {new Date(giveaway.date).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}
                                        </span>
                                        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                                            <p className="text-xs text-white/70 mb-1">Próximo sorteo</p>
                                            <h4 className="text-xl font-bold leading-tight">{giveaway.title}</h4>
                                        </div>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </Container>
                </section>
            )}

            {/* Ganadores Anteriores */}
            {past.length > 0 && (
                <section className="py-20">
                    <TitleBand title="Nuestros Últimos Ganadores" subtitle="¡Felicitaciones a quienes ya disfrutaron de nuestros premios!" />
                    <Container>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {past.map((giveaway, index) => (
                                <FadeIn key={giveaway.id} delay={index * 0.1}>
                                    <div className="group relative rounded-3xl overflow-hidden border border-primary/15 bg-gradient-to-br from-white to-primary/5 p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-400/20 border border-yellow-400/40">
                                                <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                                                    {new Date(giveaway.date).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                                                </p>
                                                <p className="text-xs text-textLight">Ganador confirmado</p>
                                            </div>
                                        </div>
                                        <h4 className="text-base font-bold text-text mb-1">{giveaway.winner?.name}</h4>
                                        <p className="text-sm text-textLight">{giveaway.title}</p>
                                    </div>
                                </FadeIn>
                            ))}
                        </div>
                    </Container>
                </section>
            )}

            {/* Mensaje por si no hay sorteos configurados */}
            {!next && upcoming.length === 0 && (
                <section className="py-16">
                    <Container maxWidth="lg">
                        <FadeIn>
                            <article className="glass rounded-2xl p-8 border border-primary/15 text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5 text-primary">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-semibold text-text mb-3">Próximamente</h3>
                                <p className="text-textLight leading-relaxed max-w-xl mx-auto">
                                    Estamos preparando nuevos sorteos para ti. Te invitamos a seguirnos en nuestras redes sociales y a visitar esta página regularmente para no perderte futuras oportunidades.
                                </p>
                            </article>
                        </FadeIn>
                    </Container>
                </section>
            )}
        </>
    );
}
