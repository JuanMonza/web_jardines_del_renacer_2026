'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Container from '@/components/ui/Container';
import PageHero from '@/components/ui/PageHero';
import FadeIn from '@/components/animations/FadeIn';
import Button from '@/components/ui/Button';
import {
  ALLY_DEPARTMENTS,
  ALLY_CATEGORIES,
  getCategoryBySlug,
  getCategoryLabel,
  type CommercialAlly,
} from '@/config/allies';
import { readCommercialAllies } from '@/lib/alliesStorage';
import MembershipCard from './MembershipCard';
import { ensureExcelAlliesSeeded } from '@/lib/allyExcelImport';
import {
  createDiscountRequest,
  findActiveClientByCedula,
  findRequestForVerification,
  type AllyDiscountRequest,
} from '@/lib/allyMembershipStorage';
import type { ClientData } from '@/data/mockClients';

const ALL_CATEGORIES = 'todos';
const ALL_SUBCATEGORIES = 'todas';
const ALL_DEPARTMENTS = 'todos';

function AliadosComercialesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allies, setAllies] = useState<CommercialAlly[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(ALL_SUBCATEGORIES);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(ALL_DEPARTMENTS);
  const [selectedCity, setSelectedCity] = useState<string>('todas');
  const [cedula, setCedula] = useState('');
  const [verifiedClient, setVerifiedClient] = useState<ClientData | null>(null);
  const [memberFeedback, setMemberFeedback] = useState('');
  const [generatedCode, setGeneratedCode] = useState<AllyDiscountRequest | null>(null);
  const [fixedCode, setFixedCode] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialCategory = searchParams.get('categoria') || ALL_CATEGORIES;
    const initialSubcategory = searchParams.get('subcategoria') || ALL_SUBCATEGORIES;
    const rawDepartment = searchParams.get('departamento') || ALL_DEPARTMENTS;
    const initialDepartment = rawDepartment || ALL_DEPARTMENTS;

    setSelectedCategory(initialCategory);
    setSelectedSubcategory(initialSubcategory);
    setSelectedDepartment(initialDepartment);
    setAllies(readCommercialAllies());
    ensureExcelAlliesSeeded()
      .then(setAllies)
      .catch(() => setAllies(readCommercialAllies()));

    const syncFromStorage = () => setAllies(readCommercialAllies());
    window.addEventListener('storage', syncFromStorage);
    return () => window.removeEventListener('storage', syncFromStorage);
  }, [searchParams]);

  const availableCities = useMemo(() => {
    const cities = allies
      .filter((ally) => selectedDepartment === ALL_DEPARTMENTS || ally.departamento === selectedDepartment)
      .map((ally) => ally.municipio)
      .filter(Boolean);
    return Array.from(new Set(cities)).sort((a, b) => a.localeCompare(b, 'es'));
  }, [allies, selectedDepartment]);

  const availableDepartments = useMemo(() => {
    const departments = allies.map((ally) => ally.departamento).filter(Boolean);
    return Array.from(new Set([...ALLY_DEPARTMENTS, ...departments])).sort((a, b) =>
      a.localeCompare(b, 'es'),
    );
  }, [allies]);

  const availableSubcategories = useMemo(() => {
    if (selectedCategory === ALL_CATEGORIES) {
      return [];
    }
    return getCategoryBySlug(selectedCategory)?.subcategories ?? [];
  }, [selectedCategory]);

  const filteredAllies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allies.filter((ally) => {
      const matchesCategory =
        selectedCategory === ALL_CATEGORIES || ally.categorySlug === selectedCategory;
      const matchesSubcategory =
        selectedSubcategory === ALL_SUBCATEGORIES || ally.subcategory === selectedSubcategory;
      const matchesDepartment =
        selectedDepartment === ALL_DEPARTMENTS || ally.departamento === selectedDepartment;
      const matchesCity = selectedCity === 'todas' || ally.municipio === selectedCity;

      const matchesSearch =
        !query ||
        ally.name.toLowerCase().includes(query) ||
        ally.address.toLowerCase().includes(query) ||
        ally.subcategory.toLowerCase().includes(query) ||
        ally.municipio.toLowerCase().includes(query) ||
        ally.departamento.toLowerCase().includes(query) ||
        getCategoryLabel(ally.categorySlug).toLowerCase().includes(query);

      return matchesCategory && matchesSubcategory && matchesDepartment && matchesCity && matchesSearch;
    });
  }, [allies, search, selectedCategory, selectedSubcategory, selectedDepartment, selectedCity]);

  const handleClientVerification = (event: React.FormEvent) => {
    event.preventDefault();
    setGeneratedCode(null);
    setFixedCode(null);
    const client = findActiveClientByCedula(cedula);
    if (!client) {
      setVerifiedClient(null);
      setMemberFeedback('No encontramos una membresia activa con esa cedula.');
      return;
    }

    setVerifiedClient(client);
    setMemberFeedback(`Membresia activa para ${client.nombre} ${client.apellido}. Ya puedes generar un codigo.`);
  };

  const handleGenerateCode = (ally: CommercialAlly) => {
    if (!verifiedClient) {
      setMemberFeedback('Primero valida una cedula activa.');
      return;
    }

    const existingActiveCode = findRequestForVerification({
      cedula: verifiedClient.cedula,
      allyId: ally.id,
    });
    const request =
      existingActiveCode?.status === 'active'
        ? existingActiveCode
        : createDiscountRequest(verifiedClient, ally);

    setGeneratedCode(request);
    setFixedCode(request.code);
    setMemberFeedback(
      existingActiveCode?.status === 'active'
        ? 'Ya tienes un codigo activo para este aliado. Te mostramos el mismo codigo vigente.'
        : 'Codigo generado correctamente. Presentalo en el establecimiento aliado.',
    );

    setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const updateQueryParams = (category: string, subcategory: string, department: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === ALL_CATEGORIES) {
      params.delete('categoria');
      params.delete('subcategoria');
    } else {
      params.set('categoria', category);
      if (subcategory === ALL_SUBCATEGORIES) {
        params.delete('subcategoria');
      } else {
        params.set('subcategoria', subcategory);
      }
    }

    if (department === ALL_DEPARTMENTS) {
      params.delete('departamento');
    } else {
      params.set('departamento', department);
    }

    const query = params.toString();
    router.replace(query ? `/aliados-comerciales?${query}` : '/aliados-comerciales', { scroll: false });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(ALL_SUBCATEGORIES);
    updateQueryParams(category, ALL_SUBCATEGORIES, selectedDepartment);
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
    updateQueryParams(selectedCategory, subcategory, selectedDepartment);
  };

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    setSelectedCity('todas');
    updateQueryParams(selectedCategory, selectedSubcategory, department);
  };

  return (
    <>
      <PageHero
        title="Club de Aliados"
        subtitle="Valida tu membresía activa, elige un aliado y genera tu código de descuento."
        image="/images/images-baners/Clubdealiados.webp"
        imageAlt="Club de aliados Jardines del Renacer"
      >
        <form
          onSubmit={handleClientVerification}
          className="max-w-3xl rounded-3xl border border-white/25 bg-white/95 p-4 text-left shadow-2xl md:p-5"
        >
          <label className="block text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Consulta tu membresía con cédula
          </label>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <input
              value={cedula}
              onChange={(event) => setCedula(event.target.value)}
              placeholder="Ej: 1234567890"
              className="w-full rounded-2xl border border-primary/15 bg-white px-4 py-4 text-sm font-semibold text-text placeholder:text-textLight focus:outline-none focus:ring-4 focus:ring-primary/20"
            />
            <Button type="submit" variant="primary" className="w-full md:w-auto">
              Validar membresía
            </Button>
          </div>
          {memberFeedback && (
            <p className={`mt-3 text-sm font-semibold ${verifiedClient ? 'text-green-700' : 'text-red-600'}`}>
              {memberFeedback}
            </p>
          )}
        </form>
      </PageHero>
      <section className="py-16">
        <Container>
          <FadeIn delay={0.1}>
            <div className="max-w-5xl mx-auto space-y-4">
              {verifiedClient && (
                <div className="glass rounded-3xl border border-primary/15 p-5" ref={cardRef}>
                  <MembershipCard
                    nombre={`${verifiedClient.nombre} ${verifiedClient.apellido}`}
                    cedula={verifiedClient.cedula}
                    membresiaId={verifiedClient.cedula}
                    discountLabel={generatedCode ? generatedCode.discountLabel : undefined}
                    codigoUnico={fixedCode ?? generatedCode?.code}
                  />
                  {generatedCode && (
                    <div className="mt-4 border-t border-primary/10 pt-4 text-center text-xs text-textLight">
                      Código para <span className="font-semibold text-text">{generatedCode.allyName}</span>. Válido hasta: {new Date(generatedCode.expiresAt).toLocaleDateString('es-CO')}
                    </div>
                  )}
                </div>
              )}

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                  </svg>
                </span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar aliado, categoría, ciudad o dirección..."
                  className="w-full glass rounded-2xl pl-11 pr-4 py-3 text-text placeholder:text-textLight text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                />
              </div>

              {/* Dropdown Departamento */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-textLight font-semibold">Departamento</p>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white/80 px-4 py-2.5 text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value={ALL_DEPARTMENTS}>Todos los departamentos</option>
                    {availableDepartments.map((dep) => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>

                {selectedDepartment !== ALL_DEPARTMENTS && availableCities.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-textLight font-semibold">Ciudad</p>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full rounded-xl border border-border bg-white/80 px-4 py-2.5 text-sm text-text outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="todas">Todas las ciudades</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-textLight">Categoria</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategoryChange(ALL_CATEGORIES)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all glass border ${
                      selectedCategory === ALL_CATEGORIES
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-border text-textLight hover:border-primary/40'
                    }`}
                  >
                    Todas
                  </button>
                  {ALLY_CATEGORIES.map((category) => (
                    <button
                      key={category.slug}
                      onClick={() => handleCategoryChange(category.slug)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all glass border ${
                        selectedCategory === category.slug
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-border text-textLight hover:border-primary/40'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedCategory !== ALL_CATEGORIES && availableSubcategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleSubcategoryChange(ALL_SUBCATEGORIES)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      selectedSubcategory === ALL_SUBCATEGORIES
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-border text-textLight hover:border-primary/40'
                    }`}
                  >
                    Todas las subcategorias
                  </button>
                  {availableSubcategories.map((subcategory) => (
                    <button
                      key={subcategory}
                      onClick={() => handleSubcategoryChange(subcategory)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        selectedSubcategory === subcategory
                          ? 'border-primary text-primary bg-primary/10'
                          : 'border-border text-textLight hover:border-primary/40'
                      }`}
                    >
                      {subcategory}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        </Container>
      </section>

      <section className="py-12 pb-20">
        <Container maxWidth="2xl">
          {filteredAllies.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center border border-primary/15">
              <p className="text-xl text-text mb-2">No encontramos aliados con ese filtro.</p>
              <p className="text-textLight">Prueba con otra categoria, subcategoria o palabra clave.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAllies.map((ally, index) => (
                <FadeIn key={ally.id} delay={Math.min(index * 0.05, 0.35)}>
                  <article className="glass rounded-3xl border border-primary/15 overflow-hidden h-full">
                    <div className="p-6 border-b border-primary/10 bg-gradient-to-br from-primary/10 to-white/40">
                      <div className="mb-4 inline-flex rounded-full border border-green-500/25 bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-700">
                        {ally.discountLabel || 'Descuento sujeto a condiciones'}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/90 border border-primary/20 p-2 flex items-center justify-center overflow-hidden">
                          {ally.logo ? (
                            <img
                              src={ally.logo}
                              alt={ally.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <svg className="w-8 h-8 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-text leading-tight line-clamp-2">{ally.name}</h3>
                          <p className="text-xs uppercase tracking-[0.18em] text-primary mt-1">
                            {getCategoryLabel(ally.categorySlug)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-sky-500/20 bg-sky-500/10 text-sky-700">
                          {ally.municipio}, {ally.departamento}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">
                          {ally.subcategory}
                        </span>
                        {ally.featured && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-green-500/25 bg-green-500/10 text-green-700">
                            Destacado
                          </span>
                        )}
                      </div>

                      {ally.description && (
                        <p className="text-sm text-textLight">{ally.description}</p>
                      )}

                      <div className="text-sm text-text">
                        <p className="font-semibold mb-1">Direccion</p>
                        <p className="text-textLight">{ally.address || 'Direccion por confirmar'}</p>
                      </div>

                      <p className="text-xs text-textLight italic">
                        (* Aplica Terminos & Condiciones *)
                      </p>

                      <Button
                        type="button"
                        variant="primary"
                        className="w-full"
                        onClick={() => handleGenerateCode(ally)}
                        disabled={!verifiedClient}
                      >
                        {verifiedClient ? 'Generar codigo de descuento' : 'Valida tu cedula primero'}
                      </Button>
                    </div>
                  </article>
                </FadeIn>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

export default function AliadosComercialesPage() {
  return (
    <Suspense
      fallback={
        <section className="py-20">
          <Container>
            <div className="glass rounded-3xl border border-primary/15 p-8 text-center">
              <p className="text-textLight">Cargando aliados comerciales...</p>
            </div>
          </Container>
        </section>
      }
    >
      <AliadosComercialesPageContent />
    </Suspense>
  );
}
