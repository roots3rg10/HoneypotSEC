import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, CheckCircle2, XCircle } from 'lucide-react'
import { getQuizResults } from '../services/api'

const ARTICLE_LABELS = {
  'fuerza-bruta-ssh':              'Fuerza bruta SSH',
  'ataques-aplicaciones-web':      'Ataques web',
  'propagacion-malware-red':       'Propagación de malware',
  'ataques-ics-scada':             'ICS / SCADA',
  'ingenieria-social-phishing':    'Ingeniería social',
  'guia-contrasenas-seguras':      'Contraseñas seguras',
  'escaneo-puertos-reconocimiento':'Escaneo de puertos',
  'que-es-un-honeypot':            '¿Qué es un honeypot?',
}

export default function AdminQuizResults() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getQuizResults()
      .then(r => setRows(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full animate-spin"
        style={{ border: '3px solid rgba(251,191,36,0.15)', borderTopColor: '#FBBF24' }} />
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-7">
      <div className="flex items-center gap-3">
        <Award className="w-6 h-6 text-amber-400" />
        <h1 className="font-display font-black text-2xl text-white">Resultados de quizzes</h1>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {rows.length} intentos
        </span>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Empleado', 'Módulo', 'Puntuación', 'Resultado', 'Fecha'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Ningún empleado ha completado un quiz todavía.
                  </td>
                </tr>
              ) : rows.map(r => {
                const passed = (r.score / r.max_score) >= 0.7
                const pct    = Math.round((r.score / r.max_score) * 100)
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{r.username}</td>
                    <td className="px-6 py-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {ARTICLE_LABELS[r.article_slug] || r.article_slug}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold" style={{ color: passed ? '#4ade80' : '#fb7185' }}>
                          {r.score}/{r.max_score}
                        </span>
                        <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {passed
                        ? <span className="flex items-center gap-1.5 text-xs font-bold text-green-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />Superado
                          </span>
                        : <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                            <XCircle className="w-3.5 h-3.5" />No superado
                          </span>
                      }
                    </td>
                    <td className="px-6 py-4 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {new Date(r.completed_at).toLocaleString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
