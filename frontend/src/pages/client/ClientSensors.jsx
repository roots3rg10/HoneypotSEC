import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Globe, Cpu, Activity, Zap, Layers, Lock,
  Terminal, Copy, Check, CheckCircle2, TrendingUp, Wifi, WifiOff,
  History, ChevronLeft, ChevronRight, Database, Download,
  ChevronDown, Key, Code2, FileText, BarChart2, Network,
} from 'lucide-react'
import {
  getMySensors,
  getMyAttacks,
  getClientHoneypots,
} from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { usePreviewUser } from '../../context/PreviewUserContext'
import { hasPlan } from '../../components/PlanGate'
import { Link } from 'react-router-dom'

// ─── constants ────────────────────────────────────────────────
const PLAN_RETENTION      = { basico: 30, profesional: 90, empresarial: 180 }
const PLAN_RETENTION_LABEL = { basico: '1 mes', profesional: '3 meses', empresarial: '6 meses' }

const SENSOR_META = {
  cowrie:    { label: 'Cowrie',    desc: 'SSH / Telnet',   icon: Shield,   color: '#60a5fa', port: '2222 / 2323' },
  dionaea:   { label: 'Dionaea',   desc: 'Multi-proto',    icon: Layers,   color: '#94a3b8', port: '21 / 445 / 3306' },
  glastopf:  { label: 'Glastopf',  desc: 'Aplicación web', icon: Globe,    color: '#FBBF24', port: '8080' },
  conpot:    { label: 'Conpot',    desc: 'ICS / SCADA',    icon: Cpu,      color: '#fb7185', port: '102 / 502' },
  honeytrap: { label: 'Honeytrap', desc: 'TCP / UDP',      icon: Activity, color: '#fde68a', port: 'dinámico' },
  honeyd:    { label: 'Honeyd',    desc: 'Red virtual',    icon: Zap,      color: '#34d399', port: 'múltiple' },
}

const ACTIVE_BY_PLAN = {
  basico:      ['cowrie', 'dionaea'],
  profesional: Object.keys(SENSOR_META),
  empresarial: Object.keys(SENSOR_META),
}

const INSTALL_STEPS = [
  { n: '1', text: 'El equipo de HoneypotSEC genera tu comando personalizado desde el panel de administración.' },
  { n: '2', text: 'Recibes el comando por email. Solo necesitas un servidor Linux con acceso a Internet.' },
  { n: '3', text: 'Ejecutas el comando como root. El instalador configura todo automáticamente.' },
  { n: '4', text: 'Los ataques detectados aparecen en este panel en cuestión de minutos.' },
]

// Tabs per honeypot
const HP_TABS = {
  cowrie:    ['Resumen', 'Ataques', 'Credenciales & Comandos', 'Exportar'],
  dionaea:   ['Resumen', 'Ataques', 'Protocolos & Payloads',   'Exportar'],
  glastopf:  ['Resumen', 'Ataques', 'Peticiones Web',          'Exportar'],
  conpot:    ['Resumen', 'Ataques', 'Comandos ICS',            'Exportar'],
  honeytrap: ['Resumen', 'Ataques', 'Puertos & Payloads',      'Exportar'],
  honeyd:    ['Resumen', 'Ataques', 'Red Virtual',             'Exportar'],
}

// ─── helpers ──────────────────────────────────────────────────
function getFlagEmoji(code) {
  if (!code) return '🌐'
  return String.fromCodePoint(...code.toUpperCase().split('').map(c => 127397 + c.charCodeAt()))
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Nunca'
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)    return 'Hace menos de 1 min'
  if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`
  return `Hace ${Math.floor(diff / 86400)} días`
}

function fmtTs(ts) {
  return new Date(ts).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function downloadCSV(attacks, filename) {
  if (!attacks.length) return
  const cols = ['timestamp', 'source_ip', 'dest_port', 'country', 'attack_type',
                 'username', 'password', 'payload', 'session_id', 'honeypot']
  const header = cols.join(',')
  const rows = attacks.map(a =>
    cols.map(c => {
      const v = a[c] ?? ''
      const s = String(v).replace(/"/g, '""')
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s
    }).join(',')
  )
  const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function freq(arr) {
  const map = {}
  arr.forEach(v => { if (v) map[v] = (map[v] || 0) + 1 })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
}

// ─── sub-components ───────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex justify-center py-10">
      <div className="w-5 h-5 rounded-full animate-spin"
        style={{ border: '2px solid rgba(251,191,36,0.15)', borderTopColor: '#FBBF24' }} />
    </div>
  )
}

function AttackRow({ a }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="px-5 py-3 flex items-start gap-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: 'var(--txt)' }}>
          {a.attack_type || 'Evento desconocido'}
        </p>
        <p className="text-[10px] mt-0.5 flex flex-wrap gap-x-2" style={{ color: 'var(--txt-3)' }}>
          <span className="font-mono">{a.source_ip}</span>
          {a.country && <span>{getFlagEmoji(a.country_code)} {a.country}</span>}
          {a.dest_port && <span>Puerto {a.dest_port}</span>}
          {a.username  && <span className="text-amber-400/70">user: {a.username}</span>}
          {a.password  && <span className="text-rose-400/70">pw: {a.password}</span>}
          {a.payload   && <span className="truncate max-w-[180px] font-mono">{a.payload}</span>}
        </p>
      </div>
      <span className="text-[10px] shrink-0" style={{ color: 'var(--txt-3)' }}>{fmtTs(a.timestamp)}</span>
    </motion.div>
  )
}

function BarMini({ label, count, max, color }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] truncate w-32 shrink-0" style={{ color: 'var(--txt-2)' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] w-8 text-right shrink-0" style={{ color: 'var(--txt-3)' }}>{count}</span>
    </div>
  )
}

// Tab: Resumen
function TabResumen({ attacks, hpStat, color }) {
  if (!attacks) return <Spinner />

  const uniqueIps    = [...new Set(attacks.map(a => a.source_ip))].length
  const topTypes     = freq(attacks.map(a => a.attack_type)).slice(0, 5)
  const topIPs       = freq(attacks.map(a => a.source_ip)).slice(0, 5)
  const maxType      = topTypes[0]?.[1] || 1
  const maxIP        = topIPs[0]?.[1] || 1

  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* KPIs */}
      <div className="space-y-3">
        <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Métricas 7d</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Ataques',   value: hpStat?.count      ?? attacks.length },
            { label: 'IPs únicas', value: hpStat?.unique_ips ?? uniqueIps },
            { label: 'Tipo top',  value: hpStat?.top_attack_type ? hpStat.top_attack_type.split(' ')[0] : (topTypes[0]?.[0] ?? '—') },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <p className="font-display font-black text-base truncate" style={{ color }}>{value}</p>
              <p className="text-[9px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'var(--txt-3)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Top tipos */}
        {topTypes.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Top tipos de ataque</p>
            {topTypes.map(([label, count]) => (
              <BarMini key={label} label={label} count={count} max={maxType} color={color} />
            ))}
          </div>
        )}
      </div>

      {/* Top IPs */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Top IPs atacantes</p>
        {topIPs.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin datos</p>
          : topIPs.map(([ip, count]) => (
            <BarMini key={ip} label={ip} count={count} max={maxIP} color={color} />
          ))
        }
      </div>
    </div>
  )
}

// Tab: Ataques (paginada)
function TabAtaques({ hpKey, userId, color }) {
  const [attacks, setAttacks] = useState(null)
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const LIMIT = 20

  useEffect(() => {
    setLoading(true)
    getMyAttacks({ honeypot: hpKey, tenant_id: userId, page, limit: LIMIT })
      .then(r => { setAttacks(r.data?.items || []); setTotal(r.data?.total || 0) })
      .catch(() => setAttacks([]))
      .finally(() => setLoading(false))
  }, [hpKey, userId, page])

  if (loading) return <Spinner />

  return (
    <div>
      {attacks.length === 0
        ? <p className="px-5 py-8 text-sm text-center" style={{ color: 'var(--txt-3)' }}>Sin ataques registrados</p>
        : attacks.map(a => <AttackRow key={a.id} a={a} />)
      }
      {total > LIMIT && (
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
          <span className="text-xs" style={{ color: 'var(--txt-3)' }}>Página {page} / {Math.ceil(total / LIMIT)}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg transition-all disabled:opacity-30"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <ChevronLeft className="w-3.5 h-3.5" style={{ color: 'var(--txt-2)' }} />
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / LIMIT)}
              className="p-1.5 rounded-lg transition-all disabled:opacity-30"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--txt-2)' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Tab: Exportar
function TabExportar({ hpKey, userId, retentionDays, color }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const r = await getMyAttacks({ honeypot: hpKey, tenant_id: userId, limit: 1000, days: retentionDays })
      downloadCSV(r.data?.items || [], `${hpKey}_attacks_${new Date().toISOString().slice(0,10)}.csv`)
    } catch {}
    setLoading(false)
  }

  return (
    <div className="p-8 flex flex-col items-center gap-4 text-center">
      <div className="p-4 rounded-2xl" style={{ background: `${color}14`, border: `1px solid ${color}22` }}>
        <Download className="w-8 h-8" style={{ color }} />
      </div>
      <div>
        <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>Exportar ataques de {SENSOR_META[hpKey]?.label}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--txt-3)' }}>
          Descarga hasta {retentionDays} días de historial en formato CSV
        </p>
      </div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
        style={{ background: color + '18', color, border: `1px solid ${color}30` }}
      >
        {loading
          ? <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid currentColor', borderTopColor: 'transparent' }} />
          : <Download className="w-4 h-4" />
        }
        {loading ? 'Descargando…' : 'Descargar CSV'}
      </button>
    </div>
  )
}

// Tab: Credenciales & Comandos (Cowrie)
function TabCowrie({ attacks }) {
  if (!attacks) return <Spinner />
  const creds    = attacks.filter(a => a.username)
  const cmds     = attacks.filter(a => a.attack_type === 'Ejecución de comandos' && a.payload)
  const credFreq = freq(creds.map(a => `${a.username}:${a.password ?? ''}`)).slice(0, 20)
  const cmdFreq  = freq(cmds.map(a => a.payload)).slice(0, 20)

  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest mb-3 flex items-center gap-1.5" style={{ color: 'var(--txt-3)' }}>
          <Key className="w-3 h-3" /> Credenciales intentadas
        </p>
        {credFreq.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin intentos de login</p>
          : (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="grid grid-cols-3 px-3 py-2 text-[9px] uppercase font-bold tracking-wider"
                style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--txt-3)' }}>
                <span>Usuario</span><span>Contraseña</span><span className="text-right">Intentos</span>
              </div>
              {credFreq.map(([pair, count]) => {
                const [u, p] = pair.split(':')
                return (
                  <div key={pair} className="grid grid-cols-3 px-3 py-2 text-[11px]"
                    style={{ borderTop: '1px solid var(--border)' }}>
                    <span className="font-mono truncate" style={{ color: '#60a5fa' }}>{u || '—'}</span>
                    <span className="font-mono truncate" style={{ color: '#fb7185' }}>{p || '—'}</span>
                    <span className="text-right font-bold" style={{ color: 'var(--txt-2)' }}>{count}</span>
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest mb-3 flex items-center gap-1.5" style={{ color: 'var(--txt-3)' }}>
          <Code2 className="w-3 h-3" /> Comandos ejecutados
        </p>
        {cmdFreq.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin comandos registrados</p>
          : (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <div className="grid grid-cols-4 px-3 py-2 text-[9px] uppercase font-bold tracking-wider"
                style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--txt-3)' }}>
                <span className="col-span-3">Comando</span><span className="text-right">Veces</span>
              </div>
              {cmdFreq.map(([cmd, count]) => (
                <div key={cmd} className="grid grid-cols-4 px-3 py-2 text-[11px]"
                  style={{ borderTop: '1px solid var(--border)' }}>
                  <code className="col-span-3 font-mono truncate" style={{ color: '#34d399' }}>{cmd}</code>
                  <span className="text-right font-bold" style={{ color: 'var(--txt-2)' }}>{count}</span>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  )
}

// Tab: Protocolos & Payloads (Dionaea)
function TabDionaea({ attacks }) {
  if (!attacks) return <Spinner />
  const portFreq = freq(attacks.filter(a => a.dest_port).map(a => String(a.dest_port))).slice(0, 10)
  const creds    = freq(attacks.filter(a => a.username).map(a => `${a.username}:${a.password ?? ''}`)).slice(0, 10)
  const maxPort  = portFreq[0]?.[1] || 1

  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Puertos / Protocolos</p>
        {portFreq.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin datos</p>
          : portFreq.map(([port, count]) => (
            <BarMini key={port} label={`Puerto ${port}`} count={count} max={maxPort} color={SENSOR_META.dionaea.color} />
          ))
        }
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest mb-3" style={{ color: 'var(--txt-3)' }}>Credenciales intentadas</p>
        {creds.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin intentos</p>
          : (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {creds.map(([pair, count]) => {
                const [u, p] = pair.split(':')
                return (
                  <div key={pair} className="grid grid-cols-3 px-3 py-2 text-[11px]"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="font-mono truncate" style={{ color: '#60a5fa' }}>{u}</span>
                    <span className="font-mono truncate" style={{ color: '#fb7185' }}>{p || '—'}</span>
                    <span className="text-right font-bold" style={{ color: 'var(--txt-2)' }}>{count}</span>
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    </div>
  )
}

// Tab: Peticiones Web (Glastopf)
function TabGlastopf({ attacks }) {
  if (!attacks) return <Spinner />
  const paths    = freq(attacks.filter(a => a.payload).map(a => a.payload)).slice(0, 15)
  const types    = freq(attacks.map(a => a.attack_type)).slice(0, 6)
  const maxPath  = paths[0]?.[1] || 1

  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Paths / Payloads atacados</p>
        {paths.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin datos</p>
          : paths.map(([path, count]) => (
            <BarMini key={path} label={path} count={count} max={maxPath} color={SENSOR_META.glastopf.color} />
          ))
        }
      </div>
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Tipos de ataque web</p>
        {types.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin datos</p>
          : types.map(([t, count]) => (
            <div key={t} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--txt-2)' }}>{t}</span>
              <span className="font-bold" style={{ color: SENSOR_META.glastopf.color }}>{count}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// Tab: Comandos ICS (Conpot)
function TabConpot({ attacks }) {
  if (!attacks) return <Spinner />
  const protocols = freq(attacks.filter(a => a.protocol).map(a => a.protocol)).slice(0, 8)
  const rawItems  = attacks
    .filter(a => a.raw_data && Object.keys(a.raw_data).length > 0)
    .slice(0, 10)

  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Protocolos ICS usados</p>
        {protocols.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin datos</p>
          : protocols.map(([p, count]) => (
            <div key={p} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--txt-2)' }}>{p}</span>
              <span className="font-bold" style={{ color: SENSOR_META.conpot.color }}>{count}</span>
            </div>
          ))
        }
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest mb-3" style={{ color: 'var(--txt-3)' }}>Datos raw recientes</p>
        {rawItems.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin raw_data disponible</p>
          : rawItems.map((a, i) => (
            <div key={i} className="mb-2 rounded-lg p-2 overflow-auto"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)', maxHeight: '80px' }}>
              <code className="text-[10px] text-green-300 whitespace-pre">
                {JSON.stringify(a.raw_data, null, 1).slice(0, 200)}
              </code>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// Tab: Puertos & Payloads (Honeytrap)
function TabHoneytrap({ attacks }) {
  if (!attacks) return <Spinner />
  const ports    = freq(attacks.filter(a => a.dest_port).map(a => String(a.dest_port))).slice(0, 10)
  const payloads = attacks.filter(a => a.payload).slice(0, 15)
  const maxPort  = ports[0]?.[1] || 1

  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Puertos sondeados</p>
        {ports.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin datos</p>
          : ports.map(([p, count]) => (
            <BarMini key={p} label={`Puerto ${p}`} count={count} max={maxPort} color={SENSOR_META.honeytrap.color} />
          ))
        }
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest mb-3" style={{ color: 'var(--txt-3)' }}>Primeros bytes de payload</p>
        {payloads.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin payloads</p>
          : payloads.map((a, i) => (
            <div key={i} className="mb-1.5 flex items-center gap-2">
              <code className="text-[10px] font-mono truncate flex-1 px-2 py-1 rounded"
                style={{ background: 'rgba(0,0,0,0.3)', color: '#fde68a', border: '1px solid var(--border)' }}>
                {a.payload.slice(0, 60)}
              </code>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// Tab: Red Virtual (Honeyd)
function TabHoneyd({ attacks }) {
  if (!attacks) return <Spinner />
  const hosts    = freq(attacks.map(a => a.source_ip)).slice(0, 10)
  const ports    = freq(attacks.filter(a => a.dest_port).map(a => String(a.dest_port))).slice(0, 10)
  const maxHost  = hosts[0]?.[1] || 1

  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Hosts sondeados (IPs)</p>
        {hosts.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin datos</p>
          : hosts.map(([ip, count]) => (
            <BarMini key={ip} label={ip} count={count} max={maxHost} color={SENSOR_META.honeyd.color} />
          ))
        }
      </div>
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Servicios/puertos probados</p>
        {ports.map(([p, count]) => (
          <div key={p} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--txt-2)' }}>Puerto {p}</span>
            <span className="font-bold" style={{ color: SENSOR_META.honeyd.color }}>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── HoneypotDetail (panel expandido) ─────────────────────────
function HoneypotDetail({ hpKey, userId, hpStat, retentionDays }) {
  const meta      = SENSOR_META[hpKey]
  const tabs      = HP_TABS[hpKey] || ['Resumen', 'Ataques', 'Exportar']
  const [activeTab, setActiveTab] = useState(tabs[0])

  // Lazy-load attacks once (used for Resumen + specific tab)
  const [attacks, setAttacks] = useState(null)

  useEffect(() => {
    setAttacks(null)
    setActiveTab(tabs[0])
  }, [hpKey])

  useEffect(() => {
    if (activeTab === 'Ataques' || activeTab === 'Exportar') return // handled by child
    if (attacks !== null) return
    getMyAttacks({ honeypot: hpKey, tenant_id: userId, limit: 100 })
      .then(r => setAttacks(r.data?.items || []))
      .catch(() => setAttacks([]))
  }, [activeTab, hpKey, userId])

  function renderSpecificTab() {
    switch (hpKey) {
      case 'cowrie':    return <TabCowrie    attacks={attacks} />
      case 'dionaea':   return <TabDionaea   attacks={attacks} />
      case 'glastopf':  return <TabGlastopf  attacks={attacks} />
      case 'conpot':    return <TabConpot    attacks={attacks} />
      case 'honeytrap': return <TabHoneytrap attacks={attacks} />
      case 'honeyd':    return <TabHoneyd    attacks={attacks} />
      default:          return null
    }
  }

  const TAB_ICONS = {
    'Resumen':                BarChart2,
    'Ataques':                History,
    'Credenciales & Comandos': Key,
    'Protocolos & Payloads':  Network,
    'Peticiones Web':         FileText,
    'Comandos ICS':           Terminal,
    'Puertos & Payloads':     Network,
    'Red Virtual':            Zap,
    'Exportar':               Download,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl overflow-hidden mt-2"
      style={{ background: 'var(--surface)', border: `1px solid ${meta.color}30`, boxShadow: `0 0 0 1px ${meta.color}10` }}
    >
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--border)', background: `${meta.color}08` }}>
        <div className="p-1.5 rounded-lg" style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}25` }}>
          <meta.icon className="w-4 h-4" style={{ color: meta.color }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>{meta.label} — Detalle</p>
          <p className="text-[10px]" style={{ color: 'var(--txt-3)' }}>{meta.desc} · Puerto {meta.port}</p>
        </div>
        {hpStat && (
          <div className="ml-auto text-right">
            <p className="text-xs font-black" style={{ color: meta.color }}>{hpStat.count} ataques</p>
            <p className="text-[10px]" style={{ color: 'var(--txt-3)' }}>últimos 7 días</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
        {tabs.map(tab => {
          const Icon = TAB_ICONS[tab] || BarChart2
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all"
              style={{
                color:       isActive ? meta.color : 'var(--txt-3)',
                borderBottom: isActive ? `2px solid ${meta.color}` : '2px solid transparent',
                background:   isActive ? `${meta.color}08` : 'transparent',
              }}
            >
              <Icon className="w-3 h-3" />
              {tab}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'Resumen' && (
            <TabResumen attacks={attacks} hpStat={hpStat} color={meta.color} />
          )}
          {activeTab === 'Ataques' && (
            <TabAtaques hpKey={hpKey} userId={userId} color={meta.color} />
          )}
          {activeTab === 'Exportar' && (
            <TabExportar hpKey={hpKey} userId={userId} retentionDays={retentionDays} color={meta.color} />
          )}
          {!['Resumen', 'Ataques', 'Exportar'].includes(activeTab) && renderSpecificTab()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

// ─── main component ───────────────────────────────────────────
export default function ClientSensors() {
  const { user: authUser } = useAuth()
  const previewUser  = usePreviewUser()
  const user         = previewUser ?? authUser
  const plan         = user?.plan || 'basico'
  const activeSensors = ACTIVE_BY_PLAN[plan] || ACTIVE_BY_PLAN.basico
  const isPro        = hasPlan(plan, 'profesional')
  const retentionDays = PLAN_RETENTION[plan] || 30

  const [sensors,       setSensors]       = useState([])
  const [hpStats,       setHpStats]       = useState([])
  const [copied,        setCopied]        = useState(false)
  const [selectedHp,    setSelectedHp]    = useState(null)

  const INSTALL_CMD = `curl -s https://honeypotsec.duckdns.org/install | sudo bash -s -- --token <TU_TOKEN>`
  const ONLINE_MS   = 3 * 60 * 1000
  const isOnlineFn  = (lastSeen) => lastSeen && (Date.now() - new Date(lastSeen).getTime()) < ONLINE_MS

  useEffect(() => {
    getMySensors(user?.id).then(r => setSensors(r.data || [])).catch(() => {})
    getClientHoneypots(user?.id, 7).then(r => setHpStats(r.data || [])).catch(() => {})
  }, [user?.id])

  function copyCmd() {
    navigator.clipboard.writeText(INSTALL_CMD).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function toggleHp(key) {
    setSelectedHp(prev => (prev === key ? null : key))
  }

  const activeCount  = activeSensors.length
  const totalCount   = Object.keys(SENSOR_META).length
  const installedOk  = sensors.filter(s => isOnlineFn(s.last_seen)).length

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>Mis Sensores</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--txt-2)' }}>
          {activeCount} honeypot{activeCount !== 1 ? 's' : ''} incluidos en tu plan · {installedOk} servidor{installedOk !== 1 ? 'es' : ''} conectado{installedOk !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── Sección instalación ─────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(251,191,36,0.2)', background: 'rgba(251,191,36,0.03)' }}>

        <div className="px-6 py-4 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(251,191,36,0.12)', background: 'rgba(251,191,36,0.05)' }}>
          <div className="p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.12)' }}>
            <Terminal className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Instalar sensor en tu servidor</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Un solo comando instala y configura todos los honeypots de tu plan
            </p>
          </div>
          {installedOk > 0 && (
            <div className="ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {installedOk} activo{installedOk !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Comando de instalación
            </p>
            <div className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between px-4 py-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>bash</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="text-amber-400 font-mono text-sm select-none">$</span>
                <code className="flex-1 font-mono text-xs text-green-300 break-all">{INSTALL_CMD}</code>
                <button
                  onClick={copyCmd}
                  className="shrink-0 p-1.5 rounded-lg transition-all duration-150"
                  style={{ background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)',
                           border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}` }}
                  title="Copiar comando"
                >
                  {copied
                    ? <Check  className="w-3.5 h-3.5 text-emerald-400" />
                    : <Copy   className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />}
                </button>
              </div>
            </div>
            <p className="mt-2 text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              El token personalizado lo recibirás del equipo de HoneypotSEC. Sustitúyelo en{' '}
              <code className="text-amber-400/70">&lt;TU_TOKEN&gt;</code>
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
              ¿Cómo funciona?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INSTALL_STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                    style={{ background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
                    {step.n}
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{step.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Servidores conectados ───────────────────────────────── */}
      {sensors.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Servidores conectados
          </p>
          <div className="space-y-3">
            {sensors.map((s, i) => {
              const isOnline = isOnlineFn(s.last_seen)
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl px-5 py-4 flex items-center gap-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="p-2 rounded-lg"
                    style={{ background: isOnline ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
                             border: `1px solid ${isOnline ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                    {isOnline
                      ? <Wifi    className="w-4 h-4 text-emerald-400" />
                      : <WifiOff className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--txt)' }}>
                      {s.hostname || s.name || `Sensor #${s.id}`}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--txt-3)' }}>
                      {s.ip_address && <span className="font-mono mr-3">{s.ip_address}</span>}
                      Último contacto: {timeAgo(s.last_seen)}
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: isOnline ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.04)',
                      color:      isOnline ? '#34d399' : 'rgba(255,255,255,0.3)',
                      border:     `1px solid ${isOnline ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    {isOnline ? '● Online' : '○ Offline'}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Grid de honeypots ───────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Honeypots de tu plan
          </p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold" style={{ color: '#34d399' }}>{activeCount} activos</span>
            {!isPro && (
              <Link to="/pricing"
                className="text-xs font-bold px-3 py-1 rounded-lg ml-2"
                style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.18)' }}>
                Activar {totalCount - activeCount} más →
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(SENSOR_META).map(([key, meta], i) => {
            const Icon      = meta.icon
            const isActive  = activeSensors.includes(key)
            const hpStat    = hpStats.find(h => h.honeypot === key)
            const count7d   = hpStat?.count ?? 0
            const isExpanded = selectedHp === key

            if (!isActive) {
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  className="rounded-2xl p-5 relative overflow-hidden"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: 0.5 }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10"
                    style={{ background: 'rgba(5,5,5,0.65)', backdropFilter: 'blur(2px)' }}>
                    <Lock className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400">Plan Profesional</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl" style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}20` }}>
                      <Icon className="w-4 h-4" style={{ color: meta.color }} />
                    </div>
                    <div>
                      <p className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>{meta.label}</p>
                      <p className="text-[10px]" style={{ color: 'var(--txt-3)' }}>{meta.desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                      <p className="font-display font-black text-xl" style={{ color: meta.color }}>—</p>
                      <p className="text-[9px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'var(--txt-3)' }}>ataques 7d</p>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                      <p className="font-display font-black text-sm" style={{ color: 'var(--txt-1)' }}>{meta.port}</p>
                      <p className="text-[9px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'var(--txt-3)' }}>puerto(s)</p>
                    </div>
                  </div>
                </motion.div>
              )
            }

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <button
                  onClick={() => toggleHp(key)}
                  className="w-full rounded-2xl p-5 text-left transition-all duration-200"
                  style={{
                    background:  isExpanded ? `${meta.color}08` : 'var(--surface)',
                    border:      `1px solid ${isExpanded ? meta.color + '40' : 'var(--border)'}`,
                    boxShadow:   isExpanded ? `0 0 0 1px ${meta.color}18` : 'var(--shadow)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl" style={{ background: `${meta.color}12`, border: `1px solid ${meta.color}20` }}>
                        <Icon className="w-4 h-4" style={{ color: meta.color }} />
                      </div>
                      <div>
                        <p className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>{meta.label}</p>
                        <p className="text-[10px]" style={{ color: 'var(--txt-3)' }}>{meta.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full"
                        style={{ background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online
                      </span>
                      <ChevronDown
                        className="w-4 h-4 transition-transform duration-200"
                        style={{ color: 'var(--txt-3)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                      <p className="font-display font-black text-xl" style={{ color: meta.color }}>{count7d}</p>
                      <p className="text-[9px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'var(--txt-3)' }}>ataques 7d</p>
                    </div>
                    <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                      <p className="font-display font-black text-sm" style={{ color: 'var(--txt-1)' }}>{meta.port}</p>
                      <p className="text-[9px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'var(--txt-3)' }}>puerto(s)</p>
                    </div>
                  </div>
                  {count7d > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--txt-3)' }}>
                      <TrendingUp className="w-3 h-3 text-amber-400" />
                      {hpStat?.top_attack_type
                        ? `Tipo más frecuente: ${hpStat.top_attack_type}`
                        : 'Actividad detectada esta semana'}
                    </div>
                  )}
                </button>

                {/* Panel expandido justo debajo de esta card */}
                <AnimatePresence>
                  {isExpanded && (
                    <HoneypotDetail
                      hpKey={key}
                      userId={user?.id}
                      hpStat={hpStat}
                      retentionDays={retentionDays}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Retención info */}
      <div className="flex items-center gap-2 justify-end">
        <Database className="w-3.5 h-3.5 text-blue-400" />
        <span className="text-[11px]" style={{ color: 'var(--txt-3)' }}>
          Retención de datos: <strong style={{ color: 'var(--txt-2)' }}>{PLAN_RETENTION_LABEL[plan]}</strong>
        </span>
      </div>
    </div>
  )
}
