import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, ExternalLink, MapPin, Hash, Zap } from 'lucide-react'

const HP_STYLE = {
  cowrie:    { color: 'text-blue-400',   bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  dionaea:   { color: 'text-indigo-400', bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
  honeytrap: { color: 'text-amber-400',  bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  glastopf:  { color: 'text-emerald-400',bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  conpot:    { color: 'text-rose-400',   bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  honeyd:    { color: 'text-pink-400',   bg: 'bg-pink-500/10',    border: 'border-pink-500/20' },
}

const DEFAULT_STYLE = { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' }

export default function RecentAttacks({ attacks }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10">
            <Zap className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white tracking-tight">Live Ingress Feed</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time threat monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-slate-800/50">
              <th className="pb-4 label-sm px-4">Node</th>
              <th className="pb-4 label-sm px-4">Vector / IP</th>
              <th className="pb-4 label-sm px-4 hidden md:table-cell">Region</th>
              <th className="pb-4 label-sm px-4">Classification</th>
              <th className="pb-4 label-sm px-4 hidden sm:table-cell text-center">Port</th>
              <th className="pb-4 label-sm px-4 text-right">Elapsed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            <AnimatePresence initial={false}>
              {attacks?.map((a) => {
                const s = HP_STYLE[a.honeypot] ?? DEFAULT_STYLE
                return (
                  <motion.tr 
                    key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="group hover:bg-slate-400/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className={`badge-premium flex items-center gap-1.5 w-fit ${s.bg} ${s.color} ${s.border}`}>
                        <div className={`w-1 h-1 rounded-full bg-current animate-pulse`} />
                        {a.honeypot}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        to={`/attacks/${a.id}`}
                        className="flex items-center gap-2 font-mono text-cyan-400 hover:text-cyan-300 transition-colors group/link"
                      >
                        <span className="text-xs font-bold leading-none">{a.source_ip}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </Link>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-sm">{getFlagEmoji(a.country_code)}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{a.country_code || '??'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-medium text-slate-200">{a.attack_type || 'Unclassified'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell text-center">
                      <span className="font-mono text-xs text-slate-500 font-bold">{a.dest_port || '—'}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {formatDistanceToNow(new Date(a.timestamp), { locale: es, addSuffix: false })} ago
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
                    <div className="p-4 rounded-full bg-slate-900 border border-slate-800">
                      <ShieldAlert className="w-8 h-8 text-slate-700" />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Awaiting threat data...</p>
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

function getFlagEmoji(countryCode) {
  if (!countryCode) return '🌐'
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char =>  127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}
