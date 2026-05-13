import { Link } from 'react-router-dom'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'

const DIFFICULTY_LABELS = {
  principiante: {
    label: 'Principiante',
    color: 'var(--txt-2)',
    bg:    'var(--inset)',
    border:'var(--border)',
  },
  intermedio: {
    label: 'Intermedio',
    color: '#FBBF24',
    bg:    'rgba(251,191,36,0.08)',
    border:'rgba(251,191,36,0.2)',
  },
  avanzado: {
    label: 'Avanzado',
    color: '#fb7185',
    bg:    'rgba(251,113,133,0.08)',
    border:'rgba(251,113,133,0.2)',
  },
}

export default function ArticleCard({ article }) {
  const diff = DIFFICULTY_LABELS[article.difficulty] || DIFFICULTY_LABELS.principiante

  return (
    <Link to={`/academy/${article.slug}`} className="group block h-full">
      <div
        className="h-full flex flex-col p-7 rounded-2xl transition-all duration-200"
        style={{
          background:  'var(--surface)',
          border:      '1px solid var(--border)',
          boxShadow:   'var(--shadow)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(251,191,36,0.25)'
          e.currentTarget.style.background  = 'var(--surface-2)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.background  = 'var(--surface)'
        }}
      >
        {/* Top row: icon + difficulty badge */}
        <div className="flex items-start justify-between mb-6">
          <div
            className="p-3 rounded-2xl transition-all duration-200"
            style={{ background: 'var(--inset)', border: '1px solid var(--border)' }}
          >
            <BookOpen
              className="w-5 h-5 transition-colors duration-200 group-hover:text-amber-400"
              style={{ color: 'var(--txt-3)' }}
            />
          </div>
          <span
            className="badge-premium text-[10px]"
            style={{ color: diff.color, background: diff.bg, borderColor: diff.border }}
          >
            {diff.label}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-display font-bold text-lg mb-3 leading-tight transition-colors duration-200 group-hover:text-amber-400"
          style={{ color: 'var(--txt)' }}
        >
          {article.title}
        </h3>

        {/* Summary */}
        <p
          className="text-sm flex-1 mb-6 leading-relaxed line-clamp-3"
          style={{ color: 'var(--txt-2)' }}
        >
          {article.summary}
        </p>

        {/* Footer row */}
        <div
          className="flex items-center justify-between pt-5 mt-auto"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-4">
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--txt-3)' }}
            >
              {article.category}
            </span>
            <div
              className="flex items-center gap-1.5"
              style={{ color: 'var(--txt-4)' }}
            >
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">5 min lectura</span>
            </div>
          </div>
          <ArrowRight
            className="w-4 h-4 transition-all duration-200 group-hover:translate-x-1 group-hover:text-amber-400"
            style={{ color: 'var(--txt-3)' }}
          />
        </div>
      </div>
    </Link>
  )
}
