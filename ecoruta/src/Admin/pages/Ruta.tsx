// src/Admin/pages/RutaAdmin.tsx
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import {
  MapPin,
  Save,
  Navigation,
  Route,
  Footprints,
  Bike,
  Bus,
  ArrowRight,
  Trash2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import icon from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";
import Navbar from "../components/NavbarAdmin";

const defaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: icon2x,
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

type MapClickHandlerProps = {
  setOrigLat: React.Dispatch<React.SetStateAction<number>>;
  setOrigLng: React.Dispatch<React.SetStateAction<number>>;
  setDestLat: React.Dispatch<React.SetStateAction<number>>;
  setDestLng: React.Dispatch<React.SetStateAction<number>>;
  setStep: React.Dispatch<React.SetStateAction<number>>;
};

function MapClickHandler({
  setOrigLat,
  setOrigLng,
  setDestLat,
  setDestLng,
  setStep,
}: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setStep((prev) => {
        if (prev === 0) {
          setOrigLat(lat);
          setOrigLng(lng);
          return 1;
        } else {
          setDestLat(lat);
          setDestLng(lng);
          return 0;
        }
      });
    },
  });
  return null;
}

/** Acepta path como string o array y normaliza a [[lat,lng], ...] */
const toLatLngs = (raw: any): LatLngTuple[] => {
  try {
    let v = raw;
    if (typeof v === "string") v = JSON.parse(v);
    if (!Array.isArray(v) || !v.length || !Array.isArray(v[0])) return [];

    // ¿viene como [lng,lat]?
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

export default function RutaAdmin() {
  const [origLat, setOrigLat] = useState(2.4412293);
  const [origLng, setOrigLng] = useState(-76.6116028);
  const [destLat, setDestLat] = useState(2.480555);
  const [destLng, setDestLng] = useState(-76.562186);

  const [name, setName] = useState("");
  const [routeCoords, setRouteCoords] = useState<LatLngTuple[]>([]); // polilínea de vista previa
  const [routes, setRoutes] = useState<any[]>([]);
  const [clickStep, setClickStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState("a pie");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Evita dobles envíos del botón Guardar
  const savingRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.get("http://localhost:3333/routes");
      setRoutes(data);
    } catch (err) {
      console.error("Error al cargar rutas:", err);
      setError("Error al cargar las rutas");
    } finally {
      setLoading(false);
    }
  };

  // Usa overview=simplified para que OSRM devuelva menos puntos (solo para visualizar)
  const fetchRoadRoute = async () => {
    const url = `https://router.project-osrm.org/route/v1/driving/${origLng},${origLat};${destLng},${destLat}?overview=simplified&geometries=geojson`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes?.length > 0) {
        const coords: LatLngTuple[] = data.routes[0].geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );
        setRouteCoords(coords);
      } else {
        setRouteCoords([]);
      }
    } catch (err) {
      console.error("Error al obtener ruta:", err);
      setRouteCoords([]);
    }
  };

  useEffect(() => {
    fetchRoadRoute();
  }, [origLat, origLng, destLat, destLng]);

  const calculateDistance = (coords: LatLngTuple[]): number => {
    if (coords.length < 2) return 0;
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      const [lat1, lon1] = coords[i - 1];
      const [lat2, lon2] = coords[i];
      const R = 6371000;
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    }
    return Math.round(total);
  };

  const calculateCO2Savings = (distance: number, mode: string): number => {
    const emissionFactors = { "a pie": 0, bicicleta: 0, colectivo: 0.089 };
    const autoEmission = 0.21;
    const modeEmission = (emissionFactors as any)[mode] ?? 0;
    const km = distance / 1000;
    return Math.round((autoEmission - modeEmission) * km * 100) / 100;
  };

  const handleSaveRoute = async () => {
    if (savingRef.current) return; // candado
    if (!routeCoords.length) {
      alert("Primero selecciona una ruta en el mapa");
      return;
    }
    if (!name.trim()) {
      alert("Por favor ingresa un nombre para la ruta");
      return;
    }

    savingRef.current = true;
    try {
      setLoading(true);
      setError(null);

      const distancia_m = calculateDistance(routeCoords);
      const co2_ahorrado_estimado = calculateCO2Savings(distancia_m, selectedMode);

      // 👇 Solo inicio y fin (lat, lng)
      const pathStartEnd: LatLngTuple[] = [
        [origLat, origLng],
        [destLat, destLng],
      ];

      const nuevaRuta = {
        nombre: name.trim(),
        descripcion: `Ruta EcoAmigable - ${selectedMode}`,
        modo: selectedMode,
        // El backend espera STRING JSON
        path: JSON.stringify(pathStartEnd),
        distancia_m,
        co2_ahorrado_estimado,
        creado_por: 1, // TODO: del usuario autenticado
      };

      await axios.post("http://localhost:3333/routes", nuevaRuta);

      await fetchRoutes();
      setName("");
      setRouteCoords([]);

      alert(
        `¡Ruta guardada exitosamente!\n📍 Distancia: ${(distancia_m / 1000).toFixed(2)} km\n🌱 CO₂ evitado: ${co2_ahorrado_estimado} kg`
      );
    } catch (err) {
      console.error("Error al guardar ruta:", err);
      setError("Error al guardar la ruta");
      alert("Error al guardar la ruta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
      savingRef.current = false;
    }
  };

  const handleDeleteRoute = async (routeId: number) => {
    if (!confirm("¿Estás seguro de eliminar esta ruta?")) return;
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3333/routes/${routeId}`);
      await fetchRoutes();
      alert("Ruta eliminada correctamente");
    } catch (err) {
      console.error("Error al eliminar ruta:", err);
      alert("Error al eliminar la ruta");
    } finally {
      setLoading(false);
    }
  };

  const transportModes = [
    { id: "a pie", label: "A pie", icon: <Footprints className="h-4 w-4" /> },
    { id: "bicicleta", label: "Bicicleta", icon: <Bike className="h-4 w-4" /> },
    { id: "colectivo", label: "Colectivo", icon: <Bus className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-white to-white text-slate-800">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Route className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Ruta Admin</h1>
              <p className="text-slate-600">Crea y gestiona EcoRutas</p>
            </div>
          </div>

          <div className="bg-white/80 border border-emerald-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Navigation className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">¿Cómo usar el planificador?</p>
                <p className="text-xs text-slate-600 mt-1">
                  {clickStep === 0 ? "🎯 Haz clic en el mapa para seleccionar el origen" : "📍 Haz clic para seleccionar el destino"} •
                  Ajusta coordenadas si es necesario • Elige el modo • Guarda la ruta
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
                <MapContainer center={[origLat, origLng]} zoom={13} className="h-full w-full">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <MapClickHandler
                    setOrigLat={setOrigLat}
                    setOrigLng={setOrigLng}
                    setDestLat={setDestLat}
                    setDestLng={setDestLng}
                    setStep={setClickStep}
                  />

                  <Marker position={[origLat, origLng]}>
                    <Popup>📍 Origen</Popup>
                  </Marker>
                  <Marker position={[destLat, destLng]}>
                    <Popup>🎯 Destino</Popup>
                  </Marker>

                  {/* Ruta OSRM para vista previa */}
                  {routeCoords.length > 0 && (
                    <Polyline positions={routeCoords} pathOptions={{ color: "#059669", weight: 4, opacity: 0.8 }} />
                  )}

                  {/* Rutas guardadas (entre inicio y fin guardados) */}
                  {routes.map((r, idx) => {
                    const path: LatLngTuple[] = toLatLngs(r.path); // serán solo 2 puntos
                    if (!path.length) return null;
                    return (
                      <Polyline
                        key={r.id || idx}
                        positions={path}
                        pathOptions={{
                          color: r.modo === "a pie" ? "#10b981" : r.modo === "bicicleta" ? "#3b82f6" : "#f59e0b",
                          weight: 3,
                          opacity: 0.7,
                          dashArray: "5, 10",
                        }}
                        eventHandlers={{
                          click: () => {
                            const distance = r.distancia_m ? `${(r.distancia_m / 1000).toFixed(2)} km` : "N/A";
                            const co2 = r.co2_ahorrado_estimado ? `${r.co2_ahorrado_estimado} kg CO₂` : "N/A";
                            alert(`🌟 ${r.nombre}
📝 ${r.descripcion}
🚶 Modo: ${r.modo}
📏 Distancia (aprox): ${distance}
🌱 CO₂ evitado: ${co2}`);
                          },
                        }}
                      />
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Panel derecho */}
          <div className="space-y-6">
            {/* Modo */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-5">
              <h3 className="font-semibold text-slate-700 mb-4">Modo de transporte</h3>
              <div className="space-y-2">
                {[
                  { id: "a pie", label: "A pie", icon: <Footprints className="h-4 w-4" /> },
                  { id: "bicicleta", label: "Bicicleta", icon: <Bike className="h-4 w-4" /> },
                  { id: "colectivo", label: "Colectivo", icon: <Bus className="h-4 w-4" /> },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      selectedMode === mode.id
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-emerald-50/50"
                    }`}
                  >
                    {mode.icon}
                    <span className="font-medium">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Coordenadas */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-5">
              <h3 className="font-semibold text-slate-700 mb-4">Coordenadas</h3>

              <div className="space-y-4">
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <label className="block text-sm font-medium text-emerald-700 mb-2">📍 Origen</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      value={origLat}
                      onChange={(e) => setOrigLat(parseFloat(e.target.value))}
                      placeholder="Latitud"
                      className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    <input
                      type="number"
                      step="any"
                      value={origLng}
                      onChange={(e) => setOrigLng(parseFloat(e.target.value))}
                      placeholder="Longitud"
                      className="w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <label className="block text-sm font-medium text-blue-700 mb-2">🎯 Destino</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      value={destLat}
                      onChange={(e) => setDestLat(parseFloat(e.target.value))}
                      placeholder="Latitud"
                      className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <input
                      type="number"
                      step="any"
                      value={destLng}
                      onChange={(e) => setDestLng(parseFloat(e.target.value))}
                      placeholder="Longitud"
                      className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Guardar ruta */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-5">
              <h3 className="font-semibold text-slate-700 mb-4">Guardar ruta</h3>

              <div className="space-y-4">
                <input
                  type="text"
                  value={name}
                  placeholder="Ej. Ruta Parque Caldas - SENA"
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />

                <button
                  type="button"
                  onClick={handleSaveRoute}
                  disabled={!routeCoords.length || !name.trim() || loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {loading ? "Guardando..." : "Guardar EcoRuta"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>

              {routeCoords.length > 0 && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-xs text-emerald-700 font-medium">
                    ✅ Ruta previsualizada • {routeCoords.length} puntos • Modo: {selectedMode}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    📏 Distancia: {(calculateDistance(routeCoords) / 1000).toFixed(2)} km • 🌱 CO₂ evitado:{" "}
                    {calculateCO2Savings(calculateDistance(routeCoords), selectedMode)} kg
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    *Al guardar, solo se almacenan las coordenadas de <b>inicio</b> y <b>fin</b>.
                  </p>
                </div>
              )}
            </div>

            {/* Rutas guardadas */}
            {routes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-700">Rutas guardadas ({routes.length})</h3>
                  <button
                    onClick={fetchRoutes}
                    className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                    title="Actualizar lista"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {routes.map((route, idx) => (
                    <div
                      key={route.id || idx}
                      className="group p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-emerald-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">{route.nombre}</p>
                          <p className="text-xs text-slate-500">
                            {route.modo} • {route.descripcion}
                          </p>
                          {route.distancia_m && (
                            <p className="text-xs text-emerald-600 mt-1">
                              📏 {(route.distancia_m / 1000).toFixed(2)} km • 🌱 {route.co2_ahorrado_estimado || 0} kg CO₂
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteRoute(route.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
                          title="Eliminar ruta"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
