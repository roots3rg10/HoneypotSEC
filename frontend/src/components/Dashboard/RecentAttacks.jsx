import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, ExternalLink, Zap } from 'lucide-react'

const HP_STYLE = {
  cowrie:    { color: 'rgba(255,255,255,0.8)',  bg: 'rgba(255,255,255,0.05)',  border: 'rgba(255,255,255,0.1)'  },
  dionaea:   { color: 'rgba(255,255,255,0.6)',  bg: 'rgba(255,255,255,0.04)',  border: 'rgba(255,255,255,0.08)' },
  honeytrap: { color: '#FCD34D',                bg: 'rgba(252,211,77,0.08)',   border: 'rgba(252,211,77,0.15)'  },
  glastopf:  { color: '#FBBF24',               bg: 'rgba(251,191,36,0.08)',   border: 'rgba(251,191,36,0.15)'  },
  conpot:    { color: '#fb7185',               bg: 'rgba(251,113,133,0.08)',  border: 'rgba(251,113,133,0.15)' },
  honeyd:    { color: 'rgba(148,163,184,0.7)', bg: 'rgba(148,163,184,0.05)', border: 'rgba(148,163,184,0.1)'  },
}
const DEFAULT_STYLE = { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' }

function getFlagEmoji(countryCode) {
  if (!countryCode) return '🌐'
  return String.fromCodePoint(...countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt()))
}

export default function RecentAttacks({ attacks }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.12)' }}>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white tracking-tight">Feed de ataques en vivo</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Monitorización de amenazas en tiempo real
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
          </span>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">En vivo</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th className="pb-4 label-sm px-3">Nodo</th>
              <th className="pb-4 label-sm px-3">IP</th>
              <th className="pb-4 label-sm px-3 hidden md:table-cell">Región</th>
              <th className="pb-4 label-sm px-3">Clasificación</th>
              <th className="pb-4 label-sm px-3 hidden sm:table-cell text-center">Puerto</th>
              <th className="pb-4 label-sm px-3 text-right">Hace</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {attacks?.map((a) => {
                const s = HP_STYLE[a.honeypot] ?? DEFAULT_STYLE
                return (
                  <motion.tr
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="group transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="py-3.5 px-3">
                      <span className="badge-premium text-[10px]"
                        style={{ color: s.color, background: s.bg, borderColor: s.border }}>
                        {a.honeypot}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <Link
                        to={`/attacks/${a.id}`}
                        className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors group/link"
                      >
                        {a.source_ip}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getFlagEmoji(a.country_code)}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {a.country_code || '??'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
                        <span className="text-xs font-medium text-white/70">{a.attack_type || 'Sin clasificar'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 hidden sm:table-cell text-center">
                      <span className="font-mono text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {a.dest_port || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {formatDistanceToNow(new Date(a.timestamp), { locale: es, addSuffix: true })}
                      </span>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
            {!attacks?.length && (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <ShieldAlert className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.15)' }} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      Esperando datos de amenazas...
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
