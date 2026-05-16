import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, LayoutDashboard, Shield, Bell, FileText, User, AlertCircle,
  KeyRound, Copy, Check, RefreshCw, Trash2, Loader2, ShieldAlert, Info,
} from 'lucide-react'
import { getAdminClient, getClientToken, revokeClientToken, generateSensorToken } from '../services/api'
import { PreviewUserProvider, usePreviewUser } from '../context/PreviewUserContext'
import ClientDashboard from './client/ClientDashboard'
import ClientSensors   from './client/ClientSensors'
import ClientAlerts    from './client/ClientAlerts'
import ClientReports   from './client/ClientReports'
import ClientAccount   from './client/ClientAccount'

const PLAN_META = {
  basico:      { label: 'Básico',      color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' },
  profesional: { label: 'Profesional', color: '#FBBF24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)'  },
  empresarial: { label: 'Empresarial', color: '#fb7185', bg: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.2)' },
}

// ─── Tab: Token ───────────────────────────────────────────────

function expiryText(expiresAt, isExpired) {
  if (isExpired) return { label: 'Expirado', color: '#fb7185' }
  const ms  = new Date(expiresAt) - new Date()
  const hrs = Math.floor(ms / 3600000)
  const min = Math.floor((ms % 3600000) / 60000)
  if (hrs > 0) return { label: `Expira en ${hrs}h ${min}m`, color: '#4ade80' }
  return { label: `Expira en ${min}m`, color: '#FBBF24' }
}

function TokenTab() {
  const client = usePreviewUser()

  const [token,         setToken]         = useState(null)
  const [init,          setInit]          = useState(true)
  const [busy,          setBusy]          = useState(false)
  const [error,         setError]         = useState('')
  const [copied,        setCopied]        = useState(false)
  const [confirmRevoke, setConfirmRevoke] = useState(false)

  async function fetchToken() {
    setInit(true)
    setError('')
    try {
      const r = await getClientToken(client.id)
      setToken(r.data)
    } catch {
      setError('No se pudo cargar el estado del token.')
    } finally {
      setInit(false)
    }
  }

  useEffect(() => { fetchToken() }, [client.id]) // eslint-disable-line

  async function handleGenerate() {
    setBusy(true)
    setError('')
    try {
      await generateSensorToken(client.id)
      const r = await getClientToken(client.id)
      setToken(r.data)
    } catch {
      setError('Error al generar el token. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  async function handleRevoke() {
    setBusy(true)
    setError('')
    try {
      await revokeClientToken(client.id)
      setToken({ has_token: false })
      setConfirmRevoke(false)
    } catch {
      setError('Error al revocar el token. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  function copyCmd() {
    if (!token?.install_cmd) return
    navigator.clipboard.writeText(token.install_cmd).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const expiry   = token?.has_token ? expiryText(token.expires_at, token.is_expired) : null
  const hasToken = token?.has_token

  // ── Loading ────────────────────────────────────────────────
  if (init) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Loader2 className="w-7 h-7 animate-spin text-amber-400" />
      <p className="text-sm" style={{ color: 'var(--txt-3)' }}>Cargando estado del token…</p>
    </div>
  )

  // ── Error ──────────────────────────────────────────────────
  if (error && !hasToken) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <ShieldAlert className="w-10 h-10" style={{ color: '#fb7185' }} />
      <p className="text-sm" style={{ color: '#fb7185' }}>{error}</p>
      <button onClick={fetchToken}
        className="text-xs font-bold px-4 py-2 rounded-lg transition-colors"
        style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
        Reintentar
      </button>
    </div>
  )

  // ── Sin token ─────────────────────────────────────────────
  if (!hasToken) return (
    <div className="space-y-6">
      {/* Empty state card */}
      <div className="rounded-2xl p-10 flex flex-col items-center gap-6 text-center"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <KeyRound className="w-7 h-7 text-amber-400" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="font-display font-black text-lg" style={{ color: 'var(--txt)' }}>
            Sin token activo
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--txt-3)' }}>
            Genera un token de instalación para que el cliente pueda desplegar
            el sensor en su infraestructura con un solo comando.
          </p>
        </div>
        <button onClick={handleGenerate} disabled={busy}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
          style={{
            background:  'linear-gradient(135deg, #FBBF24ee, #FBBF24bb)',
            color:       '#000',
            boxShadow:   '0 4px 20px rgba(251,191,36,0.25)',
            opacity:     busy ? 0.7 : 1,
          }}>
          {busy
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</>
            : <><KeyRound className="w-4 h-4" /> Generar token de instalación</>}
        </button>
      </div>

      {/* Info box */}
      <InfoBox />
    </div>
  )

  // ── Token activo o expirado ───────────────────────────────
  return (
    <div className="space-y-5">

      {/* Error inline */}
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl"
          style={{ background: 'rgba(251,113,133,0.08)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.2)' }}>
          {error}
        </div>
      )}

      {/* Status + actions card */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

        {/* Card header */}
        <div className="flex items-center gap-3 px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)', background: 'rgba(251,191,36,0.02)' }}>
          <div className="p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.08)' }}>
            <KeyRound className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>Token de instalación</p>
            <p className="text-xs" style={{ color: 'var(--txt-3)' }}>
              {client.company_name || client.username}
            </p>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full"
              style={{
                background: token.is_expired ? '#fb7185' : '#4ade80',
                boxShadow:  token.is_expired ? 'none' : '0 0 6px rgba(74,222,128,0.6)',
              }} />
            <span className="text-xs font-bold"
              style={{ color: token.is_expired ? '#fb7185' : '#4ade80' }}>
              {token.is_expired ? 'Expirado' : 'Activo'}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4">
            {expiry && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: `${expiry.color}10`, border: `1px solid ${expiry.color}25` }}>
                <span className="text-xs font-bold" style={{ color: expiry.color }}>{expiry.label}</span>
              </div>
            )}
            {token.created_at && (
              <span className="text-xs" style={{ color: 'var(--txt-3)' }}>
                Generado el{' '}
                {new Date(token.created_at).toLocaleDateString('es-ES', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            )}
            {token.expires_at && (
              <span className="text-xs" style={{ color: 'var(--txt-3)' }}>
                Válido hasta{' '}
                {new Date(token.expires_at).toLocaleDateString('es-ES', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            )}
          </div>

          {/* Expired warning */}
          {token.is_expired && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm leading-relaxed"
              style={{ background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.15)' }}>
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span style={{ color: 'rgba(251,113,133,0.9)' }}>
                Este token ha expirado y ya no puede usarse para instalar el sensor.
                Regenera uno nuevo para volver a habilitar la instalación.
              </span>
            </div>
          )}

          {/* Terminal: install command */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'var(--txt-3)' }}>
              Comando de instalación
            </p>
            <div className="rounded-xl overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.07)',
                       opacity: token.is_expired ? 0.5 : 1 }}>
              {/* Terminal bar */}
              <div className="flex items-center justify-between px-4 py-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                </div>
                <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  bash — Linux
                </span>
              </div>
              <div className="flex items-start gap-3 px-4 py-4">
                <span className="text-amber-400 font-mono text-sm select-none mt-0.5">$</span>
                <code className="flex-1 font-mono text-xs text-green-300 break-all leading-relaxed">
                  {token.install_cmd}
                </code>
                <button onClick={copyCmd} disabled={token.is_expired}
                  className="shrink-0 p-1.5 rounded-lg transition-all mt-0.5"
                  style={{
                    background: copied ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.05)',
                    border:     `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  }}>
                  {copied
                    ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                    : <Copy  className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.4)' }} />}
                </button>
              </div>
            </div>
          </div>

          {/* Copy CTA */}
          {!token.is_expired && (
            <button onClick={copyCmd}
              className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={{
                background: copied ? 'rgba(52,211,153,0.08)' : 'rgba(251,191,36,0.06)',
                color:      copied ? '#34d399' : '#FBBF24',
                border:     `1px solid ${copied ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.15)'}`,
              }}>
              {copied
                ? <><Check className="w-4 h-4" /> Copiado al portapapeles</>
                : <><Copy  className="w-4 h-4" /> Copiar comando completo</>}
            </button>
          )}
        </div>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Regenerar */}
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.08)' }}>
              <RefreshCw className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>Regenerar token</p>
              <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Crea uno nuevo (invalida el anterior)</p>
            </div>
          </div>
          <button onClick={handleGenerate} disabled={busy}
            className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'rgba(251,191,36,0.08)',
              color:      '#FBBF24',
              border:     '1px solid rgba(251,191,36,0.2)',
              opacity:    busy ? 0.6 : 1,
            }}
            onMouseEnter={e => { if (!busy) { e.currentTarget.style.background = 'rgba(251,191,36,0.14)'; e.currentTarget.style.borderColor = 'rgba(251,191,36,0.35)' }}}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,191,36,0.08)'; e.currentTarget.style.borderColor = 'rgba(251,191,36,0.2)' }}>
            {busy
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generando…</>
              : <><RefreshCw className="w-4 h-4" /> Regenerar token</>}
          </button>
        </div>

        {/* Revocar */}
        <div className="rounded-2xl p-5 space-y-4"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(251,113,133,0.08)' }}>
              <Trash2 className="w-4 h-4" style={{ color: '#fb7185' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>Revocar token</p>
              <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Elimina el token permanentemente</p>
            </div>
          </div>

          {confirmRevoke ? (
            <div className="space-y-3">
              <p className="text-xs leading-relaxed"
                style={{ color: 'rgba(251,113,133,0.8)' }}>
                ¿Confirmas que quieres revocar este token? El cliente no podrá
                instalar el sensor hasta que generes uno nuevo.
              </p>
              <div className="flex gap-2">
                <button onClick={handleRevoke} disabled={busy}
                  className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  style={{ background: 'rgba(251,113,133,0.12)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.3)' }}>
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Sí, revocar
                </button>
                <button onClick={() => setConfirmRevoke(false)} disabled={busy}
                  className="flex-1 py-2 rounded-xl text-xs font-bold transition-colors"
                  style={{ color: 'var(--txt-3)', border: '1px solid var(--border)' }}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmRevoke(true)} disabled={busy}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
              style={{ color: '#fb7185', border: '1px solid rgba(251,113,133,0.2)', opacity: busy ? 0.6 : 1 }}
              onMouseEnter={e => { if (!busy) { e.currentTarget.style.background = 'rgba(251,113,133,0.08)'; e.currentTarget.style.borderColor = 'rgba(251,113,133,0.35)' }}}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(251,113,133,0.2)' }}>
              <Trash2 className="w-4 h-4" />
              Revocar token
            </button>
          )}
        </div>
      </div>

      {/* Info box */}
      <InfoBox />
    </div>
  )
}

function InfoBox() {
  return (
    <div className="rounded-2xl p-5 flex gap-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="shrink-0 mt-0.5">
        <Info className="w-4 h-4 text-amber-400" />
      </div>
      <div className="space-y-2 text-xs leading-relaxed" style={{ color: 'var(--txt-3)' }}>
        <p className="font-bold text-sm" style={{ color: 'var(--txt)' }}>¿Cómo funciona?</p>
        <p>
          El token de instalación tiene una validez de <strong style={{ color: 'var(--txt)' }}>72 horas</strong>.
          El cliente debe ejecutar el comando en su servidor Linux como <code className="font-mono text-xs px-1 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.06)' }}>root</code>.
          El instalador configurará automáticamente los honeypots del plan contratado y el sensor
          aparecerá conectado en el panel.
        </p>
        <p>
          Si el token expira antes de que el cliente lo use, regenera uno nuevo desde esta misma sección.
          El sensor instalado <strong style={{ color: 'var(--txt)' }}>no se ve afectado</strong> por la
          revocación del token de instalación: solo impide nuevas instalaciones.
        </p>
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────

const TABS = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard, component: ClientDashboard },
  { id: 'sensors',   label: 'Sensores',   icon: Shield,          component: ClientSensors   },
  { id: 'alerts',    label: 'Alertas',    icon: Bell,            component: ClientAlerts    },
  { id: 'reports',   label: 'Informes',   icon: FileText,        component: ClientReports   },
  { id: 'account',   label: 'Cuenta',     icon: User,            component: ClientAccount   },
  { id: 'token',     label: 'Token',      icon: KeyRound,        component: TokenTab,
    adminOnly: true },
]

// ─── Page ─────────────────────────────────────────────────────

export default function AdminClientView() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    getAdminClient(id)
      .then(r => setClient(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="w-8 h-8 rounded-full animate-spin"
        style={{ border: '3px solid rgba(251,191,36,0.15)', borderTopColor: '#FBBF24' }} />
    </div>
  )

  if (error || !client) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <AlertCircle className="w-10 h-10" style={{ color: 'var(--txt-3)' }} />
      <p className="text-sm" style={{ color: 'var(--txt-3)' }}>Cliente no encontrado</p>
      <button onClick={() => navigate('/admin/clients')}
        className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
        ← Volver a clientes
      </button>
    </div>
  )

  const plan      = PLAN_META[client.plan] || PLAN_META.basico
  const initials  = (client.company_name || client.username).slice(0, 2).toUpperCase()
  const activeTab = TABS.find(t => t.id === tab) || TABS[0]
  const ActiveTab = activeTab.component

  return (
    <div className="space-y-6">
      {/* Admin banner */}
      <div className="rounded-2xl px-5 py-4 flex flex-wrap items-center gap-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

        <button onClick={() => navigate('/admin/clients')}
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors shrink-0"
          style={{ color: 'var(--txt-3)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--txt)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--txt-3)'}>
          <ChevronLeft className="w-4 h-4" />
          Clientes
        </button>

        <div className="w-px h-5 shrink-0" style={{ background: 'var(--border)' }} />

        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
            style={{ background: plan.bg, border: `1px solid ${plan.border}`, color: plan.color }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-display font-black text-base leading-tight truncate" style={{ color: 'var(--txt)' }}>
              {client.company_name || client.username}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--txt-3)' }}>
              @{client.username} · {client.company_sector || 'Sin sector'}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shrink-0"
          style={{ background: plan.bg, color: plan.color, border: `1px solid ${plan.border}` }}>
          {plan.label}
        </span>

        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shrink-0"
          style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
          Vista admin
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit overflow-x-auto"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {TABS.map(({ id: tid, label, icon: Icon, adminOnly }) => {
          const isActive = tab === tid
          return (
            <button key={tid} onClick={() => setTab(tid)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 shrink-0"
              style={isActive
                ? adminOnly
                  ? { background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)' }
                  : { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
                : { color: adminOnly ? 'rgba(251,191,36,0.5)' : 'var(--txt-3)', border: '1px solid transparent' }
              }>
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <PreviewUserProvider user={client}>
        <ActiveTab />
      </PreviewUserProvider>
    </div>
  )
}
