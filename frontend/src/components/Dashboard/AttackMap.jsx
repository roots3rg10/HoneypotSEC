import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export default function AttackMap({ countries }) {
  return (
    <div className="card p-0 overflow-hidden" style={{ height: '380px' }}>
      <p className="text-sm font-semibold text-gray-300 p-4 pb-0">Mapa de origen de ataques</p>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '340px', background: '#0f1629' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a>'
        />
        {countries?.map(c => c.latitude && c.longitude && (
          <CircleMarker
            key={c.country_code}
            center={[c.latitude, c.longitude]}
            radius={Math.min(4 + Math.log2(c.count + 1) * 3, 20)}
            pathOptions={{ color: '#ff4444', fillColor: '#ff4444', fillOpacity: 0.7 }}
          >
            <Tooltip>
              <span className="font-semibold">{c.country}</span>
              <br />{c.count.toLocaleString()} ataques
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
