import Navbar from "../components/NavbarAdmin";
import { Leaf, Bike, Footprints, Bus, Map, Compass, ShieldCheck, Star, ArrowRight } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-white to-white text-slate-800">
      <Navbar />
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid md:grid-cols-2 gap-8 py-14 md:py-20 items-center">
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
              Rutas más verdes, ciudades más sanas.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              EcoRutas te propone trayectos <span className="font-semibold text-emerald-700">a pie</span>, en <span className="font-semibold text-emerald-700">bicicleta</span> o en <span className="font-semibold text-emerald-700">transporte colectivo</span>. Optimiza por seguridad,
              sombra, pendientes y calidad del aire para que moverte sea agradable y sostenible.
            </p>

            {/* BUSCADOR / CTA */}
            <div className="mt-6 bg-white/80 border border-emerald-100 rounded-2xl p-3 shadow-sm">
              <form className="grid md:grid-cols-[1fr_1fr_auto] gap-3">
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Origen (ej. Parque Caldas)" />
                <input className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Destino (ej. SENA CTPI)" />
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 bg-emerald-600 text-white font-medium hover:bg-emerald-700">
                  Buscar ruta
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 border border-emerald-100"><Footprints className="h-3 w-3" /> A pie</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 border border-emerald-100"><Bike className="h-3 w-3" /> Bicicleta</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 border border-emerald-100"><Bus className="h-3 w-3" /> Colectivo</span>
              </div>
            </div>


            <div className="relative">
              {/* Aquí va el mapa ocupando el cuadro verde */}
              <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-2xl">
                <MapContainer
                  center={[2.4448, -76.6147]}
                  zoom={14}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                  className="z-0"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <Marker position={[2.4448, -76.6147]}>
                    <Popup>📍 Punto de inicio</Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-lg p-4 border border-emerald-100 z-10">
                <div className="flex items-center gap-3">
                  <Map className="h-10 w-10 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold">Ruta Verde sugerida</p>
                    <p className="text-xs text-slate-600">Sombra + vías calmadas + ciclorutas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold">Pensado para moverte mejor</h2>
        <p className="mt-2 text-slate-600">Priorizamos seguridad, bienestar y planeta.</p>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: <ShieldCheck className="h-5 w-5" />, title: "Seguridad primero", desc: "Evita vías peligrosas, prioriza andenes y ciclorutas con mejor iluminación." },
            { icon: <Leaf className="h-5 w-5" />, title: "Calidad del aire", desc: "Rutas con menor exposición a contaminación cuando sea posible." },
            { icon: <Compass className="h-5 w-5" />, title: "Menos pendiente", desc: "Sugerimos caminos con desnivel moderado para que llegues fresco." },
            { icon: <Footprints className="h-5 w-5" />, title: "Modo a pie", desc: "Atajos peatonales, pasos seguros y cruces recomendados." },
            { icon: <Bike className="h-5 w-5" />, title: "Modo bici", desc: "Red de ciclorutas, calles calmadas y puntos de parqueo." },
            { icon: <Bus className="h-5 w-5" />, title: "Colectivo", desc: "Transbordos óptimos, tiempos estimados y paraderos cercanos." },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                {f.icon}
              </div>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" className="bg-emerald-50/60 border-y border-emerald-100 py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl md:text-3xl font-bold">¿Cómo funciona?</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {[
              { title: "Elige tu modo", desc: "A pie, bicicleta o colectivo según tu preferencia.", num: 1 },
              { title: "Compara alternativas", desc: "Evalúa seguridad, sombra, pendientes y tiempo.", num: 2 },
              { title: "Sigue la ruta", desc: "Navegación paso a paso con puntos de interés verdes.", num: 3 },
            ].map((s) => (
              <div key={s.num} className="relative rounded-2xl bg-white p-6 border border-emerald-100 shadow-sm">
                <span className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shadow">{s.num}</span>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACTO */}
      <section id="impacto" className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">Tu movilidad, con impacto positivo</h2>
            <p className="mt-3 text-slate-600">Cada vez que eliges una EcoRuta, reduces emisiones y mejoras tu salud. Nuestro algoritmo estima CO₂ evitado y calorías quemadas por trayecto.</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                <p className="text-xs text-slate-500">CO₂ evitado (semana)</p>
                <p className="text-2xl font-extrabold text-emerald-700">2.3 kg</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-white p-4">
                <p className="text-xs text-slate-500">Calorías quemadas</p>
                <p className="text-2xl font-extrabold text-emerald-700">1,120 kcal</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 border border-emerald-100 shadow-sm">
            <div className="flex items-start gap-3">
              <Star className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-slate-700">
                  "Me demoro parecido a ir en carro, pero ahora voy por calles arboladas y ciclorutas. Llegar se siente mejor".
                </p>
                <p className="text-sm text-slate-500 mt-2">— Valentina, Popayán</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-emerald-100">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-600">
            <Leaf className="h-5 w-5 text-emerald-600" />
            <span>EcoRutas © {new Date().getFullYear()}</span>
          </div>
          <div className="text-sm text-slate-500">Hecho con ❤️ para ciudades caminables y pedaleables</div>
        </div>
      </footer>
    </div>
  )
}

export default Home;