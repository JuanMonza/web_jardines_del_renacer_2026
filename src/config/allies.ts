import type { CSSProperties } from 'react';

/**
 * Aliados del Ecosistema - Jardines del Renacer
 * Red de empresas y servicios complementarios
 */

export interface Ally {
  id: string;
  name: string;
  logo: string;
  url?: string;
  category: 'funerario' | 'salud' | 'legal' | 'floreria' | 'transporte' | 'otros';
  featured?: boolean;
  containerStyle?: CSSProperties;
  innerStyle?: CSSProperties;
  glowStyle?: CSSProperties;
  logoStyle?: CSSProperties;
}

export const allies: Ally[] = [
  {
    id: "renacer-mascotas",
    name: "Renacer Mascotas",
    logo: "/images/logos_aliados_jr/renacer_mascotas.png",
    url: "https://www.renacermascotas.co/",
    category: "funerario",
    featured: true,
  },
  {
    id: "parque-conmemorativo",
    name: "Parque Conmemorativo",
    logo: "/images/logos_aliados_jr/conmemorativo.png",
    url: "https://www.parqueconmemorativo.com/",
    category: "funerario",
    featured: true,
  },
  {
    id: "renacer-seguros",
    name: "Renacer Seguros",
    logo: "/images/logos_aliados_jr/renacer_seguros.png",
    url: "https://www.renacerseguros.com/",
    category: "salud",
    featured: true,
  },
  {
    id: "renacer-abogados",
    name: "Renacer Abogados",
    logo: "/images/logos_aliados_jr/renacer_abogados.png",
    url: "https://www.renacerabogados.com/",
    category: "legal",
    featured: true,
    containerStyle: {
      backgroundColor: '#141412',
      borderColor: '#2f2c24',
    },
    innerStyle: {
      borderColor: 'rgba(92, 74, 27, 0.25)',
      background: 'linear-gradient(135deg, #26241f 0%, #171612 55%, #0f0f0d 100%)',
    },
    glowStyle: {
      background:
        'radial-gradient(circle at top, rgba(214, 179, 92, 0.22), rgba(255, 255, 255, 0))',
    },
  },
  {
    id: "fehico",
    name: "Fehico",
    logo: "/images/logos_aliados_jr/fehico.png", 
    url: "https://www.fehico.com/",
    category: "otros",
    featured: true,
  },
  {
    id: "apoyo-exequial",
    name: "Apoyo Exequial",
    logo: "/images/logos_aliados_jr/apoyo.png",
    url: "",
    category: "funerario",
    featured: true,
  },
  {
    id: "agricola-renacer",
    name: "Agrícola Renacer",
    logo: "/images/logos_aliados_jr/agricola_renacer.png",
    url: "https://www.agricolarenacer.com/",
    category: "otros",
    featured: true,
  },
  {
    id: "vive-mas",
    name: "Vive Más",
    logo: "/images/logos_aliados_jr/vive+.png",
    url: "https://www.mivivemas.com/",
    category: "salud",
    featured: true,
  },
];

export const getAllies = () => allies;

export const getFeaturedAllies = () => allies.filter(ally => ally.featured);

export const getAlliesByCategory = (category: Ally['category']) => 
  allies.filter(ally => ally.category === category);
