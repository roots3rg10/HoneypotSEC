import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAttacks, getHoneypots } from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Shield, 
  Activity, 
  Globe, 
  Clock, 
  ChevronLeft, 
  ExternalLink,
  Cpu,
  Lock,
  Network
} from 'lucide-react'

const HP_META = {
  cowrie:    { label: 'Cowrie Tactical Node',    icon: Lock,    desc: 'Advanced SSH & Telnet emulation layer. Monitors brute-force attempts, session interactions, and post-exploitation command sequences.', color: 'text-cyan-400',   border: 'border-cyan-500/20',   bg: 'bg-cyan-500/10',   ports: '2222 SSH, 2323 Telnet' },
  dionaea:   { label: 'Dionaea Multi-Threat',    icon: Activity,desc: 'High-interaction multi-protocol sensor. Traps complex exploits, malware propagation, and automated network scanning vectors.', color: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'bg-indigo-500/10', ports: '21 FTP, 445 SMB, 3306 MySQL' },
  glastopf:  { label: 'Glastopf Web Ingress',    icon: Globe,   desc: 'Dynamic web application vulnerability emulator. Classifies LFI, RFI, SQLi, and specialized botnet crawler patterns.', color: 'text-emerald-400',border: 'border-emerald-500/20',bg: 'bg-emerald-500/10',ports: '8080 HTTP' },
  conpot:    { label: 'Conpot Industrial ICS',   icon: Cpu,     desc: 'Industrial Control System simulator. Mimics PLC infrastructure to identify reconnaissance against critical energy and utility networks.', color: 'text-rose-400',    border: 'border-rose-500/20',    bg: 'bg-rose-500/10',    ports: '102 S7, 502 Modbus' },
  honeytrap: { label: 'Honeytrap Global Sink',   icon: Shield,  desc: 'Generic TCP/UDP listener architecture. Acts as a catch-all sink for unexpected network traffic across any unallocated port range.', color: 'text-amber-400',   border: 'border-amber-500/20',   bg: 'bg-amber-500/10',   ports: 'Wildcard TCP/UDP' },
  honeyd:    { label: 'Honeyd Virtual Fabric',   icon: Network, desc: 'Virtual network topology engine. Simulates entire subnet structures to monitor lateral movement and internal botnet communication.', color: 'text-pink-400',    border: 'border-pink-500/20',    bg: 'bg-pink-500/10',    ports: 'Multiple Virtual Ports' },
}

export default function HoneypotDetail() {
  const { name } = useParams()
  const meta = HP_META[name] ?? { label: name, icon: Shield, desc: '', color: 'text-slate-400', border: 'border-slate-800', bg: 'bg-slate-800/20', ports: '—' }

  const [attacks, setAttacks]   = useState([])
  const [hpStats, setHpStats]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const LIMIT = 50

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [aRes, hRes] = await Promise.all([
        getAttacks({ honeypot: name, page, limit: LIMIT }),
        getHoneypots(),
      ])
      setAttacks(aRes.data.items)
      setTotal(aRes.data.total)
      const stat = hRes.data.find(h => h.honeypot === name)
      setHpStats(stat ?? { honeypot: name, count: 0 })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [name, page])

  useEffect(() => { setPage(1) }, [name])
  useEffect(() => { load() }, [load])

  const uniqueIPs  = [...new Set(attacks.map(a => a.source_ip))].length
  const countries  = [...new Set(attacks.map(a => a.country).filter(Boolean))].length
  const lastSeen   = attacks[0]?.timestamp

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto p-2 pb-20"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-2">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Command
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Operational</span>
        </div>
      </div>

      <div className={`glass-card overflow-hidden relative border ${meta.border}`}>
        <div className={`absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l ${meta.bg} to-transparent opacity-30 pointer-events-none`} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-2xl ${meta.bg} ${meta.color}`}>
                <meta.icon className="w-8 h-8" />
              </div>
              <div>
                <h2 className={`stat-value ${meta.color} mb-1`}>{meta.label}</h2>
                <div className="flex items-center gap-2">
                  <span className="badge-premium badge-cyan">{meta.ports}</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Listening</span>
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">{meta.desc}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 min-w-[140px]">
              <p className="label-sm mb-1">Total Hits</p>
              <p className={`text-2xl font-display font-black ${meta.color}`}>
                {hpStats?.count?.toLocaleString() ?? '—'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/50 min-w-[140px]">
              <p className="label-sm mb-1">Global Reach</p>
              <p className="text-2xl font-display font-black text-white">
                {countries || '—'} <span className="text-[10px] text-slate-500 uppercase">Regions</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Unique Attack Vectors', value: uniqueIPs, icon: Globe, color: 'text-cyan-400' },
          { label: 'System Uptime', value: '99.9%', icon: Activity, color: 'text-emerald-400' },
          { label: 'Last Intelligence', value: lastSeen ? formatDistanceToNow(new Date(lastSeen), { locale: es, addSuffix: true }) : '—', icon: Clock, color: 'text-slate-300' },
        ].map(s => (
          <div key={s.label} className="glass-card flex items-center gap-4 p-5">
            <div className="p-2.5 rounded-xl bg-slate-800/50 text-slate-400">
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="label-sm mb-0.5">{s.label}</p>
              <p className={`text-lg font-display font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Attack Log */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800">
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white tracking-tight">Intelligence Log</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Filtered by node: {name}</p>
            </div>
          </div>
          <span className="badge-premium bg-slate-800 text-slate-400 border-slate-700">
            {total.toLocaleString()} total entries
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
            <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-xs font-bold uppercase tracking-widest">Accessing records...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-800/50">
                    <th className="pb-4 px-4 label-sm">IP Source</th>
                    <th className="pb-4 px-4 label-sm">Region</th>
                    <th className="pb-4 px-4 label-sm">Classification</th>
                    <th className="pb-4 px-4 label-sm">Protocol</th>
                    <th className="pb-4 px-4 label-sm text-center">Port</th>
                    <th className="pb-4 px-4 label-sm">Identity</th>
                    <th className="pb-4 px-4 label-sm text-right">Elapsed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {attacks.map(a => (
                    <tr key={a.id} className="group hover:bg-slate-400/5 transition-colors">
                      <td className="py-4 px-4">
                        <Link
                          to={`/attacks/${a.id}`}
                          className="flex items-center gap-2 font-mono text-cyan-400 hover:text-cyan-300 transition-colors group/link"
                        >
                          <span className="text-xs font-bold leading-none">{a.source_ip}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFlagEmoji(a.country_code)}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{a.country_code || '??'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-medium text-slate-200">{a.attack_type || 'Unclassified'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="badge-premium bg-slate-800/50 text-slate-500 border-slate-800/50 font-mono tracking-normal capitalize">{a.protocol || 'Unknown'}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-mono text-xs text-slate-500 font-bold">{a.dest_port || '—'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-mono text-amber-500/60 font-medium truncate max-w-[120px] block">{a.username || '—'}</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">
                          {formatDistanceToNow(new Date(a.timestamp), { locale: es, addSuffix: false })} ago
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-800/50">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-6 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  Previous Page
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Record Block</span>
                  <span className="px-3 py-1 rounded-lg bg-slate-800 text-cyan-400 font-mono font-bold text-xs">
                    {page} / {Math.ceil(total / LIMIT)}
                  </span>
                </div>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / LIMIT)}
                  className="px-6 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:border-slate-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                  Next Page
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
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
