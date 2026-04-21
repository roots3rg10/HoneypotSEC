import { Link } from 'react-router-dom'

const DIFFICULTY_COLORS = {
  principiante: 'bg-green-500/20 text-green-300',
  intermedio:   'bg-yellow-500/20 text-yellow-300',
  avanzado:     'bg-red-500/20 text-red-300',
}

const HONEYPOT_ICONS = {
  cowrie:    '🐚',
  dionaea:   '🦠',
  honeytrap: '🕸️',
  glastopf:  '🌐',
  conpot:    '🏭',
  honeyd:    '🌐',
}

export default function ArticleCard({ article }) {
  return (
    <Link to={`/education/${article.slug}`} className="block">
      <div className="card hover:border-accent-500/50 transition-colors h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{HONEYPOT_ICONS[article.honeypot_rel] ?? '📖'}</span>
          <span className={`badge ${DIFFICULTY_COLORS[article.difficulty]}`}>
            {article.difficulty}
          </span>
        </div>

        <h3 className="font-semibold text-gray-100 mb-2 leading-snug">{article.title}</h3>
        <p className="text-gray-400 text-sm flex-1 mb-3">{article.summary}</p>

        <div className="flex flex-wrap gap-1 mt-auto">
          <span className="badge bg-dark-600 text-gray-400">{article.category}</span>
          {article.tags?.slice(0, 2).map(t => (
            <span key={t} className="badge bg-dark-700 text-gray-500">{t}</span>
          ))}
        </div>
      </div>
    </Link>
  )
}
