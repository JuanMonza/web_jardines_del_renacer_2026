'use client';

import { useEffect, useMemo, useState } from 'react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import SectionTitle from '@/components/ui/SectionTitle';
import FadeIn from '@/components/animations/FadeIn';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { SEDES } from '@/data/sedes';
import {
  FLOWER_ORDER_STATUS_STEPS,
  type FlowerOrderRecord,
  readFlowerOrders,
} from '@/lib/flowerOrdersStorage';
import { savePendingFlowerPayment } from '@/lib/flowerPaymentStorage';

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
    imagen: '/images/white-tulips-sunlight.jpg',
    categoria: 'rosas',
    tamano: 'grande',
  },
  {
    id: '2',
    nombre: 'Corona de Condolencias Premium',
    descripcion: 'Corona circular con rosas, lirios y claveles. Base de trípode incluida',
    precio: 350000,
    imagen: '/images/white-tulips-sunlight.jpg',
    categoria: 'premium',
    tamano: 'extra grande',
  },
  {
    id: '3',
    nombre: 'Lirios de Paz',
    descripcion: '12 lirios blancos en arreglo vertical con verdes decorativos',
    precio: 220000,
    imagen: '/images/white-tulips-sunlight.jpg',
    categoria: 'lirios',
    tamano: 'grande',
  },
  {
    id: '4',
    nombre: 'Arreglo Mixto Serenidad',
    descripcion: 'Combinación de rosas, claveles y gerberas en tonos pasteles',
    precio: 150000,
    imagen: '/images/white-tulips-sunlight.jpg',
    categoria: 'mixto',
    tamano: 'mediano',
  },
  {
    id: '5',
    nombre: 'Corazón Floral',
    descripcion: 'Arreglo en forma de corazón con rosas rojas y follaje',
    precio: 280000,
    imagen: '/images/white-tulips-sunlight.jpg',
    categoria: 'premium',
    tamano: 'grande',
  },
  {
    id: '6',
    nombre: 'Ramo de Crisantemos',
    descripcion: 'Arreglo tradicional de crisantemos blancos y amarillos',
    precio: 120000,
    imagen: '/images/white-tulips-sunlight.jpg',
    categoria: 'condolencias',
    tamano: 'mediano',
  },
  {
    id: '7',
    nombre: 'Cruz de Flores Grande',
    descripcion: 'Cruz floral con base. Rosas blancas, lirios y follaje natural',
    precio: 420000,
    imagen: '/images/white-tulips-sunlight.jpg',
    categoria: 'premium',
    tamano: 'extra grande',
  },
  {
    id: '8',
    nombre: 'Rosas Amarillas Esperanza',
    descripcion: '18 rosas amarillas con eucalipto y flores complementarias',
    precio: 160000,
    imagen: '/images/white-tulips-sunlight.jpg',
    categoria: 'rosas',
    tamano: 'mediano',
  },
  {
    id: '9',
    nombre: 'Arreglo de Gerberas',
    descripcion: 'Colorido arreglo de gerberas variadas en canasta',
    precio: 140000,
    imagen: '/images/white-tulips-sunlight.jpg',
    categoria: 'mixto',
    tamano: 'mediano',
  },
];

type CategoriaFiltro = ArregloFloral['categoria'] | 'todas';

const categoryIconPaths: Record<ArregloFloral['categoria'], string> = {
  rosas: 'M12 21s-6.5-4.1-8.8-7.7C1.7 11 1.9 7.8 4.3 6.2c1.7-1.1 4-.7 5.7.9 1.7-1.6 4-2 5.7-.9 2.4 1.6 2.6 4.8 1.1 7.1C18.5 16.9 12 21 12 21z',
  lirios: 'M12 3c2.4 3.2 3.8 6.3 3.8 8.8 0 2.3-1.7 4.2-3.8 4.2s-3.8-1.9-3.8-4.2C8.2 9.3 9.6 6.2 12 3z M12 16v5 M9 19h6',
  mixto: 'M12 3v4 M12 17v4 M4 12h4 M16 12h4 M6.3 6.3l2.8 2.8 M14.9 14.9l2.8 2.8 M17.7 6.3l-2.8 2.8 M9.1 14.9l-2.8 2.8',
  premium: 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.1L12 17.2 6.4 20.1l1.1-6.1L3 9.6l6.2-.9L12 3z',
  condolencias: 'M12 4v16 M5 11h14',
};

const filterIconPaths: Record<CategoriaFiltro, string> = {
  todas: 'M4 6h16 M4 12h16 M4 18h16',
  ...categoryIconPaths,
};

function createFlowerOrderCode() {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.floor(Math.random() * 90 + 10);
  return `FLR-${stamp}${suffix}`;
}

export default function FloreriaPage() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaFiltro>('todas');
  const [arregloSeleccionado, setArregloSeleccionado] = useState<ArregloFloral | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [carrito, setCarrito] = useState<ArregloFloral[]>([]);
  const [showCarrito, setShowCarrito] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    destinatario: '',
    departamento: '',
    ciudad: '',
    sedeId: '',
    direccion: '',
    mensaje: '',
    fechaEntrega: '',
  });
  const [orders, setOrders] = useState<FlowerOrderRecord[]>([]);
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingPhone, setTrackingPhone] = useState('');
  const [trackingResult, setTrackingResult] = useState<FlowerOrderRecord | null>(null);
  const [trackingFeedback, setTrackingFeedback] = useState('');
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);

  useEffect(() => {
    setOrders(readFlowerOrders());
  }, []);

  const departamentosDisponibles = useMemo(
    () =>
      Array.from(new Set(SEDES.map((sede) => sede.departamento))).sort((a, b) =>
        a.localeCompare(b, 'es'),
      ),
    [],
  );

  const ciudadesDisponibles = useMemo(() => {
    if (!formData.departamento) {
      return [] as string[];
    }
    return Array.from(
      new Set(
        SEDES.filter((sede) => sede.departamento === formData.departamento).map(
          (sede) => sede.ciudad,
        ),
      ),
    ).sort((a, b) => a.localeCompare(b, 'es'));
  }, [formData.departamento]);

  const sedesDisponibles = useMemo(() => {
    if (!formData.departamento || !formData.ciudad) {
      return [];
    }
    return SEDES.filter(
      (sede) =>
        sede.departamento === formData.departamento && sede.ciudad === formData.ciudad,
    ).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }, [formData.departamento, formData.ciudad]);

  const selectedSede = useMemo(
    () => SEDES.find((sede) => sede.id === formData.sedeId) ?? null,
    [formData.sedeId],
  );

  const handleDepartamentoChange = (departamento: string) => {
    setFormData((prev) => ({
      ...prev,
      departamento,
      ciudad: '',
      sedeId: '',
      direccion: '',
    }));
  };

  const handleCiudadChange = (ciudad: string) => {
    setFormData((prev) => ({
      ...prev,
      ciudad,
      sedeId: '',
      direccion: '',
    }));
  };

  const handleSedeChange = (sedeId: string) => {
    const nextSede = SEDES.find((sede) => sede.id === sedeId) ?? null;
    setFormData((prev) => ({
      ...prev,
      sedeId,
      direccion: nextSede?.direccion ?? '',
    }));
  };

  const buildDeliveryAddress = () => {
    const sedeName = selectedSede ? `Sede ${selectedSede.nombre}` : '';
    const sedeDireccion = formData.direccion.trim() || 'Dirección por confirmar';
    return [
      sedeName,
      sedeDireccion,
      formData.ciudad.trim(),
      formData.departamento.trim(),
    ]
      .filter(Boolean)
      .join(', ');
  };

  const categorias: Array<{ id: CategoriaFiltro; nombre: string; iconPath: string }> = [
    { id: 'todas', nombre: 'Todos', iconPath: filterIconPaths.todas },
    { id: 'rosas', nombre: 'Rosas', iconPath: filterIconPaths.rosas },
    { id: 'lirios', nombre: 'Lirios', iconPath: filterIconPaths.lirios },
    { id: 'mixto', nombre: 'Mixtos', iconPath: filterIconPaths.mixto },
    { id: 'premium', nombre: 'Premium', iconPath: filterIconPaths.premium },
    { id: 'condolencias', nombre: 'Condolencias', iconPath: filterIconPaths.condolencias },
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

  const buildOrderRecord = (
    items: Array<{ id: string; nombre: string; precio: number; cantidad: number }>,
    source: 'single' | 'cart',
  ): FlowerOrderRecord => {
    const now = new Date().toISOString();
    const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    const orderCode = createFlowerOrderCode();
    return {
      id: `order-${Date.now().toString(36)}`,
      orderCode,
      status: 'Creada',
      createdAt: now,
      customerName: formData.nombre.trim(),
      customerPhone: formData.telefono.trim(),
      customerEmail: formData.email.trim(),
      recipientName: formData.destinatario.trim(),
      deliveryAddress: buildDeliveryAddress(),
      deliveryDate: formData.fechaEntrega,
      cardMessage: formData.mensaje.trim(),
      items,
      total,
      source,
      events: [
        {
          status: 'Creada',
          timestamp: now,
          note: 'Pedido creado desde la web. Pendiente de pago.',
        },
      ],
      paymentStatus: 'pendiente',
      paymentProvider: 'wompi',
      paymentReference: orderCode,
      paymentTransactionId: '',
      paymentMethodType: '',
      paidAt: '',
    };
  };

  const createExpirationTimeIso = () => {
    const expiration = new Date(Date.now() + 1000 * 60 * 45);
    return expiration.toISOString();
  };

  const startPaymentCheckout = async (order: FlowerOrderRecord) => {
    if (!order.customerEmail) {
      setTrackingFeedback('Debes registrar un correo para continuar al pago.');
      return;
    }

    setIsRedirectingToPayment(true);
    setTrackingFeedback('Preparando pago seguro...');

    try {
      const response = await fetch('/api/floreria/pagos/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: order.orderCode,
          amountInCents: Math.round(order.total * 100),
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          shippingAddressLine1: order.deliveryAddress,
          shippingAddressCity: formData.ciudad,
          shippingAddressPhone: order.customerPhone,
          expirationTime: createExpirationTimeIso(),
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        checkoutUrl?: string;
        message?: string;
      };

      if (!response.ok || !payload.ok || !payload.checkoutUrl) {
        setIsRedirectingToPayment(false);
        setTrackingFeedback(
          payload.message || 'No pudimos iniciar el pago. Intenta nuevamente.',
        );
        return;
      }

      // Guardamos el pedido antes de redirigir para recuperarlo al volver desde Wompi.
      savePendingFlowerPayment({
        orderCode: order.orderCode,
        createdAt: new Date().toISOString(),
        source: order.source,
        order,
      });

      setTrackingCode(order.orderCode);
      setTrackingPhone(order.customerPhone);
      setTrackingFeedback(`Pedido ${order.orderCode} creado. Te redirigimos al pago seguro...`);
      setShowModal(false);
      setShowCarrito(false);
      window.location.href = payload.checkoutUrl;
    } catch (error) {
      console.error('Error iniciando pago de florería:', error);
      setIsRedirectingToPayment(false);
      setTrackingFeedback('Ocurrió un error al conectar la pasarela de pago.');
    }
  };

  const handleComprar = (arreglo: ArregloFloral) => {
    setArregloSeleccionado(arreglo);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!arregloSeleccionado) {
      setTrackingFeedback('Selecciona un arreglo floral antes de enviar el pedido.');
      return;
    }

    if (
      !formData.nombre.trim() ||
      !formData.telefono.trim() ||
      !formData.email.trim() ||
      !formData.destinatario.trim() ||
      !formData.departamento ||
      !formData.ciudad ||
      !formData.sedeId ||
      !formData.fechaEntrega
    ) {
      setTrackingFeedback(
        'Completa nombre, teléfono, correo, departamento, ciudad, sede y fecha antes de pagar.',
      );
      return;
    }

    const order = buildOrderRecord(
      [
        {
          id: arregloSeleccionado.id,
          nombre: arregloSeleccionado.nombre,
          precio: arregloSeleccionado.precio,
          cantidad: 1,
        },
      ],
      'single',
    );
    await startPaymentCheckout(order);
  };

  const handleCartCheckout = async () => {
    if (carrito.length === 0) {
      setTrackingFeedback('El carrito está vacío.');
      return;
    }

    if (
      !formData.nombre.trim() ||
      !formData.telefono.trim() ||
      !formData.email.trim() ||
      !formData.destinatario.trim() ||
      !formData.departamento ||
      !formData.ciudad ||
      !formData.sedeId ||
      !formData.fechaEntrega
    ) {
      setTrackingFeedback(
        'Completa nombre, teléfono, correo, departamento, ciudad, sede y fecha para pagar el carrito.',
      );
      return;
    }

    const itemsMap = new Map<string, { id: string; nombre: string; precio: number; cantidad: number }>();
    carrito.forEach((item) => {
      const current = itemsMap.get(item.id);
      if (current) {
        current.cantidad += 1;
      } else {
        itemsMap.set(item.id, {
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: 1,
        });
      }
    });

    const items = Array.from(itemsMap.values());
    const order = buildOrderRecord(items, 'cart');
    await startPaymentCheckout(order);
  };

  const handleTrackOrder = () => {
    const normalizedCode = trackingCode.trim().toUpperCase();
    const normalizedPhone = trackingPhone.replace(/\D/g, '');

    if (!normalizedCode) {
      setTrackingFeedback('Ingresa el código de pedido para consultar.');
      setTrackingResult(null);
      return;
    }

    const found = orders.find((order) => {
      const orderPhone = order.customerPhone.replace(/\D/g, '');
      const sameCode = order.orderCode === normalizedCode;
      const samePhone = !normalizedPhone || orderPhone === normalizedPhone;
      return sameCode && samePhone;
    });

    if (!found) {
      setTrackingFeedback('No encontramos un pedido con esos datos.');
      setTrackingResult(null);
      return;
    }

    setTrackingResult(found);
    setTrackingFeedback(`Pedido ${found.orderCode} encontrado.`);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      telefono: '',
      email: '',
      destinatario: '',
      departamento: '',
      ciudad: '',
      sedeId: '',
      direccion: '',
      mensaje: '',
      fechaEntrega: '',
    });
  };

  const renderSedeFields = (required: boolean) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Departamento {required ? '*' : ''}
          </label>
          <select
            value={formData.departamento}
            onChange={(e) => handleDepartamentoChange(e.target.value)}
            required={required}
            className="w-full px-4 py-3 rounded-xl glass border border-border text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          >
            <option value="">Selecciona un departamento</option>
            {departamentosDisponibles.map((departamento) => (
              <option key={departamento} value={departamento}>
                {departamento}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Ciudad {required ? '*' : ''}
          </label>
          <select
            value={formData.ciudad}
            onChange={(e) => handleCiudadChange(e.target.value)}
            required={required}
            disabled={!formData.departamento}
            className="w-full px-4 py-3 rounded-xl glass border border-border text-text disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
          >
            <option value="">Selecciona una ciudad</option>
            {ciudadesDisponibles.map((ciudad) => (
              <option key={ciudad} value={ciudad}>
                {ciudad}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Sede {required ? '*' : ''}
        </label>
        <select
          value={formData.sedeId}
          onChange={(e) => handleSedeChange(e.target.value)}
          required={required}
          disabled={!formData.ciudad}
          className="w-full px-4 py-3 rounded-xl glass border border-border text-text disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
        >
          <option value="">Selecciona una sede</option>
          {sedesDisponibles.map((sede) => (
            <option key={sede.id} value={sede.id}>
              {sede.nombre}
            </option>
          ))}
        </select>
      </div>

      <Input
        type="text"
        placeholder="Dirección de sede"
        value={formData.direccion}
        readOnly
      />
    </>
  );

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

          {trackingFeedback && (
            <div className="max-w-4xl mx-auto mb-8 rounded-2xl border border-primary/20 bg-primary/10 px-5 py-3 text-sm text-primary">
              {trackingFeedback}
            </div>
          )}

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
                <svg className="w-5 h-5 mr-2 inline-block text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={cat.iconPath} />
                </svg>
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
                <div className="relative h-64">
                  <Image
                    src={arreglo.imagen}
                    alt={arreglo.nombre}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-black/5" />
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
                  <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 border border-primary/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={categoryIconPaths[arreglo.categoria]} />
                    </svg>
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

          <div className="mt-16 glass rounded-3xl p-6 md:p-8 border border-primary/20">
            <h3 className="text-2xl font-display text-text mb-2">Consulta tu pedido</h3>
            <p className="text-textLight mb-5">
              Ingresa el código de orden (y opcionalmente tu teléfono) para ver estado y trazabilidad.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
              <Input
                label="Código de pedido"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                placeholder="Ej: FLR-ABC12345"
              />
              <Input
                label="Teléfono (opcional)"
                value={trackingPhone}
                onChange={(e) => setTrackingPhone(e.target.value)}
                placeholder="3001234567"
              />
              <Button variant="primary" className="h-fit self-end" onClick={handleTrackOrder}>
                Consultar
              </Button>
            </div>

            {trackingResult && (
              <div className="mt-6 rounded-2xl border border-primary/15 bg-white/40 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-text font-semibold">
                    Pedido: <span className="font-mono">{trackingResult.orderCode}</span>
                  </p>
                  <span className="text-xs px-2.5 py-1 rounded-full border border-primary/25 bg-primary/10 text-primary font-semibold">
                    {trackingResult.status}
                  </span>
                </div>
                <p className="text-sm text-textLight mt-2">
                  Destinatario: {trackingResult.recipientName} | Entrega: {trackingResult.deliveryDate}
                </p>
                <p className="text-sm text-textLight mt-1">
                  Total: ${trackingResult.total.toLocaleString('es-CO')}
                </p>
                <p className="text-sm text-textLight mt-1">
                  Pago:{' '}
                  {trackingResult.paymentStatus === 'aprobado'
                    ? 'Aprobado'
                    : trackingResult.paymentStatus === 'pendiente'
                      ? 'Pendiente'
                      : trackingResult.paymentStatus === 'rechazado'
                        ? 'Rechazado'
                        : trackingResult.paymentStatus === 'error'
                          ? 'Con error'
                          : 'No registrado'}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {FLOWER_ORDER_STATUS_STEPS.map((step) => {
                    const currentIndex = FLOWER_ORDER_STATUS_STEPS.indexOf(trackingResult.status);
                    const stepIndex = FLOWER_ORDER_STATUS_STEPS.indexOf(step);
                    const completed = stepIndex <= currentIndex;
                    return (
                      <span
                        key={step}
                        className={`text-xs px-2.5 py-1 rounded-full border ${
                          completed
                            ? 'border-primary/30 bg-primary/10 text-primary'
                            : 'border-border text-textLight'
                        }`}
                      >
                        {step}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-2">
                  {trackingResult.events.map((event, index) => (
                    <div key={`${event.timestamp}-${index}`} className="text-xs text-textLight">
                      {new Date(event.timestamp).toLocaleString('es-CO')} - {event.status}: {event.note}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                <svg className="w-16 h-16 text-primary/60 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l2.2 10.2a1 1 0 001 .8H18a1 1 0 001-.7l2-7.3H7.3M9 20a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm9 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                </svg>
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
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.imagen}
                          alt={item.nombre}
                          fill
                          className="object-cover"
                        />
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

                <div className="glass rounded-xl p-4 border border-primary/20 bg-primary/5 mb-6 space-y-3">
                  <h3 className="font-semibold text-text">Datos para pedido trazable</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      type="text"
                      placeholder="Tu nombre *"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                    <Input
                      type="tel"
                      placeholder="Tu teléfono *"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                  <Input
                    type="email"
                    placeholder="Tu email *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Input
                    type="text"
                    placeholder="Nombre del destinatario *"
                    value={formData.destinatario}
                    onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
                  />
                  {renderSedeFields(true)}
                  <Input
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                  />
                  <textarea
                    placeholder="Mensaje en tarjeta (opcional)"
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    maxLength={200}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg glass border border-border text-text resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <button
                    onClick={handleCartCheckout}
                    disabled={isRedirectingToPayment}
                    className="flex-1 h-14 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    {isRedirectingToPayment ? 'Redirigiendo a pago...' : 'Pagar y confirmar pedido'}
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
                  placeholder="Tu email *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-3"
                  required
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
                  {renderSedeFields(true)}
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
                disabled={isRedirectingToPayment}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {isRedirectingToPayment ? 'Redirigiendo a pago...' : 'Pagar y confirmar pedido'}
              </Button>

              <p className="text-xs text-textLight text-center">
                Al hacer clic, te llevaremos a la pasarela segura. Cuando el pago sea aprobado, podrás enviar la solicitud final por WhatsApp.
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
