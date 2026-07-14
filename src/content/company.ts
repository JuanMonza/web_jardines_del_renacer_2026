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
    description: 'Con la fe puesta en Dios el Sr. Richard Alexander Restrepo Piedrahita, fundador, aprovecha todos sus conocimientos y capacidades para así crear empresa, así nace Jardines del Renacer, funeraria, ubicada en la ciudad de Pereira con el fin de suplir la necesidad que tenían los estratos vulnerables de la región para adquirir una previsión exequial de calidad y a un precio justo. Inicialmente se crearon planes para la protección de las familias en los municipios de Marsella, Alcalá y Cartago.',
    image: '/images/2000.jpeg', // Placeholder intercambiable desde el admin
    iconType: 'flag',
    order: 1,
    active: true,
  },
  {
    id: 2,
    year: '2004',
    title: 'Crecimiento y expansión',
    description: 'Se dio apertura a la primera oficina en la ciudad de Pereira y esta contaba con salas de velación propias, abriendo así puertas y oportunidades, e iniciando un buen camino en la prestación de servicios exequiales para la protección de las familias del Valle y Eje Cafetero. \n\nY el sueño siguió creciendo, para este año se hicieron más aperturas de sedes en el siguiente orden, Marsella, Alcalá y por último Cartago, también se realizó la compra del primer vehículo propio al cual se llamó “La verdolaga”.',
    image: '/images/images-baners/reseñahistorica.webp', // Placeholder intercambiable desde el admin
    iconType: 'trending-up',
    order: 2,
    active: true,
  },
  {
    id: 4,
    year: '2014',
    title: 'Nuevos Horizontes y Servicios',
    description: 'Se constituye el departamento empresarial, incursionando de una forma más estructurada en este mercado.En el mes de Julio y para más expansión se compra la empresa Las Exequias, ubicada en el Valle del Cauca, con presencia en La Unión, La Victoria, Obando, Toro y Anserma Nuevo.Ya para octubre se compra también la funeraria San Agustín con sedes en Tuluá (Valle del Caúca y Trujillo).',
    image: '/images/2014.jpeg', // Placeholder intercambiable desde el admin
    iconType: 'sparkles',
    order: 3,
    active: true,
  },
  {
    id: 6,
    year: '2023',
    title: 'Creación del Parque Conmemorativo',
    description: 'Se materializa uno de nuestros proyectos más anhelados: la creación del Parque Conmemorativo, un espacio sagrado y natural diseñado para honrar la memoria, celebrar la vida y ofrecer a las familias un lugar de paz y trascendencia.',
    image: '/images/parque-conmemorativo-2026.webp',
    iconType: 'leaf',
    order: 4,
    active: true,
  },
  {
    id: 3,
    year: '2024',
    title: 'Consolidación y mejora continua',
    description: 'Hoy nos posicionamos como una empresa sólida, humana y en constante crecimiento, comprometida con acompañar a las familias con dignidad, sensibilidad y confianza.',
    image: '/images/2014.jpeg', // Placeholder intercambiable desde el admin
    iconType: 'star',
    order: 5,
    active: true,
  },
  {
    id: 5,
    year: '2026',
    title: 'Innovación y Futuro Digital',
    description: 'Lanzamiento de nuestra nueva plataforma digital, integrando recorridos virtuales 360°, cotización en línea y un portal de aliados mejorado, reafirmando nuestro compromiso con la innovación y la accesibilidad para todas las familias.',
    image: '/images/futuro-digital-2026.webp',
    iconType: 'rocket',
    order: 6,
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
