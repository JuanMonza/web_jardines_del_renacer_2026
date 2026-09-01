"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import { buildWhatsAppUrl } from "@/config/contact";

export default function Footer() {
  const [newsletter, setNewsletter] = useState({
    nombre: "",
    apellido: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const currentYear = new Date().getFullYear();

  // 1. Dominios de correo permitidos para validación estricta
  const allowedDomains = ["gmail.com", "icloud.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com"];
  const isValidEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return allowedDomains.includes(domain);
  };

  const footerLinks = {
    conocenos: [
      { label: "Quiénes Somos", href: "/servicios/quienes-somos" },
      { label: "Reseña Histórica", href: "/servicios/resena-historica" },
      {
        label: "Emplearte",
        href: "/servicios/trabaja-con-nosotros",
      },
      { label: "Afíliate Ya", href: "/cotizar" },
    ],
    atencion: [
      { label: "Obituarios", href: "/obituarios" },
      { label: "Agendar Visita", href: "/agendar-visita" },
      { label: "Medios de Pago", href: "https://checkout.wompi.co/l/mjP6uJ" },
      { label: "Contacto", href: "/contacto" },
    ],
    recursos: [
      { label: "Planes", href: "/planes" },
      { label: "Recorrido 360°", href: "/recorrido-360" },
      { label: "Parque Conmemorativo", href: "/parque-conmemorativo" },
      { label: "Repatriaciones", href: "/repatriaciones" },
      { label: "Acompañamiento Digital", href: "/proximamente" },
      { label: "Florería", href: "/proximamente" },
      { label: "Club de Aliados", href: "/aliados-comerciales" },
    ],
    soporte: [
      { label: "Radicar PQR", href: "/pqr" },
      { label: "Portal Cliente", href: "/proximamente" },
      { label: "Preguntas Frecuentes", href: "/faq" },
      { label: "Términos y Condiciones", href: "/legal/terminos" },
      { label: "Política de Privacidad", href: "/legal/privacidad" },
      { label: "Política de Cookies", href: "/legal/cookies" },
      { label: "Incentivos", href: "/incentivos" },
      { label: "T&C Incentivos Afiliados", href: "/legal/incentivos-afiliados" },
    ],
    redes: [

    ],
  };

  const socialLinks = [
    { name: "Facebook", href: "https://facebook.com/jardinesdelrenacer", iconUrl: "https://img.icons8.com/color/96/facebook-new.png" },
    { name: "Instagram", href: "https://instagram.com/jardinesdelrenacer", iconUrl: "https://img.icons8.com/fluency/96/instagram-new.png" },
    { name: "TikTok", href: "https://tiktok.com/@jardinesdelrenacer", iconUrl: "https://img.icons8.com/color/96/tiktok--v1.png" },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/jardines-del-renacer/posts/?feedView=all", iconUrl: "https://img.icons8.com/color/96/linkedin.png" },
    { name: "WhatsApp", href: buildWhatsAppUrl(), iconUrl: "https://img.icons8.com/color/96/whatsapp--v1.png" },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    // 2. Sanitización: Eliminar espacios y neutralizar etiquetas HTML para evitar inyección (XSS) en BD
    const sanitize = (str: string) => str.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const sanitizedEmail = sanitize(newsletter.email).toLowerCase();
    const sanitizedNombre = sanitize(newsletter.nombre);
    const sanitizedApellido = sanitize(newsletter.apellido);

    // 3. Validación final antes de enviar: Bloquea si falta info o el email no es válido
    if (!sanitizedNombre || !sanitizedApellido || !isValidEmail(sanitizedEmail)) {
      return; 
    }

    setLoading(true);

    // Aquí iría la integración con tu servicio de newsletter (enviando los datos sanitizados)
    setTimeout(() => {
      setSuccess(true);
      setNewsletter({ nombre: "", apellido: "", email: "" });
      setLoading(false);
      setAttemptedSubmit(false);

      // Ocultar el mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(false), 5000);
    }, 1000);
  };

  return (
    <footer className="mt-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3C60A2]/95 via-[#2f4d82]/90 to-[#3C60A2]/95 backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.15),rgba(255,255,255,0))]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 border-t border-white/20 text-white">
        {/* Newsletter Section */}
        <div className="relative glass py-16 overflow-hidden border-b border-white/10">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

          <Container maxWidth="2xl">
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left lg:max-w-md">
                <h2 className="text-3xl lg:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Mantente informado con nuestras noticias
                </h2>
                <p className="text-white/90 text-base leading-relaxed">
                  Suscríbete para recibir artículos, eventos y ofertas. Puedes
                  cancelar en cualquier momento.
                </p>
              </div>

              {success ? (
                <div className="w-full lg:w-auto bg-[#4CAF50]/90 border border-[#4CAF50] backdrop-blur-md rounded-2xl p-6 flex items-center gap-4 animate-in fade-in zoom-in duration-500 shadow-xl">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">¡Gracias por suscribirte!</h3>
                    <p className="text-white/90 text-sm">Pronto recibirás nuestras novedades en tu correo.</p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="w-full lg:w-auto"
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={newsletter.nombre}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Solo permite letras (incluyendo tildes y ñ) y espacios
                        if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(val)) {
                          setNewsletter({ ...newsletter, nombre: val });
                        }
                      }}
                      className="px-3 py-3.5 rounded-xl bg-white text-primary outline-none border-2 border-transparent focus:border-[#4CAF50] hover:bg-gradient-to-r hover:from-primary hover:to-primary-hover hover:text-white transition-all duration-300 font-bold whitespace-nowrap shadow-2xl hover:shadow-primary/50 hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
                    />
                    <input
                      type="text"
                      placeholder="Apellido"
                      value={newsletter.apellido}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Solo permite letras (incluyendo tildes y ñ) y espacios
                        if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(val)) {
                          setNewsletter({ ...newsletter, apellido: val });
                        }
                      }}
                      className="px-3 py-3.5 rounded-xl bg-white text-primary hover:bg-gradient-to-r hover:from-primary hover:to-primary-hover hover:text-white transition-all duration-300 font-bold whitespace-nowrap shadow-2xl hover:shadow-primary/50 hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
                    />
                    <input
                      type="email"
                      placeholder="Email *"
                      value={newsletter.email}
                      onChange={(e) => {
                        setAttemptedSubmit(false); // Quita el error visual al volver a escribir
                        setNewsletter({ ...newsletter, email: e.target.value });
                      }}
                      required
                      className={`px-3 py-3.5 rounded-xl text-primary hover:bg-gradient-to-r hover:from-primary hover:to-primary-hover hover:text-white transition-all duration-300 font-bold whitespace-nowrap shadow-2xl hover:shadow-primary/50 hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 outline-none border-2 focus:border-[#4CAF50] ${
                        attemptedSubmit && !isValidEmail(newsletter.email)
                          ? "border-red-400 bg-red-50 placeholder:text-red-400"
                          : "border-transparent bg-white"
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      onClick={() => setAttemptedSubmit(true)}
                      className="flex items-center justify-center min-w-[160px] px-10 py-3.5 rounded-xl bg-white text-primary hover:bg-[#4CAF50] hover:text-white transition-all duration-300 font-bold whitespace-nowrap shadow-2xl hover:shadow-[#4CAF50]/50 hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        "REGISTRARSE"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Container>
        </div>

        {/* Main Footer Content */}
        <Container maxWidth="2xl">
          <div className="py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="group block mb-8 w-fit">
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-20 md:w-24 md:h-24">
                    <Image
                      src="/log_footer.webp"
                      alt="Jardines del Renacer"
                      fill
                      className="object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="relative w-28 h-28 md:w-32 md:h-32">
                    <Image
                      src="/images/25años_since.png"
                      alt="26 años Jardines del Renacer"
                      fill
                      className="object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </Link>
              <p className="text-sm text-white/80 mb-8 leading-relaxed">
                Brindamos servicios funerarios con dignidad, sensibilidad y confianza
                para tus seres queridos desde hace 26 años.
              </p>
            </div>

            {/* Conócenos */}
            <div className="group">
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider relative inline-block">
                Conócenos
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-500"></span>
              </h4>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl">
                <ul className="space-y-3.5">
                  {footerLinks.conocenos.map((link, index) => (
                    <li
                      key={link.href}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {link.href.startsWith("http") ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white/75 hover:text-white transition-all duration-300 flex items-center group/link relative"
                        >
                          <span className="absolute -left-3 w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover/link:opacity-100 group-hover/link:-left-4 transition-all duration-300"></span>
                          <span className="group-hover/link:translate-x-2 transition-transform duration-300">
                            {link.label}
                          </span>
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-white/75 hover:text-white transition-all duration-300 flex items-center group/link relative"
                        >
                          <span className="absolute -left-3 w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover/link:opacity-100 group-hover/link:-left-4 transition-all duration-300"></span>
                          <span className="group-hover/link:translate-x-2 transition-transform duration-300">
                            {link.label}
                          </span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Atención */}
            <div className="group">
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider relative inline-block">
                Atención
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-500"></span>
              </h4>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl">
                <ul className="space-y-3.5">
                  {footerLinks.atencion.map((link, index) => (
                    <li
                      key={link.href}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Link
                        href={link.href}
                        className="text-sm text-white/75 hover:text-white transition-all duration-300 flex items-center group/link relative"
                      >
                        <span className="absolute -left-3 w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover/link:opacity-100 group-hover/link:-left-4 transition-all duration-300"></span>
                        <span className="group-hover/link:translate-x-2 transition-transform duration-300">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recursos */}
            <div className="group">
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider relative inline-block">
                Recursos
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-500"></span>
              </h4>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl">
                <ul className="space-y-3.5">
                  {footerLinks.recursos.map((link, index) => (
                    <li
                      key={link.href}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Link
                        href={link.href}
                        className="text-sm text-white/75 hover:text-white transition-all duration-300 flex items-center group/link relative"
                      >
                        <span className="absolute -left-3 w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover/link:opacity-100 group-hover/link:-left-4 transition-all duration-300"></span>
                        <span className="group-hover/link:translate-x-2 transition-transform duration-300">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Soporte */}
            <div className="group">
              <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-wider relative inline-block">
                Soporte
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-transparent group-hover:w-full transition-all duration-500"></span>
              </h4>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 shadow-lg hover:shadow-xl">
                <ul className="space-y-3.5">
                  {footerLinks.soporte.map((link, index) => (
                    <li
                      key={link.href}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Link
                        href={link.href}
                        className="text-sm text-white/75 hover:text-white transition-all duration-300 flex items-center group/link relative"
                      >
                        <span className="absolute -left-3 w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover/link:opacity-100 group-hover/link:-left-4 transition-all duration-300"></span>
                        <span className="group-hover/link:translate-x-2 transition-transform duration-300">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-10 border-t border-white/10 bg-black/20">
            <div className="flex flex-col items-center justify-center gap-6">
              {/* Copyright */}
              <div className="text-center">
                <p className="text-sm text-white/90 font-medium">
                  © {currentYear}{" "}
                  <span className="text-sm text-white/90 font-medium">
                    Jardines del Renacer
                  </span>
                  . Todos los derechos reservados.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center hover:border-primary/50 transition-all duration-500 hover:scale-125 hover:-translate-y-2 hover:rotate-6"
                    aria-label={social.name}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>

                    {/* Logo oficial a color */}
                    <img
                      src={social.iconUrl}
                      alt=""
                      aria-hidden="true"
                      className="relative h-7 w-7 object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Shine effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </a>
                ))}
              </div>

              <a
                href="https://github.com/JuanMonza"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-white/55 transition hover:text-white"
                aria-label="GitHub de JuanMonza"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .6a12 12 0 00-3.79 23.39c.6.11.82-.26.82-.58v-2.29c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.19 0 0 1.01-.32 3.3 1.23A11.5 11.5 0 0112 6.5c1.02 0 2.05.14 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.89.12 3.19.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.93.43.37.81 1.08.81 2.18v3.24c0 .32.22.69.83.57A12 12 0 0012 .6z" />
                </svg>
                GitHub · JuanMonza
              </a>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
