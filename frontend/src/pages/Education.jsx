import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getArticles, getCategories } from '../services/api'
import ArticleCard from '../components/Education/ArticleCard'
import { GraduationCap, Filter, BookOpen } from 'lucide-react'

const DIFFICULTIES = ['principiante', 'intermedio', 'avanzado']

export default function Education() {
  const [articles,    setArticles]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [category,    setCategory]    = useState('')
  const [difficulty,  setDifficulty]  = useState('')

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
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 p-2 pb-20"
    >
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-display font-extrabold text-white tracking-tight mb-2">
            Threat <span className="text-glow-rose text-rose-400">Academy</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl">
            Deep dive into real-world cyber threats captured by our sensors. 
            Educational resources for all skill levels from novice to expert.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <GraduationCap className="w-6 h-6 text-rose-400" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-slate-500 mr-2">
          <Filter className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Filter By</span>
        </div>

        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-2 hover:border-slate-600 transition-colors cursor-pointer outline-none"
        >
          <option value="">All Domains</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="h-4 w-[1px] bg-slate-800" />

        <div className="flex gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(prev => prev === d ? '' : d)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all duration-200 border ${
                difficulty === d
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-lg shadow-rose-500/5'
                  : 'bg-transparent text-slate-500 border-slate-800 hover:border-slate-600'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de artículos */}
      {articles.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
          <BookOpen className="w-12 h-12 opacity-10" />
          <p className="text-sm font-bold uppercase tracking-widest opacity-40">No intelligence reports found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {articles.map((a, idx) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ArticleCard article={a} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
