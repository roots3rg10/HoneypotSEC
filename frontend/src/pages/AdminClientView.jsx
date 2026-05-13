import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ChevronLeft, LayoutDashboard, Shield, Bell, FileText, User, AlertCircle } from 'lucide-react'
import { getAdminClient } from '../services/api'
import { PreviewUserProvider } from '../context/PreviewUserContext'
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

const TABS = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard, component: ClientDashboard },
  { id: 'sensors',   label: 'Sensores',   icon: Shield,          component: ClientSensors   },
  { id: 'alerts',    label: 'Alertas',    icon: Bell,            component: ClientAlerts    },
  { id: 'reports',   label: 'Informes',   icon: FileText,        component: ClientReports   },
  { id: 'account',   label: 'Cuenta',     icon: User,            component: ClientAccount   },
]

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

  const plan     = PLAN_META[client.plan] || PLAN_META.basico
  const initials = (client.company_name || client.username).slice(0, 2).toUpperCase()
  const ActiveTab = TABS.find(t => t.id === tab)?.component || ClientDashboard

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

        {/* Company identity */}
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

        {/* Plan badge */}
        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shrink-0"
          style={{ background: plan.bg, color: plan.color, border: `1px solid ${plan.border}` }}>
          {plan.label}
        </span>

        {/* Admin badge */}
        <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shrink-0"
          style={{ background: 'rgba(251,191,36,0.08)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
          Vista admin
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {TABS.map(({ id: tid, label, icon: Icon }) => (
          <button key={tid} onClick={() => setTab(tid)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150"
            style={tab === tid
              ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
              : { color: 'var(--txt-3)', border: '1px solid transparent' }
            }>
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Client portal content wrapped in preview context */}
      <PreviewUserProvider user={client}>
        <ActiveTab />
      </PreviewUserProvider>
    </div>
  )
}
