import { Link } from 'react-router-dom'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'

const DIFFICULTY_LABELS = {
  principiante: { label: 'Principiante', color: 'rgba(255,255,255,0.6)',  bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)'  },
  intermedio:   { label: 'Intermedio',   color: '#FBBF24',                bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)'  },
  avanzado:     { label: 'Avanzado',     color: '#fb7185',                bg: 'rgba(251,113,133,0.08)',border: 'rgba(251,113,133,0.2)' },
}

export default function ArticleCard({ article }) {
  const diff = DIFFICULTY_LABELS[article.difficulty] || DIFFICULTY_LABELS.principiante

  return (
    <Link to={`/education/${article.slug}`} className="group block h-full">
      <div className="h-full flex flex-col p-7 rounded-2xl transition-all duration-200"
        style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(251,191,36,0.2)'
          e.currentTarget.style.background  = 'rgba(255,255,255,0.04)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
          e.currentTarget.style.background  = 'rgba(255,255,255,0.025)'
        }}>

        <div className="flex items-start justify-between mb-6">
          <div className="p-3 rounded-2xl transition-all duration-200 group-hover:border-amber-400/20"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            ref={el => el && el.addEventListener('mouseenter', () => {
              el.style.background = 'rgba(251,191,36,0.07)'
              el.style.borderColor = 'rgba(251,191,36,0.2)'
            })}>
            <BookOpen className="w-5 h-5 transition-colors duration-200 group-hover:text-amber-400"
              style={{ color: 'rgba(255,255,255,0.35)' }} />
          </div>
          <span className="badge-premium text-[10px]"
            style={{ color: diff.color, background: diff.bg, borderColor: diff.border }}>
            {diff.label}
          </span>
        </div>

        <h3 className="font-display font-bold text-lg text-white mb-3 leading-tight transition-colors duration-200 group-hover:text-amber-400">
          {article.title}
        </h3>

        <p className="text-sm flex-1 mb-6 leading-relaxed line-clamp-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {article.summary}
        </p>

        <div className="flex items-center justify-between pt-5 mt-auto"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {article.category}
            </span>
            <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">5 min lectura</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 transition-all duration-200 group-hover:translate-x-1 group-hover:text-amber-400"
            style={{ color: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>
    </Link>
  )
}
