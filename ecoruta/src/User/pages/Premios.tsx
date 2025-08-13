// src/User/pages/Premios.tsx
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

type TierId = "stick" | "copper" | "gold" | "diamond";
type Tier = { id: TierId; name: string; color: string; lower: number; upper: number | null; note: string };

const TIERS: Tier[] = [
  { id: "stick",   name: "Palo",     color: "#8B5A2B", lower: 0,  upper: 20,  note: "¡Sigue! A partir de 21 puntos obtienes Cobre." },
  { id: "copper",  name: "Cobre",    color: "#B87333", lower: 21, upper: 50,  note: "Vas bien, ¡apunta a Oro con 51 puntos!" },
  { id: "gold",    name: "Oro",      color: "#FFD700", lower: 51, upper: 90,  note: "¡Casi top! Diamante es desde 91 puntos." },
  { id: "diamond", name: "Diamante", color: "#66E3E9", lower: 91, upper: null, note: "Nivel máximo. ¡Eres leyenda eco!" },
];

const getUserIdFromStorage = (): number | null => {
  try {
    const u = localStorage.getItem("user");
    if (u) {
      const parsed = JSON.parse(u);
      if (parsed?.id) return Number(parsed.id);
    }
  } catch {}
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      const candidate = payload?.id ?? payload?.userId ?? payload?.uid ?? payload?.sub;
      if (candidate) return Number(candidate);
    }
  } catch {}
  return null;
};

const tierFromPoints = (pts: number): Tier => {
  if (pts > 90) return TIERS[3];
  if (pts > 50) return TIERS[2];
  if (pts > 20) return TIERS[1];
  return TIERS[0];
};

function MedalGraphic({ tier }: { tier: Tier }) {
  if (tier.id === "stick") {
    return (
      <div className="flex items-center justify-center h-36">
        <div className="w-4 h-28 rounded-md" style={{ background: "linear-gradient(180deg,#9A6B3A,#6E4623)" }} />
      </div>
    );
  }
  if (tier.id === "diamond") {
    return (
      <svg viewBox="0 0 120 120" className="h-36 mx-auto">
        <defs>
          <linearGradient id="dia" x1="0" x2="1">
            <stop offset="0%" stopColor="#9AF3F7" />
            <stop offset="100%" stopColor="#4CD1D7" />
          </linearGradient>
        </defs>
        <polygon points="60,10 105,45 90,95 30,95 15,45" fill="url(#dia)" stroke="#2CBCC4" strokeWidth="3" />
        <line x1="60" y1="10" x2="60" y2="95" stroke="#2CBCC4" strokeWidth="2" />
        <line x1="15" y1="45" x2="105" y2="45" stroke="#2CBCC4" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 120 120" className="h-36 mx-auto">
      <defs>
        <radialGradient id="medal" cx="50%" cy="45%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="40%" stopColor={tier.color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={tier.color} />
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="46" fill="url(#medal)" stroke="#cbd5e1" strokeWidth="3" />
      <circle cx="60" cy="60" r="28" fill="rgba(255,255,255,0.25)" />
    </svg>
  );
}

export default function Premios() {
  const [points, setPoints] = useState<number | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const userId = useMemo(getUserIdFromStorage, []);

  // Configura token solo una vez
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  const fetchUser = async () => {
    if (!userId) {
      setErr("No se encontró el usuario. Inicia sesión nuevamente.");
      return;
    }
    try {
      setLoading(true);
      setErr(null);
      const { data } = await axios.get(`http://localhost:3333/users/${userId}`);
      setPoints(Number(data?.puntos ?? 0));
      setName((data?.nombre ?? data?.email ?? "Usuario") as string);
    } catch (e) {
      console.error(e);
      setErr("No se pudieron obtener tus puntos.");
    } finally {
      setLoading(false);
    }
  };

  // 1) Carga inicial
  useEffect(() => {
    fetchUser();
    // 2) Refresca cuando vuelves a la pestaña/página
    const onFocus = () => fetchUser();
    const onVisible = () => { if (document.visibilityState === "visible") fetchUser(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const tier = useMemo(() => tierFromPoints(points ?? 0), [points]);

  const { progressPct, nextLabel } = useMemo(() => {
    const p = points ?? 0;
    if (tier.id === "diamond") return { progressPct: 100, nextLabel: "Máximo nivel" };
    const upper = tier.upper ?? p;
    const lower = tier.lower;
    const width = Math.max(1, upper - lower);
    const raw = ((Math.min(p, upper) - lower) / width) * 100;
    const pct = Math.max(0, Math.min(100, Math.round(raw)));
    const nLabel = tier.id === "stick" ? "Cobre (21+)" : tier.id === "copper" ? "Oro (51+)" : "Diamante (91+)";
    return { progressPct: pct, nextLabel: nLabel };
  }, [points, tier]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-white to-white text-slate-800">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Tus Premios</h1>
          <button
            onClick={fetchUser}
            className="text-xs rounded-lg px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300"
            disabled={loading}
            title="Actualizar"
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
        <p className="text-slate-600 mb-6">
          {name ? <>Hola <b>{name}</b>. Estas son tus recompensas por puntos:</> : "Cargando usuario..."}
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700">Tu nivel actual</h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: `${tier.color}20`, color: tier.color }}>
                {tier.name}
              </span>
            </div>

            <MedalGraphic tier={tier} />

            <div className="mt-4">
              <p className="text-sm text-slate-600">{tier.note}</p>
              <p className="text-sm mt-2">Puntos actuales: <b>{points ?? (loading ? "..." : 0)}</b></p>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Progreso</span><span>{progressPct}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-2 rounded-full transition-all"
                  style={{ width: `${progressPct}%`, background: `linear-gradient(90deg, ${tier.color}, #10b981)` }} />
              </div>
              <div className="text-xs text-slate-500 mt-1">Siguiente nivel: <b>{nextLabel}</b></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Cómo se obtienen</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="inline-flex w-4 h-8 rounded-md" style={{ background: "linear-gradient(180deg,#9A6B3A,#6E4623)" }} />
                <span><b>Palo</b>: 0–20 puntos</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex w-6 h-6 rounded-full" style={{ background: "#B87333" }} />
                <span><b>Cobre</b>: 21–50 puntos</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex w-6 h-6 rounded-full" style={{ background: "#FFD700" }} />
                <span><b>Oro</b>: 51–90 puntos</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex w-0 h-0 border-l-[12px] border-r-[12px] border-b-[18px] border-l-transparent border-r-transparent"
                  style={{ borderBottomColor: "#66E3E9" }} />
                <span><b>Diamante</b>: 91+ puntos</span>
              </li>
            </ul>
            <div className="mt-6 text-xs text-slate-500">
              Sumas <b>5 puntos</b> por cada <b>2 km</b> cuando inicias una ruta desde la sección Rutas. 🚴‍♀️🚶‍♂️
            </div>
          </div>
        </div>

        {err && (
          <div className="mt-6 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg p-3">
            {err}
          </div>
        )}
      </div>
    </div>
  );
}
