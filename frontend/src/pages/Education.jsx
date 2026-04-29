import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getArticles, getCategories } from '../services/api'
import ArticleCard from '../components/Education/ArticleCard'
import { GraduationCap, SlidersHorizontal, BookOpen } from 'lucide-react'

const DIFFICULTIES = ['principiante', 'intermedio', 'avanzado']

export default function Education() {
  const [articles,   setArticles]   = useState([])
  const [categories, setCategories] = useState([])
  const [category,   setCategory]   = useState('')
  const [difficulty, setDifficulty] = useState('')

  useEffect(() => {
    getCategories().then(r => setCategories(r.data)).catch(console.error)
  }, [])

  useEffect(() => {
    const params = {}
    if (category)   params.category   = category
    if (difficulty) params.difficulty = difficulty
    getArticles(params).then(r => setArticles(r.data)).catch(console.error)
  }, [category, difficulty])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-7 p-2 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h2 className="text-3xl font-display font-black text-white tracking-tight mb-1.5">
            Academia de{' '}
            <span className="text-amber-400" style={{ textShadow: '0 0 24px rgba(251,191,36,0.4)' }}>
              amenazas
            </span>
          </h2>
          <p className="text-sm font-medium max-w-2xl" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Análisis en profundidad de ciberamenazas reales capturadas por nuestros sensores.
            Recursos educativos para todos los niveles, desde principiante hasta experto.
          </p>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <GraduationCap className="w-6 h-6 text-amber-400" />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 mr-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Filtrar por</span>
        </div>

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 outline-none cursor-pointer transition-colors"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <option value="">Todos los dominios</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="w-px h-4" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <div className="flex gap-1.5">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(prev => prev === d ? '' : d)}
              className="px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-150 border"
              style={difficulty === d
                ? { background: 'rgba(251,191,36,0.1)', color: '#FBBF24', borderColor: 'rgba(251,191,36,0.2)' }
                : { background: 'transparent', color: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.07)' }
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-20 gap-4"
          style={{ color: 'rgba(255,255,255,0.2)' }}>
          <BookOpen className="w-12 h-12 opacity-10" />
          <p className="text-sm font-bold uppercase tracking-widest opacity-40">No se encontraron artículos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {articles.map((a, idx) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
            >
              <ArticleCard article={a} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
