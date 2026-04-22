import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import { MapPin, Globe } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

export default function AttackMap({ countries }) {
  return (
    <div className="glass-card p-0 overflow-hidden relative" style={{ height: '420px' }}>
      <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <h3 className="font-display font-bold text-sm tracking-tight text-white uppercase">Global Threat Vectors</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Hits</span>
          </div>
          <span className="badge-premium badge-cyan">
            {countries?.length ?? 0} Countries
          </span>
        </div>
      </div>
      
      <MapContainer
        center={[20, 10]}
        zoom={2.2}
        style={{ height: '360px', background: '#020617' }}
        zoomControl={false}
        attributionControl={false}
        className="z-10"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {countries?.map(c => c.latitude && c.longitude && (
          <CircleMarker
            key={c.country_code}
            center={[c.latitude, c.longitude]}
            radius={Math.min(4 + Math.log2(c.count + 1) * 2.5, 20)}
            pathOptions={{
              color:       'rgba(6,182,212,0.8)',
              fillColor:   '#06b6d4',
              fillOpacity: 0.3,
              weight:      1,
            }}
          >
            <Tooltip className="premium-tooltip" direction="top" offset={[0, -10]} opacity={1}>
              <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-2 rounded-lg shadow-2xl min-w-[120px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{getFlagEmoji(c.country_code)}</span>
                  <span className="font-bold text-white text-xs">{c.country}</span>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Total Hits</span>
                  <span className="text-cyan-400 font-mono font-bold text-sm leading-none">{c.count.toLocaleString()}</span>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/20 rounded-tl-2xl pointer-events-none z-20" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-500/20 rounded-br-2xl pointer-events-none z-20" />
    </div>
  )
}

function getFlagEmoji(countryCode) {
  if (!countryCode) return '🌐'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
