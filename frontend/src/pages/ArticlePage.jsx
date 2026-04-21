import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getArticle } from '../services/api'
import ReactMarkdown from 'react-markdown'

const DIFFICULTY_COLORS = {
  principiante: 'bg-green-500/20 text-green-300',
  intermedio:   'bg-yellow-500/20 text-yellow-300',
  avanzado:     'bg-red-500/20 text-red-300',
}

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    getArticle(slug)
      .then(r => setArticle(r.data))
      .catch(() => setError(true))
  }, [slug])

  if (error) return (
    <div className="card text-center py-16 text-gray-400">
      Artículo no encontrado. <Link to="/education" className="text-accent-500 underline">Volver</Link>
    </div>
  )

  if (!article) return <div className="card text-center py-16 text-gray-400">Cargando...</div>

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/education" className="text-accent-500 hover:underline text-sm">← Centro Educativo</Link>

      {/* Cabecera */}
      <div className="card">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`badge ${DIFFICULTY_COLORS[article.difficulty]}`}>{article.difficulty}</span>
          <span className="badge bg-dark-600 text-gray-400">{article.category}</span>
          {article.honeypot_rel && (
            <span className="badge bg-accent-500/20 text-accent-500">Honeypot: {article.honeypot_rel}</span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-100 mb-3">{article.title}</h1>
        <p className="text-gray-400">{article.summary}</p>
      </div>

      {/* Contenido */}
      <div className="card prose prose-invert prose-sm max-w-none
                      prose-headings:text-gray-100 prose-p:text-gray-300
                      prose-a:text-accent-500 prose-strong:text-gray-100
                      prose-code:text-accent-400 prose-code:bg-dark-900
                      prose-pre:bg-dark-900 prose-li:text-gray-300
                      prose-table:text-sm">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.tags.map(t => (
            <span key={t} className="badge bg-dark-700 text-gray-400">#{t}</span>
          ))}
        </div>
      )}
    </div>
  )
}
