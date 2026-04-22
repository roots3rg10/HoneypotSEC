import { Link } from 'react-router-dom'
import { Shield, BookOpen, Clock, ArrowRight } from 'lucide-react'

const DIFFICULTY_LABELS = {
  principiante: { label: 'Novice', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  intermedio:   { label: 'Tactical', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  avanzado:     { label: 'Expert', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
}

const HONEYPOT_ICONS = {
  cowrie:    Shield,
  dionaea:   Shield,
  honeytrap: Shield,
  glastopf:  Shield,
  conpot:    Shield,
  honeyd:    Shield,
}

export default function ArticleCard({ article }) {
  const diff = DIFFICULTY_LABELS[article.difficulty] || DIFFICULTY_LABELS.principiante
  const Icon = HONEYPOT_ICONS[article.honeypot_rel] || BookOpen

  return (
    <Link to={`/education/${article.slug}`} className="group block h-full">
      <div className="glass-card-accent h-full flex flex-col p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="p-3 rounded-2xl bg-slate-800/50 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all duration-300">
            <Icon className="w-6 h-6" />
          </div>
          <span className={`badge-premium ${diff.bg} ${diff.color} ${diff.border}`}>
            {diff.label}
          </span>
        </div>

        <h3 className="font-display font-bold text-xl text-white mb-3 group-hover:text-cyan-400 transition-colors leading-tight">
          {article.title}
        </h3>
        
        <p className="text-sm text-slate-400 flex-1 mb-6 leading-relaxed line-clamp-3">
          {article.summary}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-slate-800/50 mt-auto">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{article.category}</span>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">5 min read</span>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  )
}
