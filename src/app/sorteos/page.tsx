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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {upcoming.map((giveaway, index) => (
                                <FadeIn key={giveaway.id} delay={index * 0.1}>
                                    <div className="glass rounded-2xl border border-primary/10 overflow-hidden shadow-lg h-full flex flex-col">
                                        <div className="relative aspect-video overflow-hidden">
                                            <Image
                                                src={giveaway.image}
                                                alt={giveaway.title} fill
                                                className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" />
                                            <div className="absolute bottom-0 w-full bg-primary/80 px-2 py-1 text-center text-[10px] font-semibold text-white backdrop-blur-sm">
                                                *Imagen de referencia. Aplican T&C.
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <p className="text-sm font-semibold text-primary mb-2">
                                                {new Date(giveaway.date).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                                            </p>
                                            <h4 className="text-xl font-bold text-text flex-1">{giveaway.title}</h4>
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
                                    <div className="glass rounded-2xl p-6 border border-primary/15 text-center flex flex-col items-center transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl">
                                        <img width="64" height="64" src="https://img.icons8.com/arcade/64/first-place-ribbon.png" alt="first-place-ribbon" className="mb-4" />
                                        <p className="text-sm font-semibold text-primary mb-2">
                                            {new Date(giveaway.date).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
                                        </p>
                                        <p className="text-textLight mb-2">Ganador del premio:</p>
                                        <h4 className="text-lg font-bold text-text mb-2">{giveaway.winner?.name}</h4>
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
