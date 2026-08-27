"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLoginLayout from "@/components/login/AuthLoginLayout";
import LoginTextField from "@/components/login/LoginTextField";
type Props = {
  destination:
    | "/dashboard"
    | "/dashboard-aliados"
    | "/dashboard-vacantes"
    | "/dashboard-sedes"
    | "/dashboard/cotizaciones"
    | "/dashboard-talleres"
    | "/dashboard-sorteos";
  sectionLabel: string;
  subtitle: string;
};
export default function AdminDatabaseLoginForm({
  destination,
  sectionLabel,
  subtitle,
}: Props) {
  const router = useRouter();
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUser, setRememberUser] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const savedCedula = window.localStorage.getItem(
      "jdr.remember.admin.cedula",
    );
    if (savedCedula) {
      setCedula(savedCedula);
      setRememberUser(true);
    }
  }, []);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const document = cedula.replace(/\D/g, "");
    if (!/^\d{6,20}$/.test(document) || !password) {
      setError("Ingresa credenciales válidas.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/iam/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ cedula: document, password, destination }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.message || "No fue posible iniciar sesión.");
        return;
      }
      if (rememberUser)
        window.localStorage.setItem("jdr.remember.admin.cedula", document);
      else window.localStorage.removeItem("jdr.remember.admin.cedula");
      router.replace(destination);
      router.refresh();
    } catch {
      setError("No fue posible iniciar sesión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthLoginLayout
      title="Bienvenido"
      subtitle={subtitle}
      sectionLabel={sectionLabel}
    >
      <form onSubmit={submit} className="space-y-5">
        <LoginTextField
          label="Cédula administrativa"
          type="text"
          value={cedula}
          onChange={(event) => setCedula(event.target.value)}
          placeholder="Ingresa tu cédula"
          required
        />
        <LoginTextField
          label="Contraseña"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••••"
          required
        />
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/80">
          <input
            type="checkbox"
            checked={rememberUser}
            onChange={(event) => setRememberUser(event.target.checked)}
            className="h-4 w-4 accent-white"
          />
          Recordar mi cédula en este dispositivo
        </label>
        {error && (
          <p className="rounded-xl border border-red-300/40 bg-red-950/35 px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-white py-3.5 text-base font-bold text-[#17355f] transition-all hover:bg-[#dfeefd] disabled:opacity-60"
        >
          {loading ? "Validando acceso…" : "Ingresar al panel"}
        </button>
        <div className="border-t border-white/15 pt-4 text-center text-sm text-white/65">
          <Link href="/" className="transition-colors hover:text-white">
            Volver al inicio
          </Link>
        </div>
      </form>
    </AuthLoginLayout>
  );
}
