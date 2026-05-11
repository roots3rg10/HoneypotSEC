import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, ExternalLink, Zap } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const HP_STYLE_DARK = {
  cowrie:    { color: 'rgba(255,255,255,0.85)', bg: 'rgba(255,255,255,0.05)',  border: 'rgba(255,255,255,0.1)'  },
  dionaea:   { color: '#60A5FA',                bg: 'rgba(96,165,250,0.08)',   border: 'rgba(96,165,250,0.18)'  },
  honeytrap: { color: '#A78BFA',                bg: 'rgba(167,139,250,0.08)',  border: 'rgba(167,139,250,0.18)' },
  glastopf:  { color: '#FB923C',                bg: 'rgba(251,146,60,0.08)',   border: 'rgba(251,146,60,0.18)'  },
  conpot:    { color: '#fb7185',                bg: 'rgba(251,113,133,0.08)',  border: 'rgba(251,113,133,0.18)' },
  honeyd:    { color: '#34D399',                bg: 'rgba(52,211,153,0.08)',   border: 'rgba(52,211,153,0.18)'  },
}
const HP_STYLE_LIGHT = {
  cowrie:    { color: '#1e293b',  bg: 'rgba(0,0,0,0.04)',   border: 'rgba(0,0,0,0.12)'   },
  dionaea:   { color: '#1d4ed8',  bg: 'rgba(29,78,216,0.07)', border: 'rgba(29,78,216,0.18)' },
  honeytrap: { color: '#7c3aed',  bg: 'rgba(124,58,237,0.07)', border: 'rgba(124,58,237,0.18)' },
  glastopf:  { color: '#c2410c',  bg: 'rgba(194,65,12,0.07)', border: 'rgba(194,65,12,0.18)' },
  conpot:    { color: '#be123c',  bg: 'rgba(190,18,60,0.07)', border: 'rgba(190,18,60,0.18)' },
  honeyd:    { color: '#065f46',  bg: 'rgba(6,95,70,0.07)',  border: 'rgba(6,95,70,0.18)'  },
}
const DEFAULT_DARK  = { color: 'rgba(255,255,255,0.4)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' }
const DEFAULT_LIGHT = { color: 'rgba(0,0,0,0.5)',       bg: 'rgba(0,0,0,0.04)',       border: 'rgba(0,0,0,0.1)'       }

function getFlagEmoji(countryCode) {
  if (!countryCode) return '🌐'
  return String.fromCodePoint(...countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt()))
}

export default function RecentAttacks({ attacks }) {
  const { isDark } = useTheme()
  const HP_STYLE  = isDark ? HP_STYLE_DARK  : HP_STYLE_LIGHT
  const DEFAULT   = isDark ? DEFAULT_DARK   : DEFAULT_LIGHT

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--txt)' }}>Feed de ataques en vivo</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt-3)' }}>
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
            <tr className="text-left" style={{ borderBottom: '1px solid var(--border)' }}>
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
                const s = HP_STYLE[a.honeypot] ?? DEFAULT
                return (
                  <motion.tr
                    key={a.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="group transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--inset)'}
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
                        className="flex items-center gap-2 font-mono text-xs font-bold text-amber-400 hover:opacity-75 transition-opacity group/link"
                      >
                        {a.source_ip}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getFlagEmoji(a.country_code)}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--txt-2)' }}>
                          {a.country_code || '??'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3" style={{ color: 'var(--txt-3)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--txt-1)' }}>{a.attack_type || 'Sin clasificar'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 hidden sm:table-cell text-center">
                      <span className="font-mono text-xs font-bold" style={{ color: 'var(--txt-2)' }}>
                        {a.dest_port || '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--txt-3)' }}>
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
                    <div className="p-4 rounded-full" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <ShieldAlert className="w-7 h-7" style={{ color: 'var(--txt-4)' }} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt-3)' }}>
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
