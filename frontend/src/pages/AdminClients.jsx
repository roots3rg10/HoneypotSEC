import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Building2, ChevronRight, Search, Shield, Users,
  Terminal, Copy, Check, X, Loader2, KeyRound,
} from 'lucide-react'
import { getAdminClients, generateSensorToken } from '../services/api'

const PLAN_META = {
  basico:      { label: 'Básico',      color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
  profesional: { label: 'Profesional', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)'  },
  empresarial: { label: 'Empresarial', color: '#fb7185', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.2)' },
}

function TokenModal({ client, onClose }) {
  const plan     = PLAN_META[client.plan] || PLAN_META.basico
  const [loading, setLoading] = useState(true)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')
  const [copied,  setCopied]  = useState(false)

  useEffect(() => {
    generateSensorToken(client.id)
      .then(r => setResult(r.data))
      .catch(() => setError('No se pudo generar el token. Inténtalo de nuevo.'))
      .finally(() => setLoading(false))
  }, [client.id])

  function copyCmd() {
    if (!result?.install_cmd) return
    navigator.clipboard.writeText(result.install_cmd).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(251,191,36,0.03)' }}>
          <div className="p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.1)' }}>
            <KeyRound className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>
              Token de instalación
            </p>
            <p className="text-xs truncate" style={{ color: 'var(--txt-3)' }}>
              {client.company_name || client.username}
              <span className="mx-1.5 opacity-40">·</span>
              <span style={{ color: plan.color }}>{plan.label}</span>
            </p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--txt-3)' }}
            onMouseEnter={e => e.target.style.color = 'var(--txt)'}
            onMouseLeave={e => e.target.style.color = 'var(--txt-3)'}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
              <p className="text-sm" style={{ color: 'var(--txt-3)' }}>Generando token seguro…</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.2)', color: '#fb7185' }}>
              {error}
            </div>
          )}

          {result && (
            <>
              {/* Comando */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--txt-3)' }}>
                  Comando de instalación
                </p>
                <div className="rounded-xl overflow-hidden"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between px-4 py-2"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>bash — Linux</span>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3">
                    <span className="text-amber-400 font-mono text-sm select-none mt-0.5">$</span>
                    <code className="flex-1 font-mono text-xs text-green-300 break-all leading-relaxed">
                      {result.install_cmd}
                    </code>
                    <button onClick={copyCmd}
                      className="shrink-0 p-1.5 rounded-lg transition-all mt-0.5"
                      style={{ background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)',
                               border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                      {copied
                        ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                        : <Copy  className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Info adicional */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--txt-3)' }}>Plan activado</p>
                  <p className="text-sm font-bold" style={{ color: plan.color }}>{plan.label}</p>
                </div>
                <div className="rounded-xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--txt-3)' }}>Token válido</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>{result.expires_in}</p>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="rounded-xl px-4 py-3 text-xs leading-relaxed"
                style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.12)', color: 'rgba(255,255,255,0.45)' }}>
                <span className="text-amber-400 font-bold">Instrucciones: </span>
                Envía este comando al cliente por email o chat seguro. Deberá ejecutarlo en su servidor Linux como root.
                El instalador configurará automáticamente los honeypots de su plan y el servidor aparecerá conectado en su panel.
              </div>

              <button onClick={copyCmd}
                className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: copied ? 'rgba(52,211,153,0.12)' : 'linear-gradient(135deg, #FBBF24ee, #FBBF24bb)',
                  color:      copied ? '#34d399' : '#000',
                  boxShadow:  copied ? 'none' : '0 4px 20px rgba(251,191,36,0.25)',
                }}>
                {copied
                  ? <><Check className="w-4 h-4" /> Copiado al portapapeles</>
                  : <><Copy  className="w-4 h-4" /> Copiar comando completo</>}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminClients() {
  const navigate = useNavigate()
  const [clients,      setClients]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [tokenClient,  setTokenClient]  = useState(null)

  useEffect(() => {
    getAdminClients()
      .then(r => setClients(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = clients.filter(c =>
    !search ||
    c.username.toLowerCase().includes(search.toLowerCase()) ||
    (c.company_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.company_sector || '').toLowerCase().includes(search.toLowerCase())
  )

  const byPlan = (plan) => clients.filter(c => c.plan === plan).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>Clientes</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--txt-3)' }}>
          Accede al portal de cada empresa y gestiona su instalación de sensores
        </p>
      </div>

      {/* KPIs */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total clientes',   value: clients.length,        color: '#60a5fa', icon: Users  },
            { label: 'Plan Básico',      value: byPlan('basico'),      color: '#94a3b8', icon: Shield },
            { label: 'Plan Profesional', value: byPlan('profesional'), color: '#FBBF24', icon: Shield },
            { label: 'Plan Empresarial', value: byPlan('empresarial'), color: '#fb7185', icon: Shield },
          ].map(({ label, value, color, icon: Icon }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="p-2 rounded-lg w-fit mb-3" style={{ background: `${color}14`, border: `1px solid ${color}25` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>{value}</div>
              <div className="text-xs font-semibold mt-0.5" style={{ color: 'var(--txt-2)' }}>{label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-display font-bold text-sm flex-1" style={{ color: 'var(--txt)' }}>
            Empresas cliente
          </span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--txt-3)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-9 pr-4 py-1.5 rounded-xl text-xs outline-none w-44 transition-all"
              style={{ background: 'var(--inset)', border: '1px solid var(--border)', color: 'var(--txt)' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(251,191,36,0.4)'; e.target.style.width = '180px' }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border)' }}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-7 h-7 rounded-full animate-spin"
              style={{ border: '2px solid rgba(251,191,36,0.15)', borderTopColor: '#FBBF24' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Building2 className="w-10 h-10 opacity-15" style={{ color: 'var(--txt-3)' }} />
            <p className="text-sm font-bold uppercase tracking-widest opacity-30" style={{ color: 'var(--txt-3)' }}>
              {search ? 'Sin resultados' : 'Sin clientes todavía'}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.map((client, i) => {
              const plan     = PLAN_META[client.plan] || PLAN_META.basico
              const initials = (client.company_name || client.username).slice(0, 2).toUpperCase()
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-6 py-4 transition-colors"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--inset)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: plan.bg, border: `1px solid ${plan.border}`, color: plan.color }}>
                    {initials}
                  </div>

                  {/* Info — clickable area */}
                  <button className="flex-1 min-w-0 text-left" onClick={() => navigate(`/admin/clients/${client.id}`)}>
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--txt)' }}>
                      {client.company_name || client.username}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--txt-3)' }}>
                      @{client.username} · {client.company_sector || 'Sin sector'}
                    </p>
                  </button>

                  {/* Plan */}
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 hidden sm:inline-flex"
                    style={{ background: plan.bg, color: plan.color, border: `1px solid ${plan.border}` }}>
                    {plan.label}
                  </span>

                  {/* Status */}
                  <div className="flex items-center gap-1.5 shrink-0 hidden md:flex">
                    <span className="w-1.5 h-1.5 rounded-full"
                      style={{ background: client.is_active ? '#4ade80' : '#fb7185' }} />
                    <span className="text-[10px] font-bold" style={{ color: 'var(--txt-3)' }}>
                      {client.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {/* Botón instalar sensor */}
                  <button
                    onClick={() => setTokenClient(client)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all duration-150"
                    style={{ background: 'rgba(251,191,36,0.06)', color: '#FBBF24',
                             border: '1px solid rgba(251,191,36,0.15)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,191,36,0.12)'; e.currentTarget.style.borderColor = 'rgba(251,191,36,0.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,191,36,0.06)'; e.currentTarget.style.borderColor = 'rgba(251,191,36,0.15)' }}
                    title="Generar token de instalación"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Instalar sensor</span>
                  </button>

                  {/* Ver portal */}
                  <button onClick={() => navigate(`/admin/clients/${client.id}`)}
                    className="p-1.5 rounded-lg transition-colors shrink-0"
                    style={{ color: 'var(--txt-3)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--txt)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--txt-3)'}>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal token */}
      <AnimatePresence>
        {tokenClient && (
          <TokenModal client={tokenClient} onClose={() => setTokenClient(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
