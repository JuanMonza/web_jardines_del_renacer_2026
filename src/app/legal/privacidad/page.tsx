import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import Link from 'next/link';

type PolicySection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const companyData = {
  legalName: 'JARDINES DEL RENACER S.A.S.',
  nit: '900.340.724-7',
  address: 'Carrera 6 No. 26-05, Pereira, Colombia',
  email: 'servicioalcliente@jardinesdelrenacer.com',
  phone: '(6) 3290518',
  responsibleArea: 'Oficial de Proteccion de Datos Personales - Servicio al Cliente',
  validFrom: '03 de febrero de 2021',
  lastUpdate: '09 de abril de 2026',
};

const privacySections: PolicySection[] = [
  {
    title: '1. Marco normativo',
    paragraphs: [
      'Esta politica se adopta en cumplimiento de la Ley 1581 de 2012, el Decreto 1377 de 2013 y las demas normas que las modifiquen, adicionen o sustituyan, incluyendo su compilacion en el Decreto 1074 de 2015.',
    ],
  },
  {
    title: '2. A quienes aplica',
    paragraphs: [
      'Aplica al tratamiento de datos personales de usuarios no clientes, clientes, representantes, proveedores, postulantes y demas titulares cuyos datos sean recolectados por medios digitales o fisicos.',
    ],
  },
  {
    title: '3. Datos que recolectamos',
    paragraphs: [
      'Podemos recolectar datos de identificacion, contacto y datos necesarios para la ejecucion de solicitudes, cotizaciones, servicios, reclamaciones y obligaciones legales.',
    ],
    bullets: [
      'Nombre y apellidos',
      'Documento de identificacion',
      'Correo electronico',
      'Telefono y direccion',
      'Datos de servicio, facturacion y trazabilidad',
      'Datos adjuntos voluntarios en formularios (por ejemplo, hoja de vida en postulaciones)',
    ],
  },
  {
    title: '4. Finalidades del tratamiento',
    paragraphs: [
      'La informacion personal se utiliza para gestionar atencion al usuario, cotizaciones, prestacion de servicios, seguimiento, soporte, gestion administrativa, cumplimiento legal y contractual, y respuesta a PQR.',
      'Si el titular lo autoriza de manera expresa, los datos de contacto podran incluirse en bases de prospeccion comercial para envio de novedades, promociones, beneficios y encuestas de satisfaccion.',
    ],
  },
  {
    title: '5. Datos sensibles y de menores',
    paragraphs: [
      'El suministro de datos sensibles es facultativo. Cuando se requieran, se solicitara autorizacion previa, expresa e informada, indicando su finalidad concreta.',
      'No se recolectan deliberadamente datos de menores de edad sin autorizacion del representante legal cuando sea exigible.',
    ],
  },
  {
    title: '6. Transferencia y transmision a terceros',
    paragraphs: [
      'JARDINES DEL RENACER puede compartir datos con encargados, aliados estrategicos y proveedores tecnologicos dentro o fuera del pais, unicamente para finalidades autorizadas o legalmente permitidas.',
      'En estos casos se exigiran deberes de confidencialidad, seguridad y cumplimiento de la normativa de proteccion de datos.',
    ],
  },
  {
    title: '7. Seguridad de la informacion',
    paragraphs: [
      'Se aplican medidas tecnicas, humanas y administrativas razonables para proteger la informacion contra perdida, uso indebido, acceso no autorizado, alteracion o destruccion.',
      'Ninguna medida es infalible; sin embargo, se mantienen controles de mejora continua y gestion de incidentes.',
    ],
  },
  {
    title: '8. Vigencia y conservacion de las bases de datos',
    paragraphs: [
      'Las bases de datos estaran vigentes mientras sean necesarias para cumplir las finalidades informadas y mientras exista deber legal o contractual de conservacion.',
      'Una vez desaparezca la finalidad y no exista obligacion legal de conservar la informacion, los datos seran eliminados o anonimizados.',
    ],
  },
  {
    title: '9. Derechos de los titulares',
    paragraphs: [
      'De conformidad con el articulo 8 de la Ley 1581 de 2012, el titular puede conocer, actualizar, rectificar y suprimir sus datos, solicitar prueba de autorizacion, revocar autorizaciones cuando proceda y presentar quejas ante la SIC.',
    ],
  },
  {
    title: '10. Procedimiento para consultas y reclamos',
    paragraphs: [
      'Las consultas y reclamos deben enviarse al correo oficial o por escrito a la direccion del responsable, indicando identificacion del titular, descripcion de la solicitud y datos de contacto.',
      'Las consultas se responderan en un plazo maximo de diez (10) dias habiles. Los reclamos se atenderan en un plazo maximo de quince (15) dias habiles, de acuerdo con los terminos legales aplicables.',
    ],
  },
  {
    title: '11. Cookies y tecnologias similares',
    paragraphs: [
      'El sitio puede usar cookies, web beacons y recoleccion de direccion IP para funcionamiento del portal, seguridad, analitica y mejora de experiencia.',
      'El detalle de categorias, finalidades y administracion del consentimiento se encuentra en la Politica de Cookies.',
    ],
  },
  {
    title: '12. Actualizaciones de la politica',
    paragraphs: [
      'JARDINES DEL RENACER podra actualizar esta politica por cambios normativos, operativos o de mejora de procesos. Las versiones vigentes se publicaran en el sitio web.',
    ],
  },
];

export default function PrivacidadPage() {
  return (
    <>
      <section className="py-20 bg-gradient-to-b from-background to-white/60">
        <Container>
          <FadeIn>
            <SectionTitle
              title="Politica de Privacidad"
              subtitle="Tratamiento responsable de datos personales conforme a la normativa colombiana."
            />
          </FadeIn>
        </Container>
      </section>

      <section className="pb-20">
        <Container maxWidth="lg">
          <FadeIn>
            <article className="glass rounded-2xl p-6 border border-primary/15 mb-5">
              <h3 className="text-lg font-semibold text-text mb-3">Responsable del tratamiento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-textLight">
                <p>
                  <span className="font-semibold text-text">Razon social:</span>{' '}
                  {companyData.legalName}
                </p>
                <p>
                  <span className="font-semibold text-text">NIT:</span> {companyData.nit}
                </p>
                <p>
                  <span className="font-semibold text-text">Direccion:</span>{' '}
                  {companyData.address}
                </p>
                <p>
                  <span className="font-semibold text-text">Telefono:</span> {companyData.phone}
                </p>
                <p className="md:col-span-2">
                  <span className="font-semibold text-text">Correo:</span> {companyData.email}
                </p>
                <p className="md:col-span-2">
                  <span className="font-semibold text-text">Area responsable:</span>{' '}
                  {companyData.responsibleArea}
                </p>
              </div>
            </article>
          </FadeIn>

          <div className="space-y-4">
            {privacySections.map((section, index) => (
              <FadeIn key={section.title} delay={index * 0.04}>
                <article className="glass rounded-2xl p-6 border border-primary/15">
                  <h3 className="text-lg font-semibold text-text mb-3">{section.title}</h3>
                  <div className="space-y-3">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="text-textLight leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  {section.bullets && section.bullets.length > 0 && (
                    <ul className="mt-4 space-y-2 text-sm text-textLight list-disc pl-5">
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </article>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <article className="glass rounded-2xl p-6 border border-primary/15 mt-5">
              <p className="text-sm text-textLight leading-relaxed">
                Para conocer mas sobre navegacion y consentimiento, consulta nuestra{' '}
                <Link href="/legal/cookies" className="text-primary font-semibold hover:underline">
                  Politica de Cookies
                </Link>{' '}
                y los{' '}
                <Link href="/legal/terminos" className="text-primary font-semibold hover:underline">
                  Terminos y Condiciones
                </Link>
                .
              </p>
              <p className="text-xs text-textLight mt-3">
                Vigencia inicial: {companyData.validFrom} | Ultima actualizacion:{' '}
                {companyData.lastUpdate}
              </p>
            </article>
          </FadeIn>
        </Container>
      </section>
    </>
  );
}
