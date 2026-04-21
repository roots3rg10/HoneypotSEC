import { useEffect, useState } from 'react'
import { getArticles, getCategories } from '../services/api'
import ArticleCard from '../components/Education/ArticleCard'

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
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="card bg-gradient-to-r from-dark-800 to-dark-700">
        <h2 className="text-2xl font-bold text-gray-100 mb-1">Centro Educativo</h2>
        <p className="text-gray-400">
          Aprende sobre ciberataques reales capturados por nuestros honeypots.
          Contenido pensado para todos los niveles — sin necesidad de conocimientos técnicos previos.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="bg-dark-700 border border-dark-600 text-gray-300 text-sm rounded-lg px-3 py-2"
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex gap-2">
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(prev => prev === d ? '' : d)}
              className={`badge px-3 py-1.5 cursor-pointer transition-colors ${
                difficulty === d
                  ? 'bg-accent-500 text-dark-900'
                  : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de artículos */}
      {articles.length === 0 ? (
        <div className="card text-center text-gray-500 py-12">No hay artículos con esos filtros</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {articles.map(a => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  )
}
