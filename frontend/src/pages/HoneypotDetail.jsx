import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getAttacks, getHoneypots } from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Shield, Activity, Globe, ChevronLeft, Cpu, Lock, Network,
  BarChart2, History, Key, Code2, FileText, Terminal, Zap, Download,
  ChevronRight as ChevronRightIcon, CheckCircle2, AlertCircle,
  Database, Calendar, Hash, Tag,
} from 'lucide-react'

// ─── Meta ─────────────────────────────────────────────────────
const HP_META = {
  cowrie:    { label: 'Cowrie Tactical Node',   icon: Lock,     color: 'rgba(255,255,255,0.8)', border: 'rgba(255,255,255,0.1)',   bg: 'rgba(255,255,255,0.05)',   ports: '2222 SSH, 2323 Telnet',        desc: 'Capa de emulación avanzada de SSH y Telnet. Monitoriza intentos de fuerza bruta, interacciones de sesión y secuencias de comandos post-explotación.' },
  dionaea:   { label: 'Dionaea Multi-Threat',   icon: Activity, color: 'rgba(255,255,255,0.6)', border: 'rgba(255,255,255,0.07)',  bg: 'rgba(255,255,255,0.04)',   ports: '21 FTP, 445 SMB, 3306 MySQL',  desc: 'Sensor multi-protocolo de alta interacción. Atrapa exploits complejos, propagación de malware y vectores de escaneo de red automatizados.' },
  glastopf:  { label: 'Glastopf Web Ingress',  icon: Globe,    color: '#FBBF24',               border: 'rgba(251,191,36,0.2)',    bg: 'rgba(251,191,36,0.06)',    ports: '8080 HTTP',                    desc: 'Emulador dinámico de vulnerabilidades web. Clasifica ataques LFI, RFI, inyección SQL y patrones especializados de crawlers y botnets.' },
  conpot:    { label: 'Conpot Industrial ICS',  icon: Cpu,      color: '#fb7185',               border: 'rgba(251,113,133,0.2)',   bg: 'rgba(251,113,133,0.06)',   ports: '102 S7, 502 Modbus',           desc: 'Simulador de sistemas de control industrial. Imita infraestructura PLC para identificar reconocimiento contra redes de energía y utilities críticos.' },
  honeytrap: { label: 'Honeytrap Global Sink',  icon: Shield,   color: '#FCD34D',               border: 'rgba(252,211,77,0.2)',    bg: 'rgba(252,211,77,0.06)',    ports: 'TCP/UDP wildcard',             desc: 'Arquitectura de escucha TCP/UDP genérica. Actúa como sumidero para tráfico de red inesperado en cualquier rango de puertos no asignados.' },
  honeyd:    { label: 'Honeyd Virtual Fabric',  icon: Network,  color: 'rgba(148,163,184,0.8)', border: 'rgba(148,163,184,0.12)', bg: 'rgba(148,163,184,0.05)',  ports: 'Múltiples puertos virtuales',  desc: 'Motor de topología de red virtual. Simula estructuras de subred completas para monitorizar movimiento lateral y comunicaciones internas de botnets.' },
}

const HP_TABS = {
  cowrie:    ['Resumen', 'Ataques', 'Credenciales & Comandos', 'Exportar'],
  dionaea:   ['Resumen', 'Ataques', 'Protocolos & Payloads',   'Exportar'],
  glastopf:  ['Resumen', 'Ataques', 'Peticiones Web',          'Exportar'],
  conpot:    ['Resumen', 'Ataques', 'Comandos ICS',            'Exportar'],
  honeytrap: ['Resumen', 'Ataques', 'Puertos & Payloads',      'Exportar'],
  honeyd:    ['Resumen', 'Ataques', 'Red Virtual',             'Exportar'],
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

// ─── helpers ──────────────────────────────────────────────────
function getFlagEmoji(cc) {
  if (!cc) return '🌐'
  return String.fromCodePoint(...cc.toUpperCase().split('').map(c => 127397 + c.charCodeAt()))
}

function fmtTs(ts) {
  return new Date(ts).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function freq(arr) {
  const map = {}
  arr.forEach(v => { if (v) map[v] = (map[v] || 0) + 1 })
  return Object.entries(map).sort((a, b) => b[1] - a[1])
}

const EXPORT_COLS = ['timestamp', 'source_ip', 'dest_port', 'country', 'country_code',
                     'attack_type', 'username', 'password', 'payload', 'protocol',
                     'session_id', 'honeypot']

const EXPORT_COL_LABELS = {
  timestamp: 'Timestamp', source_ip: 'IP Origen', dest_port: 'Puerto Destino',
  country: 'País', country_code: 'Código País', attack_type: 'Tipo de Ataque',
  username: 'Usuario', password: 'Contraseña', payload: 'Payload',
  protocol: 'Protocolo', session_id: 'Session ID', honeypot: 'Honeypot',
}

function downloadCSV(attacks, filename) {
  if (!attacks.length) return
  const header = EXPORT_COLS.join(',')
  const rows = attacks.map(a =>
    EXPORT_COLS.map(c => {
      const v = a[c] ?? ''
      const s = String(v).replace(/"/g, '""')
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s
    }).join(',')
  )
  const bom  = '﻿'  // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
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
  const uniqueIps = [...new Set(attacks.map(a => a.source_ip))].length
  const topTypes  = freq(attacks.map(a => a.attack_type)).slice(0, 5)
  const topIPs    = freq(attacks.map(a => a.source_ip)).slice(0, 5)
  const maxType   = topTypes[0]?.[1] || 1
  const maxIP     = topIPs[0]?.[1] || 1

  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Métricas totales</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Ataques',    value: hpStat?.count ?? attacks.length },
            { label: 'IPs únicas', value: uniqueIps },
            { label: 'Tipo top',   value: topTypes[0]?.[0]?.split(' ')[0] ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <p className="font-display font-black text-base truncate" style={{ color }}>{value}</p>
              <p className="text-[9px] uppercase font-bold tracking-wider mt-0.5" style={{ color: 'var(--txt-3)' }}>{label}</p>
            </div>
          ))}
        </div>
        {topTypes.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Top tipos de ataque</p>
            {topTypes.map(([label, count]) => (
              <BarMini key={label} label={label} count={count} max={maxType} color={color} />
            ))}
          </div>
        )}
      </div>
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

// Tab: Ataques (paginada — admin API)
function TabAtaques({ hpKey, color }) {
  const [attacks, setAttacks] = useState(null)
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(true)
  const LIMIT = 20

  useEffect(() => {
    setLoading(true)
    getAttacks({ honeypot: hpKey, page, limit: LIMIT })
      .then(r => { setAttacks(r.data?.items || []); setTotal(r.data?.total || 0) })
      .catch(() => setAttacks([]))
      .finally(() => setLoading(false))
  }, [hpKey, page])

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
              <ChevronRightIcon className="w-3.5 h-3.5" style={{ color: 'var(--txt-2)' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Tab: Exportar (admin — sin límite de retención)
function TabExportar({ hpKey, color }) {
  const [status, setStatus] = useState('idle')   // idle | loading | success | error
  const [count,  setCount]  = useState(null)

  const meta = HP_META[hpKey]

  useEffect(() => {
    setCount(null)
    getAttacks({ honeypot: hpKey, limit: 1, page: 1 })
      .then(r => setCount(r.data?.total ?? 0))
      .catch(() => setCount(0))
  }, [hpKey])

  async function handleExport() {
    setStatus('loading')
    try {
      const r = await getAttacks({ honeypot: hpKey, limit: 1000 })
      const items = r.data?.items || []
      if (!items.length) { setStatus('error'); return }
      downloadCSV(items, `${hpKey}_attacks_${new Date().toISOString().slice(0, 10)}.csv`)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  const exportCount = Math.min(count ?? 0, 1000)

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
          <Download className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>Exportar registros</p>
          <p className="text-xs" style={{ color: 'var(--txt-3)' }}>{meta?.label || hpKey} · Acceso completo sin restricción de retención</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Hash,     label: 'Registros a exportar', value: count === null ? '…' : exportCount.toLocaleString('es-ES'), sub: count > 1000 ? 'máx. 1000 por descarga' : 'todos los registros' },
          { icon: Calendar, label: 'Período',              value: 'Historial completo',  sub: 'sin límite de retención' },
          { icon: Database, label: 'Formato',              value: 'CSV · UTF-8',         sub: 'compatible con Excel' },
        ].map(({ icon: Icon, label, value, sub }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className="w-3 h-3" style={{ color: 'var(--txt-3)' }} />
              <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>{label}</p>
            </div>
            <p className="font-display font-black text-sm" style={{ color }}>{value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--txt-3)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Columns */}
      <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5">
          <Tag className="w-3 h-3" style={{ color: 'var(--txt-3)' }} />
          <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Columnas incluidas</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EXPORT_COLS.map(col => (
            <span key={col}
              className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded"
              style={{ background: `${color}10`, color, border: `1px solid ${color}20` }}>
              <CheckCircle2 className="w-2.5 h-2.5" />
              {EXPORT_COL_LABELS[col]}
            </span>
          ))}
        </div>
      </div>

      {/* Action */}
      <div className="space-y-3">
        <button
          onClick={handleExport}
          disabled={status === 'loading' || count === 0}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
          style={status === 'success'
            ? { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }
            : status === 'error'
            ? { background: 'rgba(251,113,133,0.1)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.25)' }
            : { background: `${color}18`, color, border: `1px solid ${color}35` }
          }
        >
          {status === 'loading' && <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid currentColor', borderTopColor: 'transparent' }} />}
          {status === 'success' && <CheckCircle2 className="w-4 h-4" />}
          {status === 'error'   && <AlertCircle  className="w-4 h-4" />}
          {status === 'idle'    && <Download     className="w-4 h-4" />}
          {status === 'loading' ? 'Generando archivo…'    : ''}
          {status === 'success' ? 'Descarga completada'   : ''}
          {status === 'error'   ? 'Error al exportar — Reintentar' : ''}
          {status === 'idle'    ? `Descargar CSV (${exportCount.toLocaleString('es-ES')} registros)` : ''}
        </button>

        {count === 0 && (
          <p className="text-center text-xs" style={{ color: 'var(--txt-3)' }}>
            Sin registros disponibles para este honeypot
          </p>
        )}
      </div>
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
            <BarMini key={port} label={`Puerto ${port}`} count={count} max={maxPort} color={HP_META.dionaea.color} />
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
  const paths   = freq(attacks.filter(a => a.payload).map(a => a.payload)).slice(0, 15)
  const types   = freq(attacks.map(a => a.attack_type)).slice(0, 6)
  const maxPath = paths[0]?.[1] || 1

  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Paths / Payloads atacados</p>
        {paths.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin datos</p>
          : paths.map(([path, count]) => (
            <BarMini key={path} label={path} count={count} max={maxPath} color={HP_META.glastopf.color} />
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
              <span className="font-bold" style={{ color: HP_META.glastopf.color }}>{count}</span>
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
  const rawItems  = attacks.filter(a => a.raw_data && Object.keys(a.raw_data).length > 0).slice(0, 10)

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
              <span className="font-bold" style={{ color: HP_META.conpot.color }}>{count}</span>
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
            <BarMini key={p} label={`Puerto ${p}`} count={count} max={maxPort} color={HP_META.honeytrap.color} />
          ))
        }
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest mb-3" style={{ color: 'var(--txt-3)' }}>Primeros bytes de payload</p>
        {payloads.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin payloads</p>
          : payloads.map((a, i) => (
            <div key={i} className="mb-1.5">
              <code className="text-[10px] font-mono truncate flex-1 px-2 py-1 rounded block"
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
  const hosts   = freq(attacks.map(a => a.source_ip)).slice(0, 10)
  const ports   = freq(attacks.filter(a => a.dest_port).map(a => String(a.dest_port))).slice(0, 10)
  const maxHost = hosts[0]?.[1] || 1

  return (
    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Hosts sondeados (IPs)</p>
        {hosts.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin datos</p>
          : hosts.map(([ip, count]) => (
            <BarMini key={ip} label={ip} count={count} max={maxHost} color={HP_META.honeyd.color} />
          ))
        }
      </div>
      <div className="space-y-2">
        <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: 'var(--txt-3)' }}>Servicios/puertos probados</p>
        {ports.length === 0
          ? <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Sin datos</p>
          : ports.map(([p, count]) => (
            <div key={p} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--txt-2)' }}>Puerto {p}</span>
              <span className="font-bold" style={{ color: HP_META.honeyd.color }}>{count}</span>
            </div>
          ))
        }
      </div>
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────
export default function HoneypotDetail() {
  const { name } = useParams()
  const meta     = HP_META[name] ?? { label: name, icon: Shield, color: 'rgba(255,255,255,0.7)', border: 'rgba(255,255,255,0.08)', bg: 'rgba(255,255,255,0.04)', ports: '—', desc: '' }
  const tabs     = HP_TABS[name] || ['Resumen', 'Ataques', 'Exportar']

  const [hpStat,    setHpStat]    = useState(null)
  const [attacks,   setAttacks]   = useState(null)   // lazy for Resumen + type tab
  const [activeTab, setActiveTab] = useState(tabs[0])

  // Reset tab when navigating to a different honeypot
  useEffect(() => { setActiveTab(tabs[0]); setAttacks(null) }, [name]) // eslint-disable-line

  // Fetch global honeypot stat
  useEffect(() => {
    getHoneypots().then(r => {
      const found = r.data?.find(h => h.honeypot === name)
      setHpStat(found ?? { honeypot: name, count: 0 })
    }).catch(() => {})
  }, [name])

  // Lazy-load attacks for Resumen and type-specific tab (not for Ataques/Exportar — those handle their own)
  useEffect(() => {
    if (activeTab === 'Ataques' || activeTab === 'Exportar') return
    if (attacks !== null) return
    getAttacks({ honeypot: name, limit: 100 })
      .then(r => setAttacks(r.data?.items || []))
      .catch(() => setAttacks([]))
  }, [activeTab, name, attacks])

  const uniqueIPs = hpStat ? undefined : 0
  const countries = 0
  const lastSeen  = hpStat?.last_seen

  function renderSpecificTab() {
    switch (name) {
      case 'cowrie':    return <TabCowrie    attacks={attacks} />
      case 'dionaea':   return <TabDionaea   attacks={attacks} />
      case 'glastopf':  return <TabGlastopf  attacks={attacks} />
      case 'conpot':    return <TabConpot    attacks={attacks} />
      case 'honeytrap': return <TabHoneytrap attacks={attacks} />
      case 'honeyd':    return <TabHoneyd    attacks={attacks} />
      default:          return null
    }
  }

  const MetaIcon = meta.icon

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-7 max-w-7xl mx-auto p-2 pb-20">

      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
          <ChevronLeft className="w-4 h-4" />
          Volver al panel
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Operacional</span>
        </div>
      </div>

      {/* Hero card */}
      <div className="glass-card overflow-hidden relative" style={{ borderColor: meta.border }}>
        <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none"
          style={{ background: `linear-gradient(to left, ${meta.bg}, transparent)`, opacity: 0.5 }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl" style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
                <MetaIcon className="w-7 h-7" style={{ color: meta.color }} />
              </div>
              <div>
                <h2 className="text-2xl font-display font-black text-white tracking-tight mb-1">{meta.label}</h2>
                <div className="flex items-center gap-2">
                  <span className="badge-premium text-[10px]"
                    style={{ color: meta.color, background: meta.bg, borderColor: meta.border }}>
                    {meta.ports}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Escucha activa
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-2xl" style={{ color: 'rgba(255,255,255,0.4)' }}>{meta.desc}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 shrink-0">
            {[
              { label: 'Total hits', value: hpStat?.count?.toLocaleString('es-ES') ?? '—', color: meta.color },
              { label: 'Último hit', value: lastSeen ? formatDistanceToNow(new Date(lastSeen), { locale: es, addSuffix: true }) : '—', color: 'white' },
            ].map(s => (
              <div key={s.label} className="p-4 rounded-2xl min-w-[130px]"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="label-sm mb-1">{s.label}</p>
                <p className="text-xl font-display font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panel de tabs (estilo ClientSensors) ─────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: `1px solid ${meta.border}`, boxShadow: `0 0 0 1px ${meta.color}08` }}>

        {/* Tabs */}
        <div className="flex gap-0 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
          {tabs.map(tab => {
            const Icon     = TAB_ICONS[tab] || BarChart2
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex items-center gap-1.5 px-5 py-3 text-xs font-bold whitespace-nowrap transition-all"
                style={{
                  color:        isActive ? meta.color : 'var(--txt-3)',
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
              <TabAtaques hpKey={name} color={meta.color} />
            )}
            {activeTab === 'Exportar' && (
              <TabExportar hpKey={name} color={meta.color} />
            )}
            {!['Resumen', 'Ataques', 'Exportar'].includes(activeTab) && renderSpecificTab()}
          </motion.div>
        </AnimatePresence>
      </div>

    </motion.div>
  )
}
