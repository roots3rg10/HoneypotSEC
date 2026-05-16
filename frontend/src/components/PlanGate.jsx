import { Link } from 'react-router-dom'
import { Lock, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { usePreviewUser } from '../context/PreviewUserContext'

const PLAN_ORDER = { freemium: 0, basico: 1, profesional: 2, empresarial: 3 }
const PLAN_LABEL = { basico: 'Básico', profesional: 'Profesional', empresarial: 'Empresarial' }
const PLAN_COLOR = { basico: 'rgba(148,163,184,0.8)', profesional: '#FBBF24', empresarial: '#fb7185' }
const PLAN_PRICE = { basico: '€4.99/mes', profesional: '€30/mes', empresarial: '€50/mes' }

export function hasPlan(userPlan, required) {
  return (PLAN_ORDER[userPlan] ?? 0) >= (PLAN_ORDER[required] ?? 0)
}

export default function PlanGate({ requires, children, title, description, compact = false }) {
  const { user: authUser } = useAuth()
  const previewUser = usePreviewUser()
  const user = previewUser ?? authUser
  if (hasPlan(user?.plan, requires)) return children

  const color = PLAN_COLOR[requires]
  const label = PLAN_LABEL[requires]
  const price = PLAN_PRICE[requires]

  if (compact) {
    return (
      <div className="rounded-xl flex items-center gap-4 px-5 py-4"
        style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
        <div className="p-2 rounded-lg shrink-0" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
          <Lock className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: 'var(--txt)' }}>
            {title || `Requiere plan ${label}`}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--txt-2)' }}>
            {description || `Disponible desde ${price}`}
          </p>
        </div>
        <Link to="/pricing"
          className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1.5"
          style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}>
          Ver planes <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl flex flex-col items-center justify-center text-center gap-5 py-16 px-6"
      style={{ background: 'var(--surface)', border: `1px solid ${color}20` }}>
      <div className="p-5 rounded-2xl" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
        <Lock className="w-7 h-7" style={{ color }} />
      </div>
      <div>
        <p className="font-display font-black text-xl" style={{ color: 'var(--txt)' }}>
          {title || 'Función exclusiva'}
        </p>
        <p className="text-sm mt-2 max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--txt-2)' }}>
          {description || `Disponible en el plan ${label} (${price}) y superiores.`}
        </p>
      </div>
      <Link to="/pricing"
        className="flex items-center gap-2 text-sm font-bold px-6 py-3 rounded-xl transition-all"
        style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
        Ver planes y precios <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
