'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CONTACT_INFO, buildWhatsAppUrl } from '@/config/contact';

interface ArregloFloral {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  categoria: 'rosas' | 'lirios' | 'mixto' | 'premium' | 'condolencias';
  tamano: 'pequeño' | 'mediano' | 'grande' | 'extra grande';
}

const arreglosFlorales: ArregloFloral[] = [
  {
    id: '1',
    nombre: 'Rosas Blancas Elegancia',
    descripcion: 'Hermoso arreglo de 24 rosas blancas con follaje verde y lazo de seda',
    precio: 180000,
    imagen: '/images/flores/rosas-blancas.jpg',
    categoria: 'rosas',
    tamano: 'grande',
  },
  {
    id: '2',
    nombre: 'Corona de Condolencias Premium',
    descripcion: 'Corona circular con rosas, lirios y claveles. Base de trípode incluida',
    precio: 350000,
    imagen: '/images/flores/corona-premium.jpg',
    categoria: 'premium',
    tamano: 'extra grande',
  },
  {
    id: '3',
    nombre: 'Lirios de Paz',
    descripcion: '12 lirios blancos en arreglo vertical con verdes decorativos',
    precio: 220000,
    imagen: '/images/flores/lirios-paz.jpg',
    categoria: 'lirios',
    tamano: 'grande',
  },
  {
    id: '4',
    nombre: 'Arreglo Mixto Serenidad',
    descripcion: 'Combinación de rosas, claveles y gerberas en tonos pasteles',
    precio: 150000,
    imagen: '/images/flores/mixto-serenidad.jpg',
    categoria: 'mixto',
    tamano: 'mediano',
  },
  {
    id: '5',
    nombre: 'Corazón Floral',
    descripcion: 'Arreglo en forma de corazón con rosas rojas y follaje',
    precio: 280000,
    imagen: '/images/flores/corazon-floral.jpg',
    categoria: 'premium',
    tamano: 'grande',
  },
  {
    id: '6',
    nombre: 'Ramo de Crisantemos',
    descripcion: 'Arreglo tradicional de crisantemos blancos y amarillos',
    precio: 120000,
    imagen: '/images/flores/crisantemos.jpg',
    categoria: 'condolencias',
    tamano: 'mediano',
  },
  {
    id: '7',
    nombre: 'Cruz de Flores Grande',
    descripcion: 'Cruz floral con base. Rosas blancas, lirios y follaje natural',
    precio: 420000,
    imagen: '/images/flores/cruz-grande.jpg',
    categoria: 'premium',
    tamano: 'extra grande',
  },
  {
    id: '8',
    nombre: 'Rosas Amarillas Esperanza',
    descripcion: '18 rosas amarillas con eucalipto y flores complementarias',
    precio: 160000,
    imagen: '/images/flores/rosas-amarillas.jpg',
    categoria: 'rosas',
    tamano: 'mediano',
  },
  {
    id: '9',
    nombre: 'Arreglo de Gerberas',
    descripcion: 'Colorido arreglo de gerberas variadas en canasta',
    precio: 140000,
    imagen: '/images/flores/gerberas.jpg',
    categoria: 'mixto',
    tamano: 'mediano',
  },
];

export default function FloreriaPage() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [arregloSeleccionado, setArregloSeleccionado] = useState<ArregloFloral | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [carrito, setCarrito] = useState<ArregloFloral[]>([]);
  const [showCarrito, setShowCarrito] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    destinatario: '',
    direccion: '',
    mensaje: '',
    fechaEntrega: '',
  });

  const categorias = [
    { id: 'todas', nombre: 'Todos', icon: '' },
    { id: 'rosas', nombre: 'Rosas', icon: '' },
    { id: 'lirios', nombre: 'Lirios', icon: '' },
    { id: 'mixto', nombre: 'Mixtos', icon: '' },
    { id: 'premium', nombre: 'Premium', icon: '' },
    { id: 'condolencias', nombre: 'Condolencias', icon: '' },
  ];

  const arreglosFiltrados = categoriaSeleccionada === 'todas'
    ? arreglosFlorales
    : arreglosFlorales.filter(a => a.categoria === categoriaSeleccionada);

  const agregarAlCarrito = (arreglo: ArregloFloral) => {
    setCarrito([...carrito, arreglo]);
    // Animación visual de confirmación
    const notification = document.createElement('div');
    notification.className = 'fixed top-24 right-6 glass border-2 border-green-500 bg-green-500/20 px-6 py-3 rounded-full z-50 animate-bounce';
    notification.innerHTML = 'Agregado al carrito';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
  };

  const eliminarDelCarrito = (index: number) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const calcularTotal = () => {
    return carrito.reduce((sum, item) => sum + item.precio, 0);
  };

  const handleComprar = (arreglo: ArregloFloral) => {
    setArregloSeleccionado(arreglo);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear mensaje para WhatsApp
    const mensaje = `*PEDIDO DE FLORES*\n\n` +
      `*Arreglo:* ${arregloSeleccionado?.nombre}\n` +
      `*Precio:* $${arregloSeleccionado?.precio.toLocaleString('es-CO')}\n\n` +
      `*DATOS DEL REMITENTE:*\n` +
      `Nombre: ${formData.nombre}\n` +
      `Teléfono: ${formData.telefono}\n` +
      `Email: ${formData.email}\n\n` +
      `*DATOS DE ENTREGA:*\n` +
      `Destinatario: ${formData.destinatario}\n` +
      `Dirección: ${formData.direccion}\n` +
      `Fecha entrega: ${formData.fechaEntrega}\n\n` +
      `*Mensaje en tarjeta:*\n${formData.mensaje}`;

    const url = buildWhatsAppUrl(mensaje);
    
    window.open(url, '_blank');
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      destinatario: '',
      direccion: '',
      mensaje: '',
      fechaEntrega: '',
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-background via-primary/5 to-background">
      <Container>
        <FadeIn>
          <SectionTitle
            title="Florería"
            subtitle="Envía flores como homenaje y consuelo"
            align="center"
          />

          {/* Descripción */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-textLight text-lg">
              Expresa tus condolencias con hermosos arreglos florales. 
              Entregamos directamente en nuestras salas de velación o a domicilio.
            </p>
          </div>

          {/* Filtros de Categoría */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categorias.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setCategoriaSeleccionada(cat.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`glass px-6 py-3 rounded-full border-2 transition-all duration-300 ${
                  categoriaSeleccionada === cat.id
                    ? 'border-primary bg-primary/20 shadow-glass-lg'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-2xl mr-2">{cat.icon}</span>
                <span className="font-medium text-text">{cat.nombre}</span>
              </motion.button>
            ))}
          </div>

          {/* Grid de Arreglos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {arreglosFiltrados.map((arreglo, index) => (
              <motion.div
                key={arreglo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass rounded-2xl overflow-hidden border border-primary/20 hover:shadow-glass-lg hover:scale-105 transition-all duration-300"
              >
                {/* Imagen */}
                <div className="relative h-64 bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl opacity-20"></span>
                  </div>
                  {/* Badge de categoría */}
                  <div className="absolute top-4 left-4 px-3 py-1 glass rounded-full border border-primary/30">
                    <span className="text-xs font-semibold text-primary capitalize">
                      {arreglo.categoria}
                    </span>
                  </div>
                  {/* Badge de tamaño */}
                  <div className="absolute top-4 right-4 px-3 py-1 glass rounded-full border border-border">
                    <span className="text-xs font-medium text-textLight capitalize">
                      {arreglo.tamano}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-text mb-2">
                    {arreglo.nombre}
                  </h3>
                  <p className="text-textLight text-sm mb-4 line-clamp-2">
                    {arreglo.descripcion}
                  </p>

                  {/* Precio y Botones */}
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-textLight">Precio</p>
                        <p className="text-2xl font-bold text-primary">
                          ${arreglo.precio.toLocaleString('es-CO')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => agregarAlCarrito(arreglo)}
                        className="flex-1 glass border-2 border-green-500/30 hover:border-green-500 text-green-600 font-medium px-4 py-2 rounded-lg transition-all hover:scale-105"
                      >
                        <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        Agregar
                      </button>
                      <button
                        onClick={() => handleComprar(arreglo)}
                        className="flex-1 bg-primary hover:bg-primary/80 text-white font-medium px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-lg"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Información adicional */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeIn delay={0.2}>
              <div className="glass rounded-2xl p-6 border border-green-500/20 text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text mb-2">Entrega el Mismo Día</h3>
                <p className="text-sm text-textLight">
                  Pedidos antes de las 2pm se entregan el mismo día
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="glass rounded-2xl p-6 border border-blue-500/20 text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text mb-2">Flores Frescas</h3>
                <p className="text-sm text-textLight">
                  Garantizamos la calidad y frescura de nuestras flores
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="glass rounded-2xl p-6 border border-purple-500/20 text-center">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-text mb-2">Tarjeta Personalizada</h3>
                <p className="text-sm text-textLight">
                  Incluye tu mensaje especial en una elegante tarjeta
                </p>
              </div>
            </FadeIn>
          </div>
        </FadeIn>
      </Container>

      {/* Botón Flotante del Carrito */}
      {carrito.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCarrito(true)}
          className="fixed bottom-24 right-6 w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 text-white rounded-full shadow-2xl flex items-center justify-center z-40 border-4 border-white"
        >
          <div className="relative">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
              {carrito.length}
            </span>
          </div>
        </motion.button>
      )}

      {/* Modal del Carrito */}
      {showCarrito && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCarrito(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-3xl border-2 border-primary/30 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text mb-2">Mi Carrito</h2>
                <p className="text-textLight">{carrito.length} {carrito.length === 1 ? 'artículo' : 'artículos'}</p>
              </div>
              <button
                onClick={() => setShowCarrito(false)}
                className="w-10 h-10 rounded-full glass border border-border hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {carrito.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block"></span>
                <p className="text-textLight text-lg">Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                {/* Lista de items */}
                <div className="space-y-3 mb-6">
                  {carrito.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass rounded-xl p-4 border border-primary/20 flex items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl"></span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-text">{item.nombre}</h3>
                        <p className="text-sm text-textLight capitalize">{item.categoria} • {item.tamano}</p>
                        <p className="text-lg font-bold text-primary mt-1">
                          ${item.precio.toLocaleString('es-CO')}
                        </p>
                      </div>
                      <button
                        onClick={() => eliminarDelCarrito(index)}
                        className="w-8 h-8 rounded-full glass border border-border hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </motion.div>
                  ))}
                </div>

                {/* Total */}
                <div className="glass rounded-xl p-6 border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-semibold text-text">Total:</span>
                    <span className="text-3xl font-bold text-primary">
                      ${calcularTotal().toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const mensaje = `*PEDIDO DE FLORES - CARRITO*\n\n` +
                        carrito.map((item, i) => `${i + 1}. ${item.nombre} - $${item.precio.toLocaleString('es-CO')}`).join('\n') +
                        `\n\n*TOTAL: $${calcularTotal().toLocaleString('es-CO')}*\n\n` +
                        `Por favor, necesito información para completar mi pedido.`;
                      window.open(buildWhatsAppUrl(mensaje), '_blank');
                    }}
                    className="flex-1 h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    Comprar Todo por WhatsApp
                  </button>
                  <button
                    onClick={() => setCarrito([])}
                    className="px-6 h-14 glass border-2 border-red-500/30 hover:border-red-500 text-red-600 rounded-xl font-semibold transition-all"
                  >
                    Vaciar
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Modal de Compra */}
      {showModal && arregloSeleccionado && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-3xl border-2 border-primary/30 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-text mb-2">
                  Enviar {arregloSeleccionado.nombre}
                </h2>
                <p className="text-3xl font-bold text-primary">
                  ${arregloSeleccionado.precio.toLocaleString('es-CO')}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full glass border border-border hover:border-red-500 hover:text-red-500 transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="glass rounded-xl p-4 border border-primary/20 bg-primary/5">
                <h3 className="font-semibold text-text mb-3">Datos del Remitente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="Tu nombre completo *"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                  <Input
                    type="tel"
                    placeholder="Tu teléfono *"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    required
                  />
                </div>
                <Input
                  type="email"
                  placeholder="Tu email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-3"
                />
              </div>

              <div className="glass rounded-xl p-4 border border-green-500/20 bg-green-500/5">
                <h3 className="font-semibold text-text mb-3">Datos de Entrega</h3>
                <div className="space-y-3">
                  <Input
                    type="text"
                    placeholder="Nombre del destinatario *"
                    value={formData.destinatario}
                    onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="Dirección de entrega o sala de velación *"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    required
                  />
                  <Input
                    type="date"
                    placeholder="Fecha de entrega *"
                    value={formData.fechaEntrega}
                    onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="glass rounded-xl p-4 border border-blue-500/20 bg-blue-500/5">
                <h3 className="font-semibold text-text mb-3">Mensaje en Tarjeta</h3>
                <textarea
                  placeholder="Escribe tu mensaje de condolencias (máx. 200 caracteres)"
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg glass border border-border text-text resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <p className="text-xs text-textLight mt-2 text-right">
                  {formData.mensaje.length}/200 caracteres
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Enviar Pedido por WhatsApp
              </Button>

              <p className="text-xs text-textLight text-center">
                Al hacer clic, se abrirá WhatsApp en la línea corporativa {CONTACT_INFO.whatsappDisplay} con tu pedido listo para enviar
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
