export interface Department {
  id: string;
  name: string;
  color: string;
  sedes: number;
  salas: number;
  ciudades: string[];
  x: number;
  y: number;

  // Configuración de cámara
  translateX: number;
  translateY: number;
  scale: number;
}

export const coverageData: Department[] = [
  {
    id: "CO-ANT",
    name: "Antioquia",
    color: "#977660",
    sedes: 18,
    salas: 32,
    ciudades: ["Medellín", "Bello", "Rionegro"],
    x: 36,
    y: 28,
    translateX: 40,
    translateY: 35,
    scale: 1.45,
  },

  {
    id: "CO-ATL",
    name: "Atlántico",
    color: "#977660",
    sedes: 6,
    salas: 9,
    ciudades: ["Barranquilla"],
    x: 33,
    y: 10,
    translateX: 15,
    translateY: 80,
    scale: 1.45,
  },

  {
    id: "CO-BOY",
    name: "Boyacá",
    color: "#977660",
    sedes: 5,
    salas: 8,
    ciudades: ["Tunja", "Duitama"],
    x: 56,
    y: 30,
    translateX: -40,
    translateY: 25,
    scale: 1.45,
  },

  {
    id: "CO-CAL",
    name: "Caldas",
    color: "#977660",
    sedes: 7,
    salas: 12,
    ciudades: ["Manizales"],
    x: 41,
    y: 31,
    translateX: 20,
    translateY: 20,
    scale: 1.45,
  },

  {
    id: "CO-CAU",
    name: "Cauca",
    color: "#977660",
    sedes: 5,
    salas: 8,
    ciudades: ["Popayán"],
    x: 36,
    y: 47,
    translateX: 30,
    translateY: -20,
    scale: 1.45,
  },

  {
    id: "CO-CHO",
    name: "Chocó",
    color: "#977660",
    sedes: 3,
    salas: 5,
    ciudades: ["Quibdó"],
    x: 22,
    y: 32,
    translateX: 75,
    translateY: 20,
    scale: 1.45,
  },

  {
    id: "CO-CUN",
    name: "Cundinamarca",
    color: "#977660",
    sedes: 10,
    salas: 18,
    ciudades: ["Bogotá", "Soacha"],
    x: 53,
    y: 37,
    translateX: -45,
    translateY: 5,
    scale: 1.45,
  },

  {
    id: "CO-HUI",
    name: "Huila",
    color: "#977660",
    sedes: 6,
    salas: 9,
    ciudades: ["Neiva"],
    x: 49,
    y: 48,
    translateX: -15,
    translateY: -35,
    scale: 1.45,
  },

  {
    id: "CO-PUT",
    name: "Putumayo",
    color: "#977660",
    sedes: 3,
    salas: 5,
    ciudades: ["Mocoa"],
    x: 47,
    y: 63,
    translateX: -10,
    translateY: -80,
    scale: 1.55,
  },

  {
    id: "CO-QUI",
    name: "Quindío",
    color: "#977660",
    sedes: 6,
    salas: 8,
    ciudades: ["Armenia"],
    x: 39,
    y: 37,
    translateX: 25,
    translateY: 5,
    scale: 1.55,
  },

  {
    id: "CO-RIS",
    name: "Risaralda",
    color: "#977660",
    sedes: 9,
    salas: 14,
    ciudades: ["Pereira", "Dosquebradas"],
    x: 38,
    y: 33,
    translateX: 30,
    translateY: 15,
    scale: 1.55,
  },

  {
    id: "CO-SAN",
    name: "Santander",
    color: "#977660",
    sedes: 8,
    salas: 11,
    ciudades: ["Bucaramanga"],
    x: 61,
    y: 24,
    translateX: -70,
    translateY: 30,
    scale: 1.45,
  },

  {
    id: "CO-TOL",
    name: "Tolima",
    color: "#977660",
    sedes: 6,
    salas: 10,
    ciudades: ["Ibagué"],
    x: 47,
    y: 40,
    translateX: -15,
    translateY: -5,
    scale: 1.45,
  },

  {
    id: "CO-VAL",
    name: "Valle del Cauca",
    color: "#977660",
    sedes: 28,
    salas: 54,
    ciudades: ["Cali", "Palmira", "Cartago", "Zarzal", "Tuluá", "Buga"],
    x: 31,
    y: 40,
    translateX: 50,
    translateY: -5,
    scale: 1.55,
  },
];
