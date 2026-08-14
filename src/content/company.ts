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
    description: 'Con la fe puesta en Dios, Richard Alexander Restrepo Piedrahita funda Jardines del Renacer en Pereira. El propósito fue ofrecer a las familias de la región una previsión exequial de calidad y a un precio justo. Los primeros planes de protección llegaron a Marsella, Alcalá y Cartago.',
    image: '/images/2000.jpeg',
    iconType: 'flag',
    order: 1,
    active: true,
  },
  {
    id: 2,
    year: '2004',
    title: 'Primera oficina y expansión',
    description: 'Se inaugura la primera oficina en Pereira, con salas de velación propias, abriendo nuevas oportunidades para la prestación de servicios exequiales en el Valle y el Eje Cafetero. Durante este periodo también se consolidan las sedes de Marsella, Alcalá y Cartago, y se adquiere el primer vehículo propio: “La Verdolaga”.',
    image: '/images/images-baners/reseñahistorica.webp',
    iconType: 'trending-up',
    order: 2,
    active: true,
  },
  {
    id: 3,
    year: '2005–2006',
    title: 'Expansión en Quindío',
    description: 'En 2005 se inician labores en Quimbaya. Un año después se consolida la presencia en el departamento del Quindío con la apertura de la oficina administrativa en Armenia.',
    image: '/images/images-baners/reseñahistorica.webp',
    iconType: 'map-pin',
    order: 3,
    active: true,
  },
  {
    id: 4,
    year: '2007',
    title: 'Llegada a Cali y una alegría familiar',
    description: 'Jardines del Renacer llega a Cali con la apertura de una nueva sede. Ese mismo año, en septiembre, nace Manuelita, primera hija de Richard y Adriana, reconocida por la familia como Presidenta Honorífica de la Junta Directiva.',
    image: '/images/2000.jpeg',
    iconType: 'heart',
    order: 4,
    active: true,
  },
  {
    id: 5,
    year: '2008',
    title: 'Consolidación en el Eje Cafetero',
    description: 'Con el propósito de fortalecer la operación en el Eje Cafetero, se abre la sede de Anserma, Caldas, y se adquiere la antigua funeraria El Divino Rostro, con presencia en Risaralda, Arauca y Belén de Umbría.',
    image: '/images/2014.jpeg',
    iconType: 'building-2',
    order: 5,
    active: true,
  },
  {
    id: 6,
    year: '2009',
    title: 'Fortalecimiento en Armenia y Quindío',
    description: 'Se realizan nuevas aperturas en el Quindío y se adquiere la Funeraria Jerusalén de Armenia. Allí se habilitan salas de velación y posteriormente se inicia su proceso de remodelación.',
    image: '/images/images-baners/reseñahistorica.webp',
    iconType: 'landmark',
    order: 6,
    active: true,
  },
  {
    id: 7,
    year: '2012',
    title: 'Nace Renacer Seguros',
    description: 'La compañía crea Renacer Seguros como un mecanismo de apoyo para sus afiliados, ampliando las alternativas y posibilidades de protección para los usuarios.',
    image: '/images/2014.jpeg',
    iconType: 'shield-check',
    order: 7,
    active: true,
  },
  {
    id: 8,
    year: '2013',
    title: 'Llegada a Bogotá',
    description: 'Jardines del Renacer incursiona en el mercado de Cundinamarca con la apertura de una nueva sede en Bogotá, ampliando su presencia en la capital del país.',
    image: '/images/images-baners/reseñahistorica.webp',
    iconType: 'map',
    order: 8,
    active: true,
  },
  {
    id: 9,
    year: '2014',
    title: 'Expansión empresarial y territorial',
    description: 'Se constituye el departamento empresarial para atender este mercado de manera más estructurada. En julio se adquiere Las Exequias, en el Valle del Cauca, con presencia en La Unión, La Victoria, Obando, Toro y Anserma Nuevo. En octubre se adquiere la Funeraria San Agustín, con sedes en Tuluá y Trujillo.',
    image: '/images/2014.jpeg',
    iconType: 'trending-up',
    order: 9,
    active: true,
  },
  {
    id: 10,
    year: '2020',
    title: 'Diez nuevas sedes en Tolima',
    description: 'Jardines del Renacer continúa ampliando su cobertura nacional con la apertura de 10 nuevas sedes en el departamento del Tolima.',
    image: '/images/images-baners/equipo.webp',
    iconType: 'map-pinned',
    order: 10,
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
