import SharedPageHero from '@/components/ui/PageHero';

interface PageHeroProps {
  title: string;
  subtitle: string;
  images: string[];
}

/**
 * Componente reutilizable para crear encabezados de página con un carrusel
 * de imágenes de fondo, similar al de la página de inicio.
 *
 * @param title - El título principal de la sección.
 * @param subtitle - El subtítulo o texto descriptivo.
 * @param images - Un arreglo de rutas de las imágenes para el carrusel.
 */
export default function PageHero({ title, subtitle, images }: PageHeroProps) {
  return (
    <SharedPageHero
      title={title}
      subtitle={subtitle}
      image={images[0] ?? '/images/contactanos.jpg'}
      imageAlt={title}
    />
  );
}
