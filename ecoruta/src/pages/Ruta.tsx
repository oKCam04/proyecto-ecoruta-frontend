import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Navbar from "../components/Navbar";

import icon2x from "leaflet/dist/images/marker-icon-2x.png";
import icon from "leaflet/dist/images/marker-icon.png";
import shadow from "leaflet/dist/images/marker-shadow.png";
const defaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: icon2x,
  shadowUrl: shadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

export default function MapaSimple() {
  // Origen
  const [origLat, setOrigLat] = useState(2.4412293);
  const [origLng, setOrigLng] = useState(-76.6116028);
  // Destino
  const [destLat, setDestLat] = useState(4.65);
  const [destLng, setDestLng] = useState(-74.1);

  const coordsOrigen: LatLngTuple = [origLat, origLng];
  const coordsDestino: LatLngTuple = [destLat, destLng];

  return (
    <div style={{ height: "60vh", width: "100%" }}>
        <Navbar />
      <MapContainer center={coordsOrigen} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={coordsOrigen}><Popup>Origen</Popup></Marker>
        <Marker position={coordsDestino}><Popup>Destino</Popup></Marker>
        <Polyline positions={[coordsOrigen, coordsDestino]} pathOptions={{ color: "red" }} />
      </MapContainer>

      {/* Controles súper simples */}
      <div className="p-4">
  <div className="grid gap-4 md:grid-cols-2">
    {/* Origen */}
    <fieldset className="rounded-2xl border bg-white shadow-sm p-4">
      <legend className="px-1 text-sm font-semibold text-gray-700">Origen</legend>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label htmlFor="origLat" className="text-xs font-medium text-gray-600">Latitud</label>
          <input id="origLat" type="number" step="any" value={origLat}
            onChange={(e) => setOrigLat(parseFloat(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="2.4412293"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="origLng" className="text-xs font-medium text-gray-600">Longitud</label>
          <input id="origLng" type="number" step="any" value={origLng}
            onChange={(e) => setOrigLng(parseFloat(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="-76.6116028"
          />
        </div>
      </div>
    </fieldset>

    {/* Destino */}
    <fieldset className="rounded-2xl border bg-white shadow-sm p-4">
      <legend className="px-1 text-sm font-semibold text-gray-700">Destino</legend>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label htmlFor="destLat" className="text-xs font-medium text-gray-600">Latitud</label>
          <input id="destLat" type="number" step="any" value={destLat}
            onChange={(e) => setDestLat(parseFloat(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="4.65"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="destLng" className="text-xs font-medium text-gray-600">Longitud</label>
          <input id="destLng" type="number" step="any" value={destLng}
            onChange={(e) => setDestLng(parseFloat(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="-74.1"
          />
            </div>
        </div>
    </fieldset>
    </div>
    </div>

    </div>
  );
}

