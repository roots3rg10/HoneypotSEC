import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import { Globe } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

function getFlagEmoji(countryCode) {
  if (!countryCode) return '🌐'
  return String.fromCodePoint(...countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt()))
}

export default function AttackMap({ countries }) {
  return (
    <div className="glass-card p-0 overflow-hidden relative" style={{ height: '420px' }}>
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-amber-400" />
          <h3 className="font-display font-bold text-sm tracking-widest text-white uppercase">
            Vectores de amenaza global
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" style={{ boxShadow: '0 0 6px rgba(251,191,36,0.6)' }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Ataques activos
            </span>
          </div>
          <span className="badge-premium badge-amber">
            {countries?.length ?? 0} países
          </span>
        </div>
      </div>

      <MapContainer
        center={[20, 10]}
        zoom={2.2}
        style={{ height: '364px', background: '#050505' }}
        zoomControl={false}
        attributionControl={false}
        className="z-10"
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {countries?.map(c => c.latitude && c.longitude && (
          <CircleMarker
            key={c.country_code}
            center={[c.latitude, c.longitude]}
            radius={Math.min(4 + Math.log2(c.count + 1) * 2.5, 20)}
            pathOptions={{
              color:       'rgba(251,191,36,0.9)',
              fillColor:   '#FBBF24',
              fillOpacity: 0.25,
              weight:      1.5,
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div style={{ background: '#0a0a0a', border: '1px solid rgba(251,191,36,0.2)', padding: '8px 12px', borderRadius: '10px', minWidth: '120px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '18px' }}>{getFlagEmoji(c.country_code)}</span>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'white', fontSize: '12px' }}>{c.country}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total hits</span>
                  <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#FBBF24', fontSize: '13px' }}>{c.count.toLocaleString()}</span>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
