import ServiciosClient from './ServiciosClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Servicios Funerarios, Cremación y Previsión Exequial | Jardines del Renacer',
  description:
    'Ofrecemos servicios exequiales integrales, cremación, planes de previsión y un parque conmemorativo. Acompañamiento humano y profesional 24/7.',
  keywords: [
    'servicios funerarios',
    'cremación',
    'previsión exequial',
    'parque conmemorativo',
    'Jardines del Renacer',
  ],
  openGraph: {
    title: 'Servicios Integrales para Acompañarte | Jardines del Renacer',
    description: 'Acompañamiento humano y profesional con infraestructura propia a nivel nacional.',
    images: [
      {
        url: '/images/servicios_funerarios.jpg',
        width: 1200,
        height: 630,
        alt: 'Servicios Funerarios Jardines del Renacer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function ServiciosPage() 
{
  return <ServiciosClient />;
}
