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
      { label: "Medios de Pago", href: "https://checkout.wompi.co/method" },
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
      { label: "Sorteos", href: "/sorteos" },
    ],
    redes: [

    ],
  };

  const socialLinks = [
    {
      name: "Facebook",
      href: "https://facebook.com/jardinesdelrenacer",
      iconPath:
        "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
    },
    {
      name: "Instagram",
      href: "https://instagram.com/jardinesdelrenacer",
      iconPath:
        "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
    },
    {
      name: "TikTok",
      href: "https://tiktok.com/@jardinesdelrenacer",
      iconPath:
        "M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/jardines-del-renacer/posts/?feedView=all",
      iconPath:
        "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    },
    {
      name: "WhatsApp",
      href: buildWhatsAppUrl(),
      iconPath:
        "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z",
    },
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
                      alt="25 años Jardines del Renacer"
                      fill
                      className="object-contain group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </Link>
              <p className="text-sm text-white/80 mb-8 leading-relaxed">
                Brindamos servicios funerarios con dignidad, respeto y paz
                eterna para tus seres queridos desde hace más de 30 años.
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

                    {/* Icon */}
                    <div className="relative text-white/70 group-hover:text-white group-hover:scale-110 transition-all duration-500">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d={social.iconPath} />
                      </svg>
                    </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
