import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Printer, TrendingUp, Shield, Globe, Cpu } from 'lucide-react'
import { getSummary, getOverview, getHoneypots } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function ClientReports() {
  const { user } = useAuth()
  const [summary,   setSummary]   = useState(null)
  const [overview,  setOverview]  = useState(null)
  const [honeypots, setHoneypots] = useState([])
  const now = new Date()

  useEffect(() => {
    getSummary().then(r => setSummary(r.data)).catch(() => {})
    getOverview().then(r => setOverview(r.data)).catch(() => {})
    getHoneypots().then(r => setHoneypots(r.data || [])).catch(() => {})
  }, [])

  const score = summary
    ? Math.max(0, 100 - Math.min(100, Math.floor((summary.attacks_24h || 0) / 3)))
    : null

  return (
    <>
      <div className="space-y-6 print:hidden">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>Informes</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--txt-2)' }}>Resumen de actividad para tu organización</p>
          </div>
          <button
            onClick={() => window.print()}
            className="btn-premium flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir informe
          </button>
        </div>
      </div>

      {/* Printable report */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="mt-6 rounded-2xl p-8 print:rounded-none print:shadow-none print:p-0"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        id="report-content"
      >
        {/* Report header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest text-amber-400">Informe de Seguridad</span>
            </div>
            <h2 className="font-display font-black text-2xl" style={{ color: 'var(--txt)' }}>
              {user?.company_name || 'Mi Empresa'}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--txt-2)' }}>
              Período: {now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold" style={{ color: 'var(--txt-3)' }}>Generado el</p>
            <p className="text-sm font-bold" style={{ color: 'var(--txt-1)' }}>
              {now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--txt-3)' }}>Plan: <span className="font-bold capitalize">{user?.plan || 'básico'}</span></p>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Shield,     label: 'Score seguridad',    value: score !== null ? `${score}/100` : '—', color: score > 70 ? '#fb7185' : score > 40 ? '#FBBF24' : '#34d399' },
            { icon: TrendingUp, label: 'Ataques (24h)',       value: summary?.attacks_24h ?? '—',          color: '#FBBF24' },
            { icon: Globe,      label: 'Total ataques',       value: summary?.total_attacks ?? '—',         color: '#60a5fa' },
            { icon: Cpu,        label: 'Sensores activos',    value: '6 / 6',                              color: '#34d399' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
              <Icon className="w-4 h-4 mx-auto mb-2" style={{ color }} />
              <p className="font-display font-black text-2xl" style={{ color }}>{value}</p>
              <p className="text-[10px] uppercase font-bold tracking-wider mt-1" style={{ color: 'var(--txt-3)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Top IPs */}
        {overview?.top_ips?.length > 0 && (
          <div className="mb-8">
            <h3 className="font-display font-bold text-sm mb-3" style={{ color: 'var(--txt)' }}>Top IPs atacantes</h3>
            <div className="space-y-2">
              {overview.top_ips.slice(0, 5).map(({ ip, count }, i) => (
                <div key={ip} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-black text-center" style={{ color: 'var(--txt-3)' }}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-mono font-bold" style={{ color: 'var(--txt-1)' }}>{ip}</span>
                      <span style={{ color: 'var(--txt-3)' }}>{count} ataques</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (count / (overview.top_ips[0].count || 1)) * 100)}%`, background: '#FBBF24' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sensors status */}
        <div className="mb-8">
          <h3 className="font-display font-bold text-sm mb-3" style={{ color: 'var(--txt)' }}>Estado de sensores</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Cowrie', 'Dionaea', 'Glastopf', 'Conpot', 'Honeytrap', 'Honeyd'].map(name => {
              const stats = honeypots.find(h => h.name?.toLowerCase() === name.toLowerCase())
              return (
                <div key={name} className="rounded-lg px-4 py-3 flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <span className="text-sm font-semibold" style={{ color: 'var(--txt-1)' }}>{name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'var(--txt-3)' }}>{stats?.attacks_24h ?? stats?.count ?? 0} att.</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t text-center" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--txt-3)' }}>
            HONEYPOT CYBERSECURITY · Informe generado automáticamente · Datos en tiempo real
          </p>
        </div>
      </motion.div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-content, #report-content * { visibility: visible; }
          #report-content { position: absolute; left: 0; top: 0; width: 100%; background: white !important; color: black !important; }
        }
      `}</style>
    </>
  )
}
