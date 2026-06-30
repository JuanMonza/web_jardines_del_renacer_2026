import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import FadeIn from '@/components/animations/FadeIn';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { historyTimeline } from '@/content/company';

// Helper para renderizar iconos SVG elegantes según la base de datos
const renderIcon = (type: string) => {
  switch (type) {
    case 'flag':
      return (
        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      );
    case 'trending-up':
      return (
        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case 'star':
      return (
        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.898 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.518-4.674z" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

export default function ResenaHistoricaPage() {
  // Simulación de carga desde el administrador: filtramos los activos y los ordenamos.
  const timelineData = historyTimeline
    .filter(item => item.active)
    .sort((a, b) => a.order - b.order);

  return (
    <main className="min-h-screen">
      <PageHero
        title="Reseña Histórica"
        subtitle="Una evolución constante basada en el respeto, la dignidad y el servicio a las familias colombianas."
        image="/images/carrusel_1.jpg"
        imageAlt="Reseña histórica Jardines del Renacer"
      />

      {/* LÍNEA DEL TIEMPO INTERACTIVA */}
      <section className="py-24 relative overflow-hidden">
        <Container maxWidth="2xl">
          <div className="relative">
            {/* Línea vertical central (adaptativa a móvil/desktop) */}
            <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-1 bg-gradient-to-b from-primary/5 via-primary/30 to-primary/5 -translate-x-1/2 rounded-full"></div>

            {/* Cambiamos a Lista Ordenada para Accesibilidad y SEO */}
            <ol className="space-y-16 md:space-y-24 relative z-10" aria-label="Línea del tiempo histórica">
              {timelineData.map((item, index) => {
                // Intercalamos izquierda a derecha para pantallas grandes
                const isEven = index % 2 === 0;

                return (
                  <li key={item.id}>
                    <FadeIn delay={index * 0.1}>
                      <div className={`group/timeline relative flex flex-col md:flex-row items-center ${isEven ? '' : 'md:flex-row-reverse'}`} aria-label={`Año ${item.year}`}>
                      
                        {/* Efecto de "Latido" (Heartbeat) constante de fondo */}
                        <div className="absolute left-6 md:left-1/2 top-8 md:top-1/2 w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full animate-ping -translate-x-1/2 md:-translate-y-1/2 z-10" style={{ animationDuration: '3s' }}></div>

                        {/* Ícono circular flotante */}
                        <div className="absolute left-6 md:left-1/2 top-8 md:top-1/2 w-12 h-12 md:w-16 md:h-16 bg-white border-4 border-primary/20 rounded-full flex items-center justify-center text-primary shadow-xl -translate-x-1/2 md:-translate-y-1/2 z-20 transition-all duration-500 group-hover/timeline:scale-110 group-hover/timeline:border-primary group-hover/timeline:bg-primary/5 group-hover/timeline:shadow-primary/20">
                          {renderIcon(item.iconType)}
                        </div>

                        {/* Conector horizontal magnético (Crece suavemente al hacer hover) */}
                        <div className={`hidden md:block absolute top-1/2 h-[2px] bg-primary/20 group-hover/timeline:bg-primary transition-all duration-700 ease-out -translate-y-1/2 z-10 ${isEven ? 'right-1/2 mr-8 w-4 group-hover/timeline:w-12 lg:group-hover/timeline:w-20' : 'left-1/2 ml-8 w-4 group-hover/timeline:w-12 lg:group-hover/timeline:w-20'}`}></div>

                        {/* Contenedor del Texto (Tarjeta Glassmorphism) */}
                        <div className={`w-full pl-16 md:pl-0 md:w-1/2 ${isEven ? 'md:pr-12 lg:pr-16 md:text-right' : 'md:pl-12 lg:pl-16 md:text-left'} mb-8 md:mb-0`}>
                          <div className="glass rounded-[2rem] p-6 md:p-10 border border-primary/10 shadow-glass transition-all duration-700 ease-out bg-white/60 group group-hover/timeline:-translate-y-2 group-hover/timeline:shadow-2xl group-hover/timeline:bg-white/80">
                            <span className="block text-4xl md:text-5xl font-extrabold mb-3 opacity-90 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r from-primary to-[#5a7ec0] group-hover:to-primary bg-clip-text text-transparent transform group-hover:scale-105 origin-left">
                              {item.year}
                            </span>
                            <h3 className="text-2xl font-bold text-text mb-4">
                              {item.title}
                            </h3>
                            <p className="text-textLight leading-relaxed md:text-lg">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        {/* Contenedor de la Imagen */}
                        <div className={`w-full pl-16 md:pl-0 md:w-1/2 ${isEven ? 'md:pl-12 lg:pl-16' : 'md:pr-12 lg:pr-16'}`}>
                          <div className="w-full relative aspect-video md:aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl border border-white/20 group transition-all duration-700 ease-out group-hover/timeline:shadow-2xl group-hover/timeline:-translate-y-2">
                            {/* Filtro sutil superpuesto */}
                            <div className="absolute inset-0 bg-primary/20 mix-blend-multiply group-hover/timeline:bg-transparent transition-all duration-700 z-10"></div>
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover scale-110 group-hover/timeline:scale-100 transition-transform duration-700 ease-out"
                            />
                          </div>
                        </div>

                      </div>
                    </FadeIn>
                  </li>
                );
              })}
            </ol>

            {/* Cierre de la línea del tiempo / Call to Action */}
            <FadeIn delay={0.3}>
              <div className="mt-20 md:mt-32 text-center flex flex-col items-center justify-center relative z-10 group cursor-default">
                {/* Conector final desvanecido */}
                <div className="w-1 h-16 bg-gradient-to-b from-primary/30 to-transparent mb-4"></div>
                
                {/* Punto final luminoso */}
                <div className="w-4 h-4 rounded-full bg-primary mb-12 animate-pulse shadow-[0_0_20px_rgba(60,96,162,0.8)] relative">
                  <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-50"></div>
                </div>

                {/* Tarjeta interactiva final */}
                <div className="glass rounded-[2.5rem] p-10 md:p-14 border border-primary/10 shadow-glass transition-all duration-700 ease-out hover:shadow-2xl hover:-translate-y-3 hover:bg-white/80 max-w-4xl mx-auto relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <h3 className="text-3xl md:text-5xl font-display mb-6 bg-gradient-to-r from-primary to-[#5a7ec0] bg-clip-text text-transparent transform transition-transform duration-700 group-hover:scale-105">
                    La historia continúa...
                  </h3>
                  <p className="text-textLight mb-10 text-lg md:text-xl leading-relaxed relative z-10 max-w-2xl mx-auto">
                    Seguimos evolucionando cada día para brindar el mejor acompañamiento. Te invitamos a conocer más sobre nuestros planes de previsión para ti y tu familia.
                  </p>
                  <Link href="/planes" className="relative z-10 inline-block">
                    <Button variant="primary" size="lg" className="shadow-xl hover:shadow-primary/40 hover:-translate-y-2 transition-all duration-300 text-base md:text-lg px-8 md:px-10 py-4 group/btn">
                      Conoce Nuestros Planes
                      <svg className="w-5 h-5 ml-2 transform group-hover/btn:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>
    </main>
  );
}
