import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Newspaper, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react'
import { getNews } from '../services/api'
import PublicNavbar from '../components/Layout/PublicNavbar'
import { useTheme } from '../context/ThemeContext'

function timeAgo(isoStr) {
  if (!isoStr) return ''
  try { return formatDistanceToNow(parseISO(isoStr), { addSuffix: true, locale: es }) }
  catch { return '' }
}

export default function News() {
  const [articles, setArticles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [filter,   setFilter]   = useState('Todos')
  const { isDark } = useTheme()

  const SOURCE_STYLES = {
    'The Hacker News':   { dot: '#FBBF24', color: '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
    'BleepingComputer':  { dot: '#fb7185', color: '#fb7185', bg: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.2)' },
    'Krebs on Security': {
      dot:    isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
      color:  isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
      bg:     isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      border: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)',
    },
    'Dark Reading': { dot: '#FCD34D', color: '#FCD34D', bg: 'rgba(252,211,77,0.08)', border: 'rgba(252,211,77,0.2)' },
  }

  const ALL_SOURCES = ['Todos', ...Object.keys(SOURCE_STYLES)]

  const load = async () => {
    setLoading(true); setError(false)
    try { setArticles((await getNews()).data) } catch { setError(true) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'Todos'
    ? [...articles].sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0))
    : articles.filter(a => a.source === filter)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--txt)' }}>
      <PublicNavbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Newspaper className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Fuentes especializadas</span>
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl mb-4" style={{ color: 'var(--txt)' }}>
            Noticias de{' '}
            <span className="text-amber-400" style={{ textShadow: '0 0 32px rgba(251,191,36,0.4)' }}>
              Ciberseguridad
            </span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--txt-2)' }}>
            Últimas alertas, vulnerabilidades y análisis de amenazas de las fuentes
            más reconocidas del sector.
          </p>
        </motion.div>
      </section>

      {/* Filtros */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_SOURCES.map(src => {
            const active = filter === src
            const s = SOURCE_STYLES[src]
            return (
              <button
                key={src}
                onClick={() => setFilter(src)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150"
                style={active
                  ? { color: s ? s.color : 'var(--txt)', background: s ? s.bg : 'var(--inset)', borderColor: s ? s.border : 'var(--border)' }
                  : { color: 'var(--txt-3)', background: 'transparent', borderColor: 'var(--border)' }
                }
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--txt-1)'; e.currentTarget.style.borderColor = 'var(--border-strong)' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--txt-3)'; e.currentTarget.style.borderColor = 'var(--border)' } }}
              >
                {s && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />}
                {src}
              </button>
            )
          })}
          <button
            onClick={load}
            disabled={loading}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-40"
            style={{ color: 'var(--txt-3)', borderColor: 'var(--border)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--txt)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--txt-3)'; e.currentTarget.style.borderColor = 'var(--border)' }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Contenido */}
      <section className="max-w-6xl mx-auto px-6 pb-20">

        {/* Skeleton loader */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-6 animate-pulse"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="h-2.5 rounded w-24 mb-4" style={{ background: 'var(--inset)' }} />
                <div className="h-4 rounded w-full mb-2" style={{ background: 'var(--inset)' }} />
                <div className="h-4 rounded w-3/4 mb-5" style={{ background: 'var(--inset)' }} />
                <div className="h-3 rounded w-full mb-2" style={{ background: 'var(--surface-2)' }} />
                <div className="h-3 rounded w-5/6 mb-2" style={{ background: 'var(--surface-2)' }} />
                <div className="h-3 rounded w-4/6" style={{ background: 'var(--surface-2)' }} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4" style={{ color: 'var(--txt-3)' }}>
            <AlertCircle className="w-10 h-10 text-rose-500/50" />
            <p className="text-sm font-medium">No se pudieron cargar las noticias</p>
            <button onClick={load} className="btn-outline text-xs font-bold uppercase tracking-widest">
              Reintentar
            </button>
          </div>
        )}

        {/* Vacío */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3"
            style={{ color: 'var(--txt-3)' }}>
            <Newspaper className="w-10 h-10 opacity-20" />
            <p className="text-sm">No hay artículos para esta fuente</p>
          </div>
        )}

        {/* Grid de artículos */}
        {!loading && !error && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((article, i) => {
              const s = SOURCE_STYLES[article.source]
              return (
                <motion.a
                  key={article.id || i}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="group flex flex-col gap-4 p-6 rounded-2xl transition-all duration-200 cursor-pointer"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background  = 'var(--surface-2)'
                    e.currentTarget.style.borderColor = s ? s.border : 'var(--border-strong)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background  = 'var(--surface)'
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {/* Fuente + tiempo */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 badge-premium text-[10px]"
                      style={s
                        ? { color: s.color, background: s.bg, borderColor: s.border }
                        : { color: 'var(--txt-2)', background: 'var(--inset)', borderColor: 'var(--border)' }
                      }>
                      {s && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />}
                      {article.source}
                    </span>
                    {article.published && (
                      <span className="text-[10px] shrink-0" style={{ color: 'var(--txt-3)' }}>
                        {timeAgo(article.published)}
                      </span>
                    )}
                  </div>

                  {/* Título */}
                  <h3 className="font-display font-bold text-sm leading-snug line-clamp-3 transition-colors duration-150 group-hover:text-amber-400"
                    style={{ color: 'var(--txt)' }}>
                    {article.title}
                  </h3>

                  {/* Resumen */}
                  {article.summary && (
                    <p className="text-xs leading-relaxed line-clamp-3 flex-1" style={{ color: 'var(--txt-2)' }}>
                      {article.summary}
                    </p>
                  )}

                  {/* CTA */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold mt-auto pt-1 transition-colors duration-150"
                    style={{ color: 'var(--txt-3)' }}
                    ref={el => {
                      if (!el) return
                      el.closest('a').addEventListener('mouseenter', () => el.style.color = '#FBBF24')
                      el.closest('a').addEventListener('mouseleave', () => el.style.color = 'var(--txt-3)')
                    }}>
                    Leer artículo completo
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </motion.a>
              )
            })}
          </motion.div>
        )}
      </section>

      <footer className="py-8 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--txt-3)' }}>
          Las noticias se obtienen directamente de los feeds RSS de cada publicación. HoneyWatch no modifica su contenido.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--txt-4)' }}>
          Fuentes: The Hacker News · BleepingComputer · Krebs on Security · Dark Reading
        </p>
      </footer>
    </div>
  )
}
