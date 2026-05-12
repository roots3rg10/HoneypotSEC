import { motion } from 'framer-motion'
import { Building2, User, Mail, Shield, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const PLAN_DETAILS = {
  basico:       { name: 'Básico',       color: '#94a3b8', features: ['2 sensores activos', 'Dashboard básico', 'Alertas email (24h delay)'] },
  profesional:  { name: 'Profesional',  color: '#FBBF24', features: ['6 sensores activos', 'Dashboard completo', 'Alertas en tiempo real', 'Informes PDF', 'API (1.000 req/día)'] },
  empresarial:  { name: 'Empresarial',  color: '#fb7185', features: ['Sensores ilimitados', 'Dashboard multi-sede', 'API sin límites', 'SLA 99.9%', 'Soporte 24/7'] },
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <div className="p-2 rounded-lg shrink-0" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
        <Icon className="w-4 h-4 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--txt-3)' }}>{label}</p>
        <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: 'var(--txt-1)' }}>{value || '—'}</p>
      </div>
    </div>
  )
}

export default function ClientAccount() {
  const { user } = useAuth()
  const plan = PLAN_DETAILS[user?.plan] || PLAN_DETAILS.basico

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>Mi Cuenta</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--txt-2)' }}>Información de tu empresa y suscripción activa</p>
      </div>

      {/* Account info */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="rounded-2xl p-6"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="font-display font-bold text-sm mb-4 pb-3 border-b" style={{ color: 'var(--txt)', borderColor: 'var(--border)' }}>
          Datos de la cuenta
        </h2>
        <InfoRow icon={Building2} label="Empresa"  value={user?.company_name} />
        <InfoRow icon={Shield}    label="Sector"   value={user?.company_sector} />
        <InfoRow icon={User}      label="Usuario"  value={user?.username} />
        <InfoRow icon={Mail}      label="Email"    value={user?.email} />
      </motion.div>

      {/* Plan */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-2xl p-6"
        style={{ background: 'var(--surface)', border: `1px solid ${plan.color}30` }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>Plan activo</h2>
          <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: `${plan.color}15`, color: plan.color, border: `1px solid ${plan.color}30` }}>
            {plan.name}
          </span>
        </div>
        <div className="space-y-2.5">
          {plan.features.map(f => (
            <div key={f} className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 shrink-0" style={{ color: plan.color }} />
              <span className="text-sm" style={{ color: 'var(--txt-1)' }}>{f}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--txt-3)' }}>
            Para cambiar de plan o gestionar la facturación, contacta con nuestro equipo en{' '}
            <a href="mailto:info@honeypotsec.io" className="text-amber-400 hover:text-amber-300 transition-colors">
              info@honeypotsec.io
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
