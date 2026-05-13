import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Award, SlidersHorizontal, BookOpen, CheckCircle2, XCircle, Lock } from 'lucide-react'
import { getArticles, getCategories, getQuizResults, getMyQuizResults } from '../services/api'
import ArticleCard from '../components/Education/ArticleCard'
import PublicNavbar from '../components/Layout/PublicNavbar'
import { useAuth } from '../context/AuthContext'

const DIFFICULTIES = ['principiante', 'intermedio', 'avanzado']

const ARTICLE_LABELS = {
  'fuerza-bruta-ssh':               'Fuerza bruta SSH',
  'ataques-aplicaciones-web':       'Ataques web',
  'propagacion-malware-red':        'Propagación de malware',
  'ataques-ics-scada':              'ICS / SCADA',
  'ingenieria-social-phishing':     'Ingeniería social',
  'guia-contrasenas-seguras':       'Contraseñas seguras',
  'escaneo-puertos-reconocimiento': 'Escaneo de puertos',
  'que-es-un-honeypot':             '¿Qué es un honeypot?',
}

function ArticlesTab() {
  const [articles,   setArticles]   = useState([])
  const [categories, setCategories] = useState([])
  const [category,   setCategory]   = useState('')
  const [difficulty, setDifficulty] = useState('')

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const params = {}
    if (category)   params.category   = category
    if (difficulty) params.difficulty = difficulty
    getArticles(params).then(r => setArticles(r.data)).catch(() => {})
  }, [category, difficulty])

  return (
    <div className="space-y-7">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mr-1" style={{ color: 'var(--txt-3)' }}>
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Filtrar por</span>
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 outline-none cursor-pointer transition-colors"
          style={{ background: 'var(--inset)', border: '1px solid var(--border)', color: 'var(--txt-2)' }}
        >
          <option value="">Todos los dominios</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="w-px h-4" style={{ background: 'var(--border)' }} />
        <div className="flex gap-1.5">
          {DIFFICULTIES.map(d => (
            <button key={d}
              onClick={() => setDifficulty(prev => prev === d ? '' : d)}
              className="px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-150 border"
              style={difficulty === d
                ? { background: 'rgba(251,191,36,0.1)', color: '#FBBF24', borderColor: 'rgba(251,191,36,0.2)' }
                : { background: 'transparent', color: 'var(--txt-3)', borderColor: 'var(--border)' }
              }>
              {d}
            </button>
          ))}
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--txt-3)' }}>
          <BookOpen className="w-12 h-12 opacity-20" />
          <p className="text-sm font-bold uppercase tracking-widest opacity-40">No se encontraron artículos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {articles.map((a, idx) => (
            <motion.div key={a.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}>
              <ArticleCard article={a} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function ResultsTable({ rows, showUser }) {
  const cols = showUser
    ? ['Empleado', 'Módulo', 'Puntuación', 'Resultado', 'Fecha']
    : ['Módulo', 'Puntuación', 'Resultado', 'Fecha']

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <Award className="w-4 h-4 text-amber-400" />
        <span className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>
          {showUser ? 'Resultados de todos los usuarios' : 'Mis resultados'}
        </span>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full ml-1"
          style={{ background: 'var(--inset)', color: 'var(--txt-3)', border: '1px solid var(--border)' }}>
          {rows.length} {rows.length === 1 ? 'intento' : 'intentos'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {cols.map(h => (
                <th key={h} className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'var(--txt-3)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={cols.length} className="px-6 py-12 text-center text-sm" style={{ color: 'var(--txt-3)' }}>
                  {showUser ? 'Ningún usuario ha completado un quiz todavía.' : 'Aún no has completado ningún quiz. ¡Lee un artículo y ponlo a prueba!'}
                </td>
              </tr>
            ) : rows.map(r => {
              const passed = (r.score / r.max_score) >= 0.7
              const pct    = Math.round((r.score / r.max_score) * 100)
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  {showUser && (
                    <td className="px-6 py-4 font-semibold" style={{ color: 'var(--txt)' }}>{r.username}</td>
                  )}
                  <td className="px-6 py-4" style={{ color: 'var(--txt-2)' }}>
                    {ARTICLE_LABELS[r.article_slug] || r.article_slug}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold" style={{ color: passed ? '#4ade80' : '#fb7185' }}>
                        {r.score}/{r.max_score}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--txt-3)' }}>{pct}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {passed
                      ? <span className="flex items-center gap-1.5 text-xs font-bold text-green-400"><CheckCircle2 className="w-3.5 h-3.5" />Superado</span>
                      : <span className="flex items-center gap-1.5 text-xs font-bold text-rose-400"><XCircle className="w-3.5 h-3.5" />No superado</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-xs font-mono" style={{ color: 'var(--txt-3)' }}>
                    {new Date(r.completed_at).toLocaleString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function QuizResultsTab() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const fetch = isAdmin ? getQuizResults : getMyQuizResults
    fetch().then(r => setRows(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [user, isAdmin])

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-2xl"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="p-4 rounded-2xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <Lock className="w-6 h-6 text-amber-400" />
      </div>
      <p className="font-display font-black text-lg" style={{ color: 'var(--txt)' }}>Inicia sesión para ver tus resultados</p>
      <p className="text-sm text-center max-w-xs" style={{ color: 'var(--txt-2)' }}>
        Completa los quizzes y lleva un registro de tu progreso formativo.
      </p>
      <a href="/login"
        className="mt-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150"
        style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#FBBF24' }}>
        Iniciar sesión
      </a>
    </div>
  )

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full animate-spin"
        style={{ border: '3px solid rgba(251,191,36,0.15)', borderTopColor: '#FBBF24' }} />
    </div>
  )

  return <ResultsTable rows={rows} showUser={isAdmin} />
}

const TABS = [
  { id: 'articles', label: 'Artículos', icon: GraduationCap },
  { id: 'results',  label: 'Resultados quiz', icon: Award },
]

export default function Academy() {
  const [tab, setTab] = useState('articles')

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--txt)', transition: 'background 0.3s ease' }}>
      <PublicNavbar />

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="mb-12">
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full"
            style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
            <GraduationCap className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Academia de amenazas
            </span>
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl mb-4" style={{ color: 'var(--txt)' }}>
            Aprende sobre{' '}
            <span style={{ color: 'var(--accent)' }}>ciberamenazas reales</span>
          </h1>
          <p className="text-lg max-w-2xl" style={{ color: 'var(--txt-2)' }}>
            Análisis en profundidad de ataques capturados por nuestros sensores.
            Recursos educativos para todos los niveles.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl w-fit"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-150"
              style={tab === id
                ? { background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }
                : { color: 'var(--txt-3)', border: '1px solid transparent' }
              }>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {tab === 'articles' ? <ArticlesTab /> : <QuizResultsTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="py-8 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--txt-3)' }}>HONEYPOT CYBERSECURITY — Academia de Inteligencia de Amenazas</p>
      </footer>
    </div>
  )
}
