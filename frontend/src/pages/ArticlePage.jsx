import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getArticle } from '../services/api'
import ReactMarkdown from 'react-markdown'
import { ChevronLeft, BookOpen, Tag, Clock } from 'lucide-react'

const DIFFICULTY_LABELS = {
  principiante: { label: 'Principiante', color: 'rgba(255,255,255,0.6)',  bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)'  },
  intermedio:   { label: 'Intermedio',   color: '#FBBF24',                bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)'  },
  avanzado:     { label: 'Avanzado',     color: '#fb7185',                bg: 'rgba(251,113,133,0.08)',border: 'rgba(251,113,133,0.2)' },
}

export default function ArticlePage() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    getArticle(slug).then(r => setArticle(r.data)).catch(() => setError(true))
  }, [slug])

  if (error) return (
    <div className="glass-card text-center py-20" style={{ color: 'rgba(255,255,255,0.4)' }}>
      Artículo no encontrado.{' '}
      <Link to="/education" className="text-amber-400 hover:text-amber-300 ml-2 transition-colors">
        Volver a la Academia
      </Link>
    </div>
  )

  if (!article) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4" style={{ opacity: 0.35 }}>
      <div className="w-10 h-10 rounded-full animate-spin"
        style={{ border: '3px solid rgba(251,191,36,0.15)', borderTopColor: '#FBBF24' }} />
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
        Cargando artículo...
      </p>
    </div>
  )

  const diff = DIFFICULTY_LABELS[article.difficulty] || DIFFICULTY_LABELS.principiante

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-7 p-2 pb-20">

      <Link to="/education"
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
        style={{ color: 'rgba(255,255,255,0.3)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'white'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
        <ChevronLeft className="w-4 h-4" />
        Volver a la Academia
      </Link>

      {/* Header */}
      <div className="glass-card rounded-b-none border-b-0 p-9">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="badge-premium text-[10px]"
            style={{ color: diff.color, background: diff.bg, borderColor: diff.border }}>
            Nivel {diff.label}
          </span>
          <span className="badge-premium text-[10px]"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.09)' }}>
            {article.category}
          </span>
          <div className="flex items-center gap-2 ml-auto text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            <Clock className="w-3.5 h-3.5" />
            <span>5 min lectura</span>
          </div>
        </div>
        <h1 className="text-4xl font-display font-black text-white mb-6 tracking-tight leading-tight">
          {article.title}
        </h1>
        <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
            "{article.summary}"
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="glass-card mt-0 rounded-t-none border-t-0 p-9 pt-0">
        <div className="prose prose-invert prose-slate max-w-none
                        prose-headings:font-display prose-headings:font-bold prose-headings:text-white
                        prose-p:text-slate-300 prose-p:leading-relaxed
                        prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-white
                        prose-code:text-amber-400 prose-code:bg-black prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-black prose-pre:border prose-pre:rounded-2xl
                        prose-li:text-slate-300
                        prose-blockquote:border-l-amber-400 prose-blockquote:bg-amber-400/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl"
          style={{ '--tw-prose-pre-border': 'rgba(255,255,255,0.07)' }}>
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="flex items-center gap-2 mr-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              <Tag className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Etiquetas</span>
            </div>
            {article.tags.map(t => (
              <span key={t} className="px-3 py-1 rounded-lg text-[10px] font-mono"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center pt-4">
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <BookOpen className="w-4 h-4 text-amber-400" />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Fin del artículo
          </p>
        </div>
      </div>
    </motion.div>
  )
}
