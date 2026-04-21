import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function AttackMap({ countries }) {
  return (
    <div className="card p-0 overflow-hidden" style={{ height: '380px' }}>
      <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-gray-700/50">
        <p className="section-title mb-0">Origen de ataques</p>
        <span className="text-xs text-gray-500">
          {countries?.length ?? 0} países detectados
        </span>
      </div>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '330px', background: '#0a0f1e' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {countries?.map(c => c.latitude && c.longitude && (
          <CircleMarker
            key={c.country_code}
            center={[c.latitude, c.longitude]}
            radius={Math.min(5 + Math.log2(c.count + 1) * 3, 22)}
            pathOptions={{
              color:       'rgba(244,63,94,0.8)',
              fillColor:   '#f43f5e',
              fillOpacity: 0.5,
              weight:      1,
            }}
          >
            <Tooltip className="map-tooltip">
              <span className="font-semibold text-gray-100">{c.country}</span>
              <br />
              <span className="text-rose-400 font-mono">{c.count.toLocaleString()}</span>
              <span className="text-gray-400"> ataques</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
