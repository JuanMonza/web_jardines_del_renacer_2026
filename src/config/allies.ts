/**
 * Aliados del Ecosistema - Jardines del Renacer
 * Red de empresas y servicios complementarios
 */

export interface Ally {
  id: string;
  name: string;
  logo: string;
  url: string;
  category: 'funerario' | 'salud' | 'legal' | 'floreria' | 'transporte' | 'otros';
  featured?: boolean;
}

export const allies: Ally[] = [
  {
    id: "renacer-mascotas",
    name: "Renacer Mascotas",
    logo: "/allies/renacer-mascotas.png",
    url: "https://renacer-mascotas.com",
    category: "funerario",
    featured: true,
  },
  {
    id: "parque-conmemorativo",
    name: "Parque Conmemorativo",
    logo: "/allies/parque-conmemorativo.png",
    url: "https://parque-conmemorativo.com",
    category: "funerario",
    featured: true,
  },
  {
    id: "renacer-seguros",
    name: "Renacer Seguros",
    logo: "/allies/renacer-seguros.png",
    url: "https://renacer-seguros.com",
    category: "salud",
    featured: true,
  },
  {
    id: "renacer-abogados",
    name: "Renacer Abogados",
    logo: "/allies/renacer-abogados.png",
    url: "https://renacer-abogados.com",
    category: "legal",
    featured: true,
  },
  {
    id: "fedico",
    name: "Fedico",
    logo: "/allies/fedico.png",
    url: "https://fedico.com",
    category: "otros",
  },
  {
    id: "agricola",
    name: "Agrícola",
    logo: "/allies/agricola.png",
    url: "https://agricola.com",
    category: "otros",
  },
  {
    id: "vive-mas",
    name: "Vive Más",
    logo: "/allies/vive-mas.png",
    url: "https://vive-mas.com",
    category: "salud",
  },
  {
    id: "apoyo-exequial",
    name: "Apoyo Exequial",
    logo: "/allies/apoyo-exequial.png",
    url: "https://apoyo-exequial.com",
    category: "funerario",
  },
];

export const getAllies = () => allies;

export const getFeaturedAllies = () => allies.filter(ally => ally.featured);

export const getAlliesByCategory = (category: Ally['category']) => 
  allies.filter(ally => ally.category === category);
