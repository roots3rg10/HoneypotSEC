import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Building2, ChevronRight, Search, Shield, Users } from 'lucide-react'
import { getAdminClients } from '../services/api'

const PLAN_META = {
  basico:      { label: 'Básico',      color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
  profesional: { label: 'Profesional', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)'  },
  empresarial: { label: 'Empresarial', color: '#fb7185', bg: 'rgba(251,113,133,0.1)', border: 'rgba(251,113,133,0.2)' },
}

export default function AdminClients() {
  const navigate            = useNavigate()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

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
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>Clientes</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--txt-3)' }}>
          Accede al portal de cada empresa y supervisa su actividad
        </p>
      </div>

      {/* KPIs */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total clientes', value: clients.length, color: '#60a5fa', icon: Users },
            { label: 'Plan Básico',       value: byPlan('basico'),      color: '#94a3b8', icon: Shield },
            { label: 'Plan Profesional',  value: byPlan('profesional'), color: '#FBBF24', icon: Shield },
            { label: 'Plan Empresarial',  value: byPlan('empresarial'), color: '#fb7185', icon: Shield },
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

      {/* Search + Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-4 px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-display font-bold text-sm flex-1" style={{ color: 'var(--txt)' }}>
            Empresas cliente
          </span>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--txt-3)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-9 pr-4 py-1.5 rounded-xl text-xs outline-none w-44 transition-all"
              style={{ background: 'var(--inset)', border: '1px solid var(--border)', color: 'var(--txt)' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(251,191,36,0.4)'; e.target.style.width = '180px' }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)' }}
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
              const plan = PLAN_META[client.plan] || PLAN_META.basico
              const initials = (client.company_name || client.username).slice(0, 2).toUpperCase()
              return (
                <motion.button
                  key={client.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/admin/clients/${client.id}`)}
                  className="w-full flex items-center gap-4 px-6 py-4 text-left transition-colors group"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--inset)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                    style={{ background: plan.bg, border: `1px solid ${plan.border}`, color: plan.color }}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--txt)' }}>
                      {client.company_name || client.username}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--txt-3)' }}>
                      @{client.username} · {client.company_sector || 'Sin sector'}
                    </p>
                  </div>

                  {/* Plan badge */}
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 hidden sm:inline-flex"
                    style={{ background: plan.bg, color: plan.color, border: `1px solid ${plan.border}` }}>
                    {plan.label}
                  </span>

                  {/* Status */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full"
                      style={{ background: client.is_active ? '#4ade80' : '#fb7185' }} />
                    <span className="text-[10px] font-bold hidden md:inline" style={{ color: 'var(--txt-3)' }}>
                      {client.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-4 h-4 shrink-0 transition-all duration-150 opacity-20 group-hover:opacity-60 group-hover:translate-x-0.5"
                    style={{ color: 'var(--txt-3)' }} />
                </motion.button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
