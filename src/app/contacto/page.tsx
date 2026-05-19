'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { CONTACT_INFO, buildWhatsAppUrl } from '@/config/contact';

export default function ContactoPage() {
  // ---------------------------------------------------------------------------
  // 1. ESTADO DEL FORMULARIO (STATE MANAGEMENT)
  // ---------------------------------------------------------------------------
  // Aquí almacenamos los datos que el usuario va escribiendo en tiempo real.
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: 'Información General',
    mensaje: '',
  });
  
  // Estado para mostrar notificaciones (éxito o error) en formato de tarjeta
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  // Estado para mostrar el spinner de "Procesando..." y evitar dobles clics
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Estado para controlar la visibilidad de nuestro modal premium de correo
  const [showMailModal, setShowMailModal] = useState(false);
  // Estado para almacenar los links dinámicos que abrirán Outlook, Gmail o el correo nativo
  const [mailLinks, setMailLinks] = useState({ default: '', gmail: '', outlook: '' });

  // ---------------------------------------------------------------------------
  // 2. LÓGICA DE ENVÍO Y CIBERSEGURIDAD (SUBMIT HANDLER)
  // ---------------------------------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    // Evita que el navegador recargue la página al hacer click en enviar
    e.preventDefault();
    setFeedback(null); // Limpiamos alertas previas
    setIsSubmitting(true); // Encendemos la animación de carga
    
    // --- SANITIZACIÓN DE DATOS (Prevención XSS) ---
    // Función que elimina las etiquetas HTML (< >) para que un atacante no pueda inyectar código JavaScript malicioso.
    const sanitize = (str: string) => str.replace(/[<>]/g, '').trim();
    
    const sanitizedNombre = sanitize(formData.nombre);
    const sanitizedEmail = sanitize(formData.email);
    const sanitizedMensaje = sanitize(formData.mensaje);
    
    // Sanitización estricta de teléfono: solo permite números, espacios y el símbolo '+'. 
    // Si alguien intenta meter letras a la fuerza modificando el HTML, aquí se eliminan.
    const sanitizedTelefono = sanitize(formData.telefono).replace(/[^0-9+\s-]/g, ''); 

    // --- VALIDACIONES OBLIGATORIAS ---
    // Verifica que los campos no estén conformados por puros espacios en blanco.
    if (!sanitizedNombre || !sanitizedEmail || !sanitizedMensaje) {
      setFeedback({ type: 'error', text: 'Por favor, completa todos los campos requeridos.' });
      setIsSubmitting(false);
      return;
    }

    // Validación segura de correo mediante Expresión Regular (Regex)
    // Garantiza que la estructura sea obligatoriamente usuario@dominio.com
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitizedEmail)) {
      setFeedback({ type: 'error', text: 'Por favor, ingresa un correo electrónico válido.' });
      setIsSubmitting(false);
      return;
    }

    // --- CONSTRUCCIÓN DEL MENSAJE SEGURO ---
    // El correo corporativo oficial a donde llegarán los mensajes de contacto
    const destinationEmail = 'servicioalcliente@jardinesdelrenacer.com'; 
    
    // Utilizamos 'encodeURIComponent' para transformar saltos de línea y acentos en un formato 
    // entendible por la URL del correo, previniendo también "Header Injection".
    const subject = encodeURIComponent(`Contacto Web: ${formData.asunto} - ${sanitizedNombre}`);
    const body = encodeURIComponent(
      `Asunto: ${formData.asunto}\n` +
      `Nombre Completo: ${sanitizedNombre}\n` +
      `Email: ${sanitizedEmail}\n` +
      `Teléfono: ${sanitizedTelefono}\n\n` +
      `Mensaje:\n${sanitizedMensaje}\n\n` +
      `------------------------------------------\n` +
      `Enviado de forma segura desde la web.`
    );
    
    // Retroalimentación visual de éxito
    setFeedback({ type: 'success', text: '¡Todo en orden! Por favor, selecciona tu aplicación de correo para enviar.' });

    // ---------------------------------------------------------------------------
    // 3. GENERACIÓN DE ENLACES PARA EL MODAL DE CORREO
    // ---------------------------------------------------------------------------
    // Utilizamos un timeout de 1 segundo para que la alerta verde sea apreciada por el usuario
    setTimeout(() => {
      setMailLinks({
        // Enlace especial para abrir la redacción de Gmail directamente en el navegador
        gmail: `<https://mail.google.com/mail/?view=cm&fs=1&to=${destinationEmail}&su=${subject}&body=${body}>`,
        // Enlace especial para abrir la redacción de Outlook (Hotmail/Live) en el navegador
        outlook: `<https://outlook.live.com/mail/0/deeplink/compose?to=${destinationEmail}&subject=${subject}&body=${body}>`,
        // Enlace clásico (mailto) que abre la aplicación predeterminada del teléfono o computadora (Ej: Mail en Mac/iPhone)
        default: `mailto:${destinationEmail}?subject=${subject}&body=${body}`
      });
      setIsSubmitting(false); // Apagamos el estado de carga
      setShowMailModal(true); // Disparamos la apertura de nuestro modal premium
    }, 1000);
  };

  return (
    <>
      {/* ----------------------------------------------------------------------
          HEADER / BANNER PRINCIPAL
      ---------------------------------------------------------------------- */}
      <section className="pt-10 pb-10">
        <Container>
          <div className="relative py-20 mb-8 rounded-3xl overflow-hidden bg-[url('/images/contactanos.jpg')] bg-cover bg-center bg-no-repeat shadow-sm border border-primary/10">
            <div className="relative z-10">
              <FadeIn>
                <SectionTitle
                  title="Contáctanos"
                  subtitle="Estamos aquí para escucharte y resolver todas tus inquietudes con la calidez que nos caracteriza."
                />
              </FadeIn>
            </div>
          </div>
        </Container>
      </section>

      {/* ----------------------------------------------------------------------
          CUERPO: TARJETAS INFORMATIVAS Y FORMULARIO (GRILLA DIVIDIDA)
      ---------------------------------------------------------------------- */}
      <section className="pb-24">
        <Container maxWidth="2xl">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-10 items-start">
            
            {/* ===== COLUMNA IZQUIERDA: TARJETAS DE ACCESO RÁPIDO ===== */}
            <FadeIn delay={0.1}>
              <div className="space-y-6">
                
                {/* Tarjeta de Llamadas */}
                <div className="glass rounded-3xl p-8 border border-primary/15 hover:shadow-glass-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 8V5z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-display text-text mb-2">Línea de Atención</h3>
                  <p className="text-textLight mb-4 text-sm">Comunícate con nuestros asesores telefónicos disponibles para ti.</p>
                  <a href={CONTACT_INFO.primaryLine.href} className="text-lg font-bold text-primary hover:underline block">
                    {CONTACT_INFO.primaryLine.number}
                  </a>
                </div>

                {/* Tarjeta de WhatsApp */}
                <div className="glass rounded-3xl p-8 border border-primary/15 hover:shadow-glass-lg transition-all duration-300">
                  <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center text-[#25D366] mb-4">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-display text-text mb-2">WhatsApp</h3>
                      <p className="text-textLight mb-4 text-sm">Respuesta ágil a través de nuestro canal corporativo.</p>
                      <a href={buildWhatsAppUrl('Hola Jardines del Renacer, me comunico desde la página de Contacto.')} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-[#25D366] hover:underline block">
                        Iniciar chat
                      </a>
                    </div>
                  </div>
                </FadeIn>

                {/* ===== COLUMNA DERECHA: FORMULARIO SEGURO ===== */}

                <FadeIn delay={0.2}>
                  <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 md:p-10 border border-primary/15 shadow-xl">
                    <h2 className="text-2xl font-display text-text mb-6">Déjanos tu mensaje</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <Input
                        label="Nombre Completo"
                        placeholder="Ej. María Gómez"
                        value={formData.nombre}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Validador FrontEnd en vivo: Solo permite tipear letras y espacios (bloquea números instantáneamente)
                          if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(val)) {
                            setFormData({ ...formData, nombre: val });
                          }
                        }}
                        required
                      />
                      <Input
                        label="Correo Electrónico"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      <Input
                        label="Teléfono de Contacto"
                        type="tel"
                        placeholder="Ej. 300 123 4567"
                        value={formData.telefono}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Validador FrontEnd en vivo: Solo permite números y espacios en tiempo real
                          if (/^[0-9+\s-]*$/.test(val)) {
                            setFormData({ ...formData, telefono: val });
                          }
                        }}
                        required
                      />
                      {/* SELECTOR DE ASUNTO ADAPTADO PARA CONTACTO GENERAL */}
                      <div className="w-full">
                        <label className="block text-sm font-medium text-text mb-2">Asunto o Área</label>
                        <select
                          value={formData.asunto}
                          onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                          required
                        >
                          <option value="Información General">Información General</option>
                          <option value="Cotización de Planes">Cotización de Planes</option>
                          <option value="Servicio al Cliente">Soporte y Servicio al Cliente</option>
                          <option value="Alianzas Comerciales">Alianzas Comerciales</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-8">
                      <Textarea
                        label="Mensaje (Solo texto)"
                        placeholder="Escribe tu consulta aquí..."
                        value={formData.mensaje}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Bloquea inyección de códigos y caracteres extraños, permitiendo solo signos de puntuación normales
                          if (/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ.,;:¡!¿?\s\n\r-]*$/.test(val)) {
                            setFormData({ ...formData, mensaje: val });
                          }
                        }}
                        required
                        rows={5}
                      />
                    </div>

                    {/* RENDERING CONDICIONAL DE LA NOTIFICACIÓN (Feedback estilo Glass) */}
                    {feedback && (
                      <div
                        className={cn(
                          "mb-6 p-5 rounded-2xl flex items-center gap-4 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500",
                          feedback.type === 'error' 
                            ? "bg-red-50/80 backdrop-blur-md border border-red-500/30 shadow-[0_8px_30px_rgba(239,68,68,0.15)] text-red-800"
                            : "bg-green-50/80 backdrop-blur-md border border-green-500/30 shadow-[0_8px_30px_rgba(34,197,94,0.15)] text-green-800"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center shadow-inner",
                          feedback.type === 'error' ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                        )}>
                          {feedback.type === 'error' ? (
                            // Ícono X para errores
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            // Ícono Check para éxito
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm font-semibold leading-relaxed">{feedback.text}</p>
                      </div>
                    )}

                    {/* BOTÓN CON ANIMACIÓN DE SPINNER DE CARGA */}
                    <div className="flex items-center justify-end border-t border-primary/10 pt-6">
                      <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            {/* SVG Spinner animado */}
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Procesando...
                          </span>
                        ) : (
                          'Enviar Mensaje'
                        )}
                      </Button>
                    </div>
                  </form>
                </FadeIn>
              </div>
            </Container>
          </section>

          {/* =========================================================================
              MODAL PREMIUM DE SELECCIÓN DE APLICACIÓN DE CORREO
              Esta ventana se sobrepone (z-50) bloqueando el fondo para enfocar al usuario.
          ========================================================================= */}
          {showMailModal && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowMailModal(false)} // Si el usuario toca el fondo oscuro, se cierra el modal
            >
              <div 
                className="glass rounded-3xl border-2 border-primary/30 p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300 bg-white"
                onClick={(e) => e.stopPropagation()} // Evita que si tocas la caja blanca, se cierre el modal por accidente
              >
                {/* Botón clásico de X en la esquina superior derecha */}
                <button
                  onClick={() => setShowMailModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Cabecera del modal */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-display text-text">Envío Garantizado</h3>
                  <p className="text-textLight mt-2 text-sm">
                    Para que nuestro equipo reciba tu mensaje directamente, selecciona por favor tu aplicación de correo favorita.
                  </p>
                </div>

                {/* Botones de acción hacia las Apps */}
                <div className="flex flex-col gap-3">
                  
                  {/* Opción 1: Abrir en Gmail Web */}
                  <a 
                    href={mailLinks.gmail} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                    onClick={() => setShowMailModal(false)} // Cierra el modal justo después de hacer clic
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-full font-bold text-lg">G</div>
                    <div className="font-semibold text-gray-700">Abrir con Gmail (Navegador)</div>
                  </a>

                  {/* Opción 2: Abrir en Outlook Web */}
                  <a 
                    href={mailLinks.outlook} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-4 p-4 rounded-2xl border border-blue-200 hover:bg-blue-50 transition-colors bg-white shadow-sm"
                    onClick={() => setShowMailModal(false)}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full font-bold text-lg">O</div>
                    <div className="font-semibold text-blue-700">Abrir con Outlook (Navegador)</div>
                  </a>

                  {/* Opción 3: Disparar el Mailto clásico del sistema (Outlook Desktop, Mail de iOS/Mac) */}
                  <a 
                    href={mailLinks.default} 
                    className="flex items-center gap-4 p-4 rounded-2xl border border-primary/20 hover:bg-primary/5 transition-colors glass shadow-sm mt-2"
                    onClick={() => setShowMailModal(false)}
                  >
                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="font-semibold text-primary text-sm">Aplicación de Correo del Sistema</div>
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      );
    }
