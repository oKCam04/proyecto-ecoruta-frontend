// src/User/pages/RutaUser.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import { MapPin, Navigation, Route, RefreshCw, AlertCircle } from "lucide-react";

import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import icon from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";
import Navbar from "../components/Navbar";

const defaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: icon2x,
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

/* Normaliza path a [[lat,lng], ...] aunque venga como string o [lng,lat] */
const toLatLngs = (raw: any): LatLngTuple[] => {
  try {
    let v = raw;
    if (typeof v === "string") v = JSON.parse(v);
    if (!Array.isArray(v) || !v.length || !Array.isArray(v[0])) return [];
    const looksLngLat =
      typeof v[0][0] === "number" &&
      typeof v[0][1] === "number" &&
      Math.abs(v[0][0]) > 90 &&
      Math.abs(v[0][1]) <= 90;
    return v
      .filter((p: any) => Array.isArray(p) && typeof p[0] === "number" && typeof p[1] === "number")
      .map(([a, b]: [number, number]) => (looksLngLat ? [b, a] : [a, b])) as LatLngTuple[];
  } catch {
    return [];
  }
};

function Recenter({ center, zoom = 13 }: { center: LatLngTuple; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

/* Haversine en metros (fallback) */
const haversine = (a: LatLngTuple, b: LatLngTuple): number => {
  const [lat1, lon1] = a;
  const [lat2, lon2] = b;
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const s = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return Math.round(2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)));
};

/* Ahorro CO2 (g) vs auto */
const co2SavingsGrams = (mode: string, distance_m: number): number => {
  const factorsKgPerKm: Record<string, number> = { "a pie": 0, bicicleta: 0, colectivo: 0.089 };
  const car = 0.21;
  const km = distance_m / 1000;
  const savedKg = (car - (factorsKgPerKm[mode] ?? 0)) * km;
  return Math.max(0, Math.round(savedKg * 1000));
};

/* userId desde localStorage, probando varias claves */
const getUserIdFromStorage = (): number | null => {
  const tryParse = (k: string) => {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.id ?? parsed?.userId ?? parsed?.uid ?? parsed?.sub ?? null;
    } catch {
      return null;
    }
  };
  const fromUser = tryParse("user");
  if (fromUser) return Number(fromUser);

  try {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      const cand = payload?.id ?? payload?.userId ?? payload?.uid ?? payload?.sub;
      if (cand) return Number(cand);
    }
  } catch {}
  // intenta otras llaves comunes
  const alt = tryParse("usuario") ?? tryParse("currentUser");
  return alt ? Number(alt) : null;
};

export default function RutaUser() {
  const [center, setCenter] = useState<LatLngTuple>([2.4412293, -76.6116028]);
  const [orig, setOrig] = useState<LatLngTuple>([2.4412293, -76.6116028]);
  const [dest, setDest] = useState<LatLngTuple>([2.480555, -76.562186]);

  const [displayRoute, setDisplayRoute] = useState<LatLngTuple[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const selectedIdRef = useRef<number | null>(null);
  const selectedRouteRef = useRef<any | null>(null);
  const startingRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get("http://localhost:3333/routes");
        setRoutes(data || []);
      } catch (err) {
        console.error("Error al cargar rutas:", err);
        setError("Error al cargar las rutas");
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getOsrmRoute = async (from: LatLngTuple, to: LatLngTuple): Promise<LatLngTuple[]> => {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=simplified&geometries=geojson`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data?.routes?.length) {
        return data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]) as LatLngTuple[];
      }
    } catch (e) {
      console.error("Error OSRM:", e);
    }
    return [];
  };

  const handleSelectRoute = async (r: any) => {
    const path = toLatLngs(r.path);
    if (path.length < 2) {
      console.warn("Ruta con path inválido", r);
      setInfoMsg("Ruta sin coordenadas válidas.");
      setTimeout(() => setInfoMsg(null), 3000);
      return;
    }
    const start = path[0];
    const end = path[path.length - 1];

    selectedIdRef.current = r.id ?? null;
    selectedRouteRef.current = r;
    setOrig(start);
    setDest(end);
    setCenter(start);

    const poly = await getOsrmRoute(start, end);
    setDisplayRoute(poly);
  };

  /** PATCH puntos (5 cada 2km) usando metros de la API */
  const addPointsUsingMeters = async (distance_m: number) => {
    const userId = getUserIdFromStorage();
    console.log("holaaaaaaaaaaaa"+userId)
    console.log("[PUNTOS] userId:", userId);
    if (!userId) {
      setInfoMsg("No se encontró el usuario en localStorage.");
      setTimeout(() => setInfoMsg(null), 3500);
      return;
    }
    const km = distance_m / 1000;
    const toAdd = Math.floor(km / 2) * 5;
    console.log("[PUNTOS] distancia_m:", distance_m, "km:", km, "toAdd:", toAdd);

    if (toAdd <= 0) {
      setInfoMsg(`Ruta de ${km.toFixed(2)} km: no suma puntos (mínimo 2 km).`);
      setTimeout(() => setInfoMsg(null), 3500);
      return;
    }

    try {
      const { data: before } = await axios.get(`http://localhost:3333/users/${userId}`);
      const current = Number(before?.puntos ?? 0);
      const nuevo = current + toAdd;

      const patchRes = await axios.patch(`http://localhost:3333/users/${userId}`, { puntos: nuevo });
      console.log("[PUNTOS] PATCH resp status:", patchRes.status);

      const { data: after } = await axios.get(`http://localhost:3333/users/${userId}`);
      const saved = Number(after?.puntos ?? 0);
      console.log("[PUNTOS] saved en backend:", saved);

      if (saved !== nuevo) {
        setInfoMsg("El backend respondió 200 pero no guardó los puntos.");
        setTimeout(() => setInfoMsg(null), 4000);
        return;
      }

      // refresca cache local
      try {
        const uStr = localStorage.getItem("user");
        if (uStr) {
          const u = JSON.parse(uStr);
          u.puntos = saved;
          localStorage.setItem("user", JSON.stringify(u));
        }
      } catch {}

      setInfoMsg(`¡Sumaste ${toAdd} puntos! Total: ${saved}`);
      setTimeout(() => setInfoMsg(null), 3500);
    } catch (e) {
      console.error("No se pudo actualizar puntos:", e);
      setInfoMsg("Error al actualizar puntos.");
      setTimeout(() => setInfoMsg(null), 3500);
    }
  };

  const handleStartTrip = async (r: any) => {
    if (startingRef.current) return;
    startingRef.current = true;
    try {
      setLoading(true);

      const path = toLatLngs(r.path);
      if (path.length < 2) throw new Error("Path inválido en la ruta seleccionada");

      const start = path[0];
      const end = path[path.length - 1];

      // *** USAR DISTANCIA DE LA API ***
      const apiMetersRaw = r?.distancia_m;
      const apiMeters = Number(apiMetersRaw ?? 0);
      const distancia_m = Number.isFinite(apiMeters) && apiMeters > 0 ? Math.round(apiMeters) : haversine(start, end);
      console.log("[TRIP] distancia usada (m):", distancia_m, " (api:", apiMetersRaw, ")");

      const km = distancia_m / 1000;
      const toAddPreview = Math.floor(km / 2) * 5;
      setInfoMsg(`Vas a registrar ${km.toFixed(2)} km • Puntos a sumar: ${toAddPreview}`);
      setTimeout(() => setInfoMsg(null), 2500);

      const payload = {
        ruta_id: r.id,
        modo: r.modo,
        iniciado_en: new Date().toISOString(),
        terminado_en: null,
        distancia_m,
        co2_ahorrado_g: co2SavingsGrams(r.modo, distancia_m),
        path_registrado: JSON.stringify([start, end]), // solo inicio y fin (string)
      };

      const tripRes = await axios.post("http://localhost:3333/trip-histories", payload);
      console.log("[TRIP] creado status:", tripRes.status);

      // sumar puntos usando distancia de la API
      await addPointsUsingMeters(distancia_m);

      alert("¡Viaje iniciado y registrado!");
    } catch (e) {
      console.error("Error al iniciar viaje:", e);
      alert("No se pudo iniciar el viaje. Reintenta.");
    } finally {
      setLoading(false);
      startingRef.current = false;
    }
  };

  const isSelected = (id: number) => selectedIdRef.current === id;

  // Distancia mostrada (prefiere la de la API de la ruta seleccionada)
  const distanceKm = useMemo(() => {
    const r = selectedRouteRef.current;
    const apiMeters = Number(r?.distancia_m ?? 0);
    if (Number.isFinite(apiMeters) && apiMeters > 0) {
      return +(apiMeters / 1000).toFixed(2);
    }
    if (displayRoute.length >= 2) {
      let total = 0;
      for (let i = 1; i < displayRoute.length; i++) {
        total += haversine(displayRoute[i - 1], displayRoute[i]);
      }
      return +(total / 1000).toFixed(2);
    }
    return +((haversine(orig, dest) / 1000).toFixed(2));
  }, [displayRoute, orig, dest]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-white to-white text-slate-800">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {infoMsg && (
          <div className="mb-4 text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-3 py-2">
            {infoMsg}
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Route className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Escoge tu Ruta</h1>
              <p className="text-slate-600">
                Selecciona una ruta y pulsa <b>Iniciar</b> para registrarla (usamos la distancia oficial de la API).
              </p>
            </div>
          </div>

          <div className="bg-white/80 border border-emerald-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Navigation className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">¿Cómo usar las rutas?</p>
                <p className="text-xs text-slate-600 mt-1">
                  Al iniciar, se guarda solo el <b>inicio</b> y <b>fin</b> y se suman puntos según <b>distancia_m</b> de la API
                  (5 puntos cada 2 km).
                </p>
              </div>
              {loading && <RefreshCw className="h-4 w-4 text-emerald-600 animate-spin" />}
            </div>
            {error && (
              <div className="mt-2 flex items-center gap-2 text-red-600 text-xs">
                <AlertCircle className="h-3 w-3" />
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mapa */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden">
              <div className="p-4 border-b border-emerald-100 bg-emerald-50/30">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  Mapa Interactivo
                </h3>
              </div>

              <div className="h-[500px] w-full">
                <MapContainer center={center} zoom={13} className="h-full w-full">
                  <Recenter center={center} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <Marker position={orig}><Popup>📍 Origen</Popup></Marker>
                  <Marker position={dest}><Popup>🎯 Destino</Popup></Marker>
                  {displayRoute.length > 0 && (
                    <Polyline positions={displayRoute} pathOptions={{ color: "#059669", weight: 4, opacity: 0.85 }} />
                  )}
                </MapContainer>
              </div>

              <div className="px-4 py-3 border-t border-emerald-100 bg-emerald-50/30 text-xs text-emerald-700">
                Distancia estimada: <b>{distanceKm} km</b>
              </div>
            </div>
          </div>

          {/* Lista de rutas */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-700">Rutas disponibles ({routes.length})</h3>
                <button
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const { data } = await axios.get("http://localhost:3333/routes");
                      setRoutes(data || []);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="Actualizar lista"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto">
                {routes.map((r: any) => {
                  const selected = isSelected(r.id);
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleSelectRoute(r)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selected ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200 hover:bg-emerald-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{r.nombre}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {r.modo} • {r.descripcion}
                            {Number(r?.distancia_m) > 0 && <> • {(Number(r.distancia_m) / 1000).toFixed(2)} km</>}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            await handleSelectRoute(r);   // pinta en mapa
                            await handleStartTrip(r);     // crea trip + suma puntos
                          }}
                          className={`shrink-0 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${
                            selected ? "bg-emerald-700 text-white hover:bg-emerald-800" : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                          title="Iniciar"
                        >
                          Iniciar
                        </button>
                      </div>
                    </div>
                  );
                })}
                {routes.length === 0 && <p className="text-xs text-slate-500">No hay rutas disponibles.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
