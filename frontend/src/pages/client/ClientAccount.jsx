import { motion } from 'framer-motion'
import { Building2, User, Mail, Shield, Check, Key, Headphones, BadgeCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePreviewUser } from '../../context/PreviewUserContext'
import { hasPlan } from '../../components/PlanGate'

const PLAN_DETAILS = {
  basico:      { name: 'Básico',      color: '#94a3b8', features: ['2 sensores activos', 'Dashboard básico', 'Score de seguridad', 'Historial 30 días'] },
  profesional: { name: 'Profesional', color: '#FBBF24', features: ['6 sensores activos', 'Mapa geográfico', 'Alertas en tiempo real', 'Informes PDF', 'Historial 90 días (3 meses)'] },
  empresarial: { name: 'Empresarial', color: '#fb7185', features: ['Sensores ilimitados', 'API completa sin límites', 'Alertas + SMS', 'Informes personalizados', 'Historial 180 días (6 meses)', 'SLA 99.9%', 'Soporte 24/7', 'Account manager dedicado'] },
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
  const { user: authUser } = useAuth()
  const previewUser = usePreviewUser()
  const user = previewUser ?? authUser
  const plan       = user?.plan || 'basico'
  const planData   = PLAN_DETAILS[plan] || PLAN_DETAILS.basico
  const isEnterprise = hasPlan(plan, 'empresarial')
  const isPro        = hasPlan(plan, 'profesional')

  const mockApiToken = `hps_${user?.id ?? '0'}_${btoa(user?.username || 'user').replace(/=/g, '').slice(0, 24)}`

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
        style={{ background: 'var(--surface)', border: `1px solid ${planData.color}30` }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>Plan activo</h2>
            {isEnterprise && (
              <BadgeCheck className="w-4 h-4" style={{ color: planData.color }} />
            )}
          </div>
          <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: `${planData.color}15`, color: planData.color, border: `1px solid ${planData.color}30` }}>
            {planData.name}
          </span>
        </div>
        <div className="space-y-2.5">
          {planData.features.map(f => (
            <div key={f} className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 shrink-0" style={{ color: planData.color }} />
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

      {/* API Token — Profesional + */}
      {isPro && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <Key className="w-4 h-4 text-amber-400" />
            <h2 className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>Token de API</h2>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--txt-2)' }}>
            Usa este token para acceder a la API de lectura desde tus sistemas.
            {!isEnterprise && ' Plan Profesional: 1.000 req/día.'}
            {isEnterprise  && ' Plan Empresarial: sin límites.'}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs px-4 py-3 rounded-xl font-mono overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: '#FBBF24' }}>
              {mockApiToken}
            </code>
            <button
              onClick={() => navigator.clipboard?.writeText(mockApiToken)}
              className="text-xs font-bold px-3 py-3 rounded-xl transition-all shrink-0"
              style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
              Copiar
            </button>
          </div>
        </motion.div>
      )}

      {/* Soporte dedicado — solo Empresarial */}
      {isEnterprise && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-2xl p-6"
          style={{ background: 'rgba(251,113,133,0.04)', border: '1px solid rgba(251,113,133,0.2)' }}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'rgba(251,113,133,0.15)' }}>
            <Headphones className="w-4 h-4" style={{ color: '#fb7185' }} />
            <h2 className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>Soporte dedicado 24/7</h2>
            <span className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(251,113,133,0.15)', color: '#fb7185' }}>Enterprise</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--txt-1)' }}>Account Manager</p>
                <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Tu contacto directo para cualquier incidencia</p>
              </div>
              <a href="mailto:soporte@honeypotsec.io"
                className="text-xs font-bold px-3 py-2 rounded-lg transition-all"
                style={{ background: 'rgba(251,113,133,0.1)', color: '#fb7185', border: '1px solid rgba(251,113,133,0.2)' }}>
                Contactar
              </a>
            </div>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--txt-3)' }}>
              <BadgeCheck className="w-3.5 h-3.5" style={{ color: '#fb7185' }} />
              SLA 99.9% garantizado · Respuesta en &lt;1h
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
