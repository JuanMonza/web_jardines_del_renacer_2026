export type ContactLine = {
  label: string;
  number: string;
  href: string;
  detail?: string;
};

export const CONTACT_INFO = {
  whatsappNumber: '573113906052',
  whatsappDisplay: '+57 311 390 6052',
  whatsappMessage:
    'Hola, quiero recibir informacion sobre los servicios de Jardines del Renacer.',
  deathReportLine: {
    label: 'Reportar fallecimiento',
    number: '311 390 6052',
    href: 'tel:+573113906052',
    detail: 'Atencion inmediata 24/7',
  },
  primaryLine: {
    label: 'Linea principal',
    number: '311 390 6052',
    href: 'tel:+573113906052',
    detail: 'Atencion 24/7',
  },
  regionalLines: [
    {
      label: 'Antioquia y Medellin',
      number: '(604) 431 0645',
      href: 'tel:+576044310645',
    },
    {
      label: 'Eje Cafetero',
      number: '(606) 732 9231',
      href: 'tel:+576067329231',
    },
    {
      label: 'Valle, Caldas y Meta',
      number: '(606) 341 9500',
      href: 'tel:+576063419500',
    },
    {
      label: 'Bogota, Cundinamarca y Tolima',
      number: '(601) 794 8497',
      href: 'tel:+576017948497',
    },
  ] satisfies ContactLine[],
  supportHours: 'Atencion 24 horas',
  locationsHref: '/ubicaciones',
  contactHref: '/contacto',
};

function normalizeWhatsAppNumber(number: string) {
  const digits = number.replace(/\D/g, '');
  return digits.length === 10 ? `57${digits}` : digits;
}

export function buildWhatsAppUrl(
  message = CONTACT_INFO.whatsappMessage,
  whatsappNumber = CONTACT_INFO.whatsappNumber,
) {
  return `https://wa.me/${normalizeWhatsAppNumber(whatsappNumber)}?text=${encodeURIComponent(message)}`;
}
