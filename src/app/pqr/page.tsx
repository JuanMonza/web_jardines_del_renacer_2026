'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import PageHero from '@/components/ui/PageHero';

export default function PQRPage() {
    // Estado de React para manejar los datos del formulario de manera controlada y reactiva
    const [formData, setFormData] = useState({
        nombre: '',
        tipoDocumento: 'C.C',
        cedula: '',
        email: '',
        telefono: '',
        tipoSolicitud: 'Petición',
        mensaje: '',
    });
    const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMailModal, setShowMailModal] = useState(false);
    const [mailLinks, setMailLinks] = useState({ default: '', gmail: '', outlook: '' });

    const handleSubmit = (e: React.FormEvent) => {
        // Prevenimos el comportamiento por defecto de recargar la página al enviar el formulario
        e.preventDefault();
        setFeedback(null); // Limpiamos cualquier notificación anterior
        setIsSubmitting(true);

        // --- CIBERSEGURIDAD Y VALIDACIÓN DE DATOS ---

        // 1. Sanitización básica (Prevención XSS): Eliminamos caracteres conflictivos como < y > 
        // que los atacantes usan para intentar inyectar código HTML/JavaScript malicioso.
        const sanitize = (str: string) => str.replace(/[<>]/g, '').trim();

        const sanitizedNombre = sanitize(formData.nombre);
        const sanitizedEmail = sanitize(formData.email);
        const sanitizedMensaje = sanitize(formData.mensaje);

        // 2. Sanitización estricta: Eliminamos todo lo que no sea un número para la cédula
        const sanitizedCedula = sanitize(formData.cedula).replace(/\D/g, '');

        // 3. Sanitización estricta: Permitimos solo números, espacios, guiones y el signo + para el teléfono
        const sanitizedTelefono = sanitize(formData.telefono).replace(/[^0-9+\s-]/g, '');

        // 4. Validación de campos obligatorios post-sanitización
        // Evita que envíen campos llenos de espacios vacíos o caracteres inválidos
        if (!sanitizedNombre || !sanitizedCedula || !sanitizedEmail || !sanitizedMensaje) {
            setFeedback({ type: 'error', text: 'Por favor, completa todos los campos con información válida.' });
            setIsSubmitting(false);
            return;
        }

        // 5. Validación segura de correo mediante Regex
        // Verifica que el correo tenga el formato correcto (usuario@dominio.com)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(sanitizedEmail)) {
            setFeedback({ type: 'error', text: 'Por favor, ingresa un correo electrónico válido y verificado.' });
            setIsSubmitting(false);
            return;
        }

        // --- CONSTRUCCIÓN DEL MENSAJE SECURE ---

        // 6. Construir el asunto y el cuerpo usando encodeURIComponent
        // Esto codifica el texto en formato URL (ej. los espacios se vuelven %20).
        // Protege contra la "Inyección de Cabeceras", evitando que rompan la estructura del "mailto:"

        const subject = encodeURIComponent(`Nueva ${formData.tipoSolicitud} - ${sanitizedNombre}`);
        const body = encodeURIComponent(
            `Tipo de Solicitud: ${formData.tipoSolicitud}\n` +
            `Nombre Completo: ${sanitizedNombre}\n` +
            `Documento: ${formData.tipoDocumento} ${sanitizedCedula}\n` +
            `Email: ${sanitizedEmail}\n` +
            `Teléfono: ${sanitizedTelefono}\n\n` +
            `Detalle de la Solicitud:\n${sanitizedMensaje}\n\n` +
            `------------------------------------------\n` +
            `Enviado desde el formulario PQR de la web.`
        );

        setFeedback({ type: 'success', text: '¡Datos procesados! Por favor, selecciona la aplicación de correo para enviar tu solicitud.' });

        // 7. Configurar links y mostrar el Modal Premium
        setTimeout(() => {
            setMailLinks({
                gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=servicioalcliente@jardinesdelrenacer.com&su=${subject}&body=${body}`,
                outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=servicioalcliente@jardinesdelrenacer.com&subject=${subject}&body=${body}`,
                default: `mailto:servicioalcliente@jardinesdelrenacer.com?subject=${subject}&body=${body}`
            });
            setIsSubmitting(false);
            setShowMailModal(true);
        }, 1000);
    };

    return (
        <>
            <PageHero
                title="Peticiones, Quejas y Reclamos"
                subtitle="Tu opinión es fundamental. Déjanos tus inquietudes y te daremos respuesta a la mayor brevedad posible."
                image="/images/images-baners/contacto.webp"
                imageAlt="PQR - Jardines del Renacer"
            />

            <section className="pb-24">
                <Container maxWidth="md">
                    <FadeIn delay={0.1}>
                        <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 md:p-12 border border-primary/15 shadow-xl">
                            <h2 className="text-2xl font-display text-text mb-6">Formulario de Radicación</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                <Input
                                    label="Nombres y Apellidos"
                                    placeholder="Ej. Juan Pérez"
                                    value={formData.nombre}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Permite exclusivamente letras y espacios
                                        if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(val)) {
                                            setFormData({ ...formData, nombre: val });
                                        }
                                    }}
                                    required
                                />
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-text mb-2">Documento de Identidad</label>
                                    <div className="flex gap-3 w-full">
                                        <select
                                            value={formData.tipoDocumento}
                                            onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                                            className="w-[110px] shrink-0 px-3 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                                        >
                                            <option value="C.C">C.C</option>
                                            <option value="C.E">C.E</option>
                                            <option value="P.E.P">P.E.P</option>
                                            <option value="Pasaporte">Pasaporte</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Número..."
                                            value={formData.cedula}
                                            onChange={(e) => setFormData({ ...formData, cedula: e.target.value.replace(/\D/g, '') })}
                                            required
                                            className="w-full flex-1 min-w-0 px-4 py-3 rounded-xl glass border border-border text-text placeholder:text-textLight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                                        />
                                    </div>
                                </div>
                                <Input
                                    label="Correo Electrónico"
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Teléfono de Contacto"
                                    type="tel"
                                    placeholder="Ej. 300 123 4567"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-text mb-2">Tipo de Solicitud</label>
                                <select
                                    value={formData.tipoSolicitud}
                                    onChange={(e) => setFormData({ ...formData, tipoSolicitud: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 bg-white/50"
                                    required
                                >
                                    <option value="Petición">Petición</option>
                                    <option value="Queja">Queja</option>
                                    <option value="Reclamo">Reclamo</option>
                                    <option value="Sugerencia">Sugerencia</option>
                                    <option value="Felicitación">Felicitación</option>
                                </select>
                            </div>

                            <div className="mb-8">
                                <Textarea
                                    label="Mensaje o Detalle (Solo letras)"
                                    placeholder="Describe tu solicitud (no se permiten números ni símbolos)..."
                                    value={formData.mensaje}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        // Permite exclusivamente letras, saltos de línea y espacios
                                        if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\n\r]*$/.test(val)) {
                                            setFormData({ ...formData, mensaje: val });
                                        }
                                    }}
                                    required
                                    rows={5}
                                />
                            </div>

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
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className="text-sm font-semibold leading-relaxed">{feedback.text}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-4 flex-wrap pt-6 border-t border-primary/10">
                                <p className="text-xs text-textLight max-w-xs">
                                    Al enviar este formulario, aceptas nuestra Política de Privacidad y el tratamiento de tus datos personales.
                                </p>
                                <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Procesando...
                                        </span>
                                    ) : (
                                        'Enviar Solicitud PQR'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </FadeIn>
                </Container>
            </section>

            {/* Modal Premium de selección de correo */}
            {showMailModal && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowMailModal(false)}
                >
                    <div
                        className="glass rounded-3xl border-2 border-primary/30 p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowMailModal(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-display text-text">Elige tu correo</h3>
                            <p className="text-textLight mt-2 text-sm">
                                Para garantizar la entrega y darte una mejor atención, selecciona tu aplicación de correo favorita para enviar la solicitud.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <a
                                href={mailLinks.gmail}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-colors bg-white shadow-sm"
                                onClick={() => setShowMailModal(false)}
                            >
                                <div className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-full font-bold text-lg">G</div>
                                <div className="font-semibold text-gray-700">Abrir con Gmail (Web)</div>
                            </a>

                            <a
                                href={mailLinks.outlook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-4 rounded-2xl border border-blue-200 hover:bg-blue-50 transition-colors bg-white shadow-sm"
                                onClick={() => setShowMailModal(false)}
                            >
                                <div className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 rounded-full font-bold text-lg">O</div>
                                <div className="font-semibold text-blue-700">Abrir con Outlook (Web)</div>
                            </a>

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
                                <div className="font-semibold text-primary text-sm">Aplicación por defecto (Mail, App, etc)</div>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
