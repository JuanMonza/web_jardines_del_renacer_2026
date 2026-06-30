/**
 * Párrafos descriptivos sobre la identidad e historia general de la empresa.
 * Utilizado principalmente en secciones tipo "Quiénes somos".
 */
export const whoWeAreParagraphs = [
  'Con más de 25 años de historia, Jardines del Renacer se ha consolidado dentro del gremio exequial por su acompañamiento a los hogares colombianos en sus momentos más difíciles, brindando a todos sus afiliados servicios exequiales con los más altos estándares de calidad, respeto y dignidad, priorizando la importancia y el valor de cada ser querido.',
  'Nuestro compromiso va más allá de un servicio; buscamos ser un apoyo cercano y humano para las familias, brindando tranquilidad, orientación y respaldo en cada etapa del proceso. Por ello, nos sentimos orgullosos de contar con un equipo capacitado, empático y dispuesto a servir con vocación, asegurando que cada detalle se maneje con el cuidado y la sensibilidad que merece.',
];

/**
 * Principios y lineamientos corporativos. 
 * Contiene la información sobre la Misión y la Visión de la compañía.
 */
export const principles = [
  {
    title: 'Misión',
    content:
      'Somos una empresa que contribuye al mejoramiento económico y social del país, mediante la prestación de servicios exequiales con estándares de calidad que garantizan un servicio digno, confiable y con sentido humano a todos nuestros usuarios.',
  },
  {
    title: 'Visión',
    content:
      'En el año 2030 seremos una empresa líder en el gremio exequial, reconocida a nivel nacional e internacional por su calidad, infraestructura y contribución al mejoramiento sostenible de la calidad de vida de nuestros colaboradores y usuarios, que son y serán siempre nuestra razón de ser.',
  },
];

/**
 * Relato histórico de la creación y expansión de la empresa,
 * dividido en párrafos para fácil maquetación.
 */
export const historyParagraphs = [
  'En el mes de octubre del año 2000 nació un sueño en la ciudad de Pereira: brindar servicios exequiales dignos y accesibles, especialmente a la población más vulnerable. Y aunque, en sus inicios, nuestra empresa no contaba con infraestructura ni parque automotor, sí poseía un fuerte compromiso, vocación de servicio y determinación. Desde entonces, se ha destacado por su cercanía con las familias y por ofrecer beneficios que nos diferencian de otras empresas exequiales.',
  'Con el paso de los años, la organización inició un proceso de crecimiento y expansión, abriendo sedes en diferentes municipios del Eje Cafetero y posteriormente en ciudades como Medellín, Cali, Barranquilla y Bogotá, consolidando su presencia a nivel nacional. Así mismo, fortaleció su operación mediante convenios con funerarias y la apertura de salas de velación a nivel nacional.',
  'Jardines del Renacer ha enfocado sus esfuerzos en la mejora continua, obteniendo reconocimientos por la calidad de su servicio e integrándose a entidades del sector funerario a nivel nacional. Hoy, la organización se posiciona como una empresa sólida, humana y en constante crecimiento, comprometida con acompañar a las familias con dignidad, sensibilidad y confianza, honrando la vida en cada uno de sus procesos.',
];

/**
 * Hitos históricos de la compañía (Línea del tiempo para Reseña Histórica)
 * Estructurado como array de objetos para futura integración con Panel Administrativo.
 */
export const historyTimeline = [
  {
    id: 1,
    year: '2000',
    title: 'El nacimiento de un sueño',
    description: 'En el mes de octubre nació un sueño en la ciudad de Pereira: brindar servicios exequiales dignos y accesibles. Con vocación de servicio y determinación, iniciamos nuestra labor.',
    image: '/images/quiene_somos.jpg',
    iconType: 'flag',
    order: 1,
    active: true,
  },
  {
    id: 2,
    year: '2010',
    title: 'Crecimiento y expansión',
    description: 'Iniciamos un proceso de expansión, abriendo sedes en el Eje Cafetero y posteriormente en ciudades como Medellín, Cali, Barranquilla y Bogotá, consolidando nuestra presencia a nivel nacional.',
    image: '/images/quiene_somos.jpg', // Placeholder intercambiable desde el admin
    iconType: 'trending-up',
    order: 2,
    active: true,
  },
  {
    id: 3,
    year: '2024',
    title: 'Consolidación y mejora continua',
    description: 'Hoy nos posicionamos como una empresa sólida, humana y en constante crecimiento, comprometida con acompañar a las familias con dignidad, sensibilidad y confianza.',
    image: '/images/quiene_somos.jpg', // Placeholder intercambiable desde el admin
    iconType: 'star',
    order: 3,
    active: true,
  }
];

/**
 * Lista de valores que forman parte integral de la cultura y la ética 
 * de trabajo en la compañía.
 */
export const corporateValues = [
  {
    name: 'Honestidad',
    description: 'Actuamos con transparencia, integridad y rectitud en todas nuestras interacciones.',
  },
  {
    name: 'Respeto',
    description: 'Valoramos la dignidad de cada persona, tratando a familias y colaboradores con empatía y consideración.',
  },
  {
    name: 'Calidad Humana',
    description: 'Brindamos un servicio cercano y compasivo, entendiendo las necesidades emocionales de quienes confían en nosotros.',
  },
  {
    name: 'Cumplimiento',
    description: 'Nos comprometemos a cumplir nuestras promesas y a operar con los más altos estándares de calidad y profesionalismo.',
  },
  {
    name: 'Responsabilidad social',
    description: 'Contribuimos activamente al bienestar de la comunidad y al cuidado del medio ambiente en todas nuestras operaciones.',
  },
];
