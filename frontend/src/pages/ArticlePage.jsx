import { useEffect, useState, createContext, useContext } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getArticle } from '../services/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronLeft, Clock, Tag, Award } from 'lucide-react'
import Quiz from '../components/Quiz'
import PublicNavbar from '../components/Layout/PublicNavbar'
import { useTheme } from '../context/ThemeContext'

const DIFFICULTY = {
  principiante: { label: 'Principiante', color: 'var(--txt-2)',  bg: 'var(--inset)',           border: 'var(--border)'             },
  intermedio:   { label: 'Intermedio',   color: '#FBBF24',       bg: 'rgba(251,191,36,0.1)',   border: 'rgba(251,191,36,0.25)'     },
  avanzado:     { label: 'Avanzado',     color: '#fb7185',       bg: 'rgba(251,113,133,0.1)',  border: 'rgba(251,113,133,0.25)'    },
}

// Callout types detected by leading emoji
const CALLOUT = {
  '💡': { label: 'Consejo',          accent: '#FBBF24', bg: 'rgba(251,191,36,0.07)',   border: 'rgba(251,191,36,0.22)'  },
  '⚠️': { label: 'Atención',         accent: '#F59E0B', bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.28)'  },
  '🔴': { label: 'Peligro',          accent: '#fb7185', bg: 'rgba(251,113,133,0.08)',  border: 'rgba(251,113,133,0.25)' },
  '✅': { label: 'Buena práctica',   accent: '#22c55e', bg: 'rgba(34,197,94,0.07)',    border: 'rgba(34,197,94,0.22)'   },
  '🎯': { label: 'Ejemplo real',     accent: '#a78bfa', bg: 'rgba(167,139,250,0.07)',  border: 'rgba(167,139,250,0.22)' },
  '📊': { label: 'Datos reales',     accent: '#60a5fa', bg: 'rgba(96,165,250,0.07)',   border: 'rgba(96,165,250,0.22)'  },
  '🔒': { label: 'Acción de equipo', accent: '#34d399', bg: 'rgba(52,211,153,0.07)',   border: 'rgba(52,211,153,0.22)'  },
}

// Utility: recursively extract all text from a React node tree
function deepText(node) {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(deepText).join('')
  if (node?.props?.children !== undefined) return deepText(node.props.children)
  return ''
}

// Context to distinguish ul vs ol inside li
const ListTypeCtx = createContext('ul')

// ── Markdown components ──────────────────────────────────────────────────────

function MdH2({ children }) {
  return (
    <div className="flex items-center gap-3 mt-10 mb-5">
      <span className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: 'var(--accent)' }} />
      <h2 className="font-display font-bold text-xl leading-snug" style={{ color: 'var(--txt)' }}>
        {children}
      </h2>
    </div>
  )
}

function MdH3({ children }) {
  return (
    <h3 className="font-display font-semibold text-base mt-7 mb-3 flex items-center gap-2" style={{ color: 'var(--txt)' }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--accent)', opacity: 0.7 }} />
      {children}
    </h3>
  )
}

function MdBlockquote({ children }) {
  const text = deepText(children)
  const emoji = Object.keys(CALLOUT).find(e => text.trimStart().startsWith(e))
  const ct = emoji ? CALLOUT[emoji] : null

  if (ct) {
    return (
      <div className="my-5 rounded-xl overflow-hidden" style={{ background: ct.bg, border: `1px solid ${ct.border}` }}>
        <div className="flex items-center gap-2 px-4 py-2" style={{ borderBottom: `1px solid ${ct.border}` }}>
          <span className="text-sm leading-none">{emoji}</span>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: ct.accent }}>
            {ct.label}
          </span>
        </div>
        <div className="px-4 py-3.5 text-sm leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-bold"
          style={{ color: 'var(--txt-2)' }}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="my-4 rounded-r-xl pl-4 pr-3 py-3 border-l-2 text-sm leading-relaxed"
      style={{ borderColor: 'var(--accent)', background: 'var(--inset)', color: 'var(--txt-2)' }}>
      {children}
    </div>
  )
}

function MdP({ children }) {
  return (
    <p className="text-sm leading-relaxed mb-4 last:mb-0" style={{ color: 'var(--txt-2)' }}>
      {children}
    </p>
  )
}

function MdStrong({ children }) {
  return <strong className="font-bold" style={{ color: 'var(--txt)' }}>{children}</strong>
}

function MdEm({ children }) {
  return <em className="italic" style={{ color: 'var(--txt-2)' }}>{children}</em>
}

function MdCode({ className, children }) {
  const isBlock = typeof children === 'string' && children.includes('\n')
  if (className || isBlock) {
    return <code className={`text-xs font-mono ${className || ''}`}>{children}</code>
  }
  return (
    <code className="text-[12px] font-mono px-1.5 py-0.5 rounded mx-px"
      style={{
        background: 'rgba(251,191,36,0.1)',
        color: 'var(--accent)',
        border: '1px solid rgba(251,191,36,0.2)',
      }}>
      {children}
    </code>
  )
}

function MdPre({ children }) {
  return (
    <div className="my-5 rounded-xl overflow-hidden" style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffbd2e' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
        <span className="ml-2 text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>terminal</span>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed" style={{ color: '#4ade80', background: 'transparent' }}>
        {children}
      </pre>
    </div>
  )
}

function MdUl({ children }) {
  return (
    <ListTypeCtx.Provider value="ul">
      <ul className="my-3 space-y-2 list-none">{children}</ul>
    </ListTypeCtx.Provider>
  )
}

function MdOl({ children }) {
  return (
    <ListTypeCtx.Provider value="ol">
      <ol className="my-3 space-y-2 list-decimal pl-5">{children}</ol>
    </ListTypeCtx.Provider>
  )
}

function MdLi({ children }) {
  const type = useContext(ListTypeCtx)
  if (type === 'ol') {
    return (
      <li className="text-sm leading-relaxed pl-1" style={{ color: 'var(--txt-2)' }}>
        {children}
      </li>
    )
  }
  return (
    <li className="flex items-start gap-2.5 text-sm leading-relaxed">
      <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
      <span className="flex-1" style={{ color: 'var(--txt-2)' }}>{children}</span>
    </li>
  )
}

function MdTable({ children }) {
  return (
    <div className="my-5 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  )
}

function MdThead({ children }) {
  return <thead style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>{children}</thead>
}

function MdTbody({ children }) {
  return <tbody>{children}</tbody>
}

function MdTr({ children }) {
  return <tr style={{ borderTop: '1px solid var(--border)' }}>{children}</tr>
}

function MdTh({ children }) {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
      style={{ color: 'var(--txt-3)' }}>
      {children}
    </th>
  )
}

function MdTd({ children }) {
  return (
    <td className="px-4 py-3 text-sm" style={{ color: 'var(--txt-2)' }}>
      {children}
    </td>
  )
}

function MdHr() {
  return <div className="my-8 h-px" style={{ background: 'var(--border)' }} />
}

const MD_COMPONENTS = {
  h2:         MdH2,
  h3:         MdH3,
  blockquote: MdBlockquote,
  p:          MdP,
  strong:     MdStrong,
  em:         MdEm,
  code:       MdCode,
  pre:        MdPre,
  ul:         MdUl,
  ol:         MdOl,
  li:         MdLi,
  table:      MdTable,
  thead:      MdThead,
  tbody:      MdTbody,
  tr:         MdTr,
  th:         MdTh,
  td:         MdTd,
  hr:         MdHr,
}

// ── Article page ─────────────────────────────────────────────────────────────

function ArticleContent({ article, slug, backTo }) {
  const diff = DIFFICULTY[article.difficulty] || DIFFICULTY.principiante
  const { isDark } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-3xl mx-auto space-y-6 pb-24"
    >
      {/* Back link */}
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest transition-colors"
        style={{ color: 'var(--txt-3)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--txt-3)'}
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a la Academia
      </Link>

      {/* Article header */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="h-1" style={{ background: 'linear-gradient(90deg, var(--accent) 0%, transparent 80%)' }} />
        <div className="px-8 pt-7 pb-8">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: diff.bg, color: diff.color, border: `1px solid ${diff.border}` }}>
              {diff.label}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{ background: 'var(--inset)', color: 'var(--txt-3)', border: '1px solid var(--border)' }}>
              {article.category}
            </span>
            <div className="ml-auto flex items-center gap-1.5" style={{ color: 'var(--txt-3)' }}>
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">5 min de lectura</span>
            </div>
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl leading-tight mb-4" style={{ color: 'var(--txt)' }}>
            {article.title}
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'var(--txt-2)' }}>
            {article.summary}
          </p>
        </div>
      </div>

      {/* Article content */}
      <div className="rounded-2xl px-8 py-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS}>
          {article.content}
        </ReactMarkdown>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-10 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            <Tag className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--txt-4)' }} />
            {article.tags.map(t => (
              <span key={t} className="px-2.5 py-1 rounded-lg text-[11px] font-mono"
                style={{ background: 'var(--inset)', border: '1px solid var(--border)', color: 'var(--txt-3)' }}>
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quiz */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 px-6 py-4" style={{ background: 'var(--card-header-bg)', borderBottom: '1px solid var(--border)' }}>
          <div className="p-1.5 rounded-lg" style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="font-display font-bold text-sm" style={{ color: 'var(--txt)' }}>Pon a prueba lo aprendido</p>
            <p className="text-xs" style={{ color: 'var(--txt-3)' }}>Completa el quiz para registrar tu progreso</p>
          </div>
        </div>
        <div className="p-6">
          <Quiz slug={slug} />
        </div>
      </div>
    </motion.div>
  )
}

export default function ArticlePage() {
  const { slug } = useParams()
  const { pathname } = useLocation()
  const isPublic = pathname.startsWith('/academy/')
  const backTo   = isPublic ? '/academy' : '/education'

  const [article, setArticle] = useState(null)
  const [error,   setError]   = useState(false)

  useEffect(() => {
    getArticle(slug).then(r => setArticle(r.data)).catch(() => setError(true))
  }, [slug])

  if (error) {
    const msg = (
      <div className="text-center py-20" style={{ color: 'var(--txt-3)' }}>
        Artículo no encontrado.{' '}
        <Link to={backTo} className="transition-colors" style={{ color: 'var(--accent)' }}>
          Volver a la Academia
        </Link>
      </div>
    )
    if (isPublic) return (
      <div className="min-h-screen" style={{ background: 'var(--bg)', transition: 'background 0.3s ease' }}>
        <PublicNavbar />
        <div className="pt-24 px-6">{msg}</div>
      </div>
    )
    return msg
  }

  if (!article) {
    const spinner = (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-9 h-9 rounded-full animate-spin"
          style={{ border: '3px solid var(--border)', borderTopColor: 'var(--accent)' }} />
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--txt-3)' }}>
          Cargando artículo...
        </p>
      </div>
    )
    if (isPublic) return (
      <div className="min-h-screen" style={{ background: 'var(--bg)', transition: 'background 0.3s ease' }}>
        <PublicNavbar />
        <div className="pt-24 px-6">{spinner}</div>
      </div>
    )
    return spinner
  }

  if (isPublic) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--txt)', transition: 'background 0.3s ease' }}>
        <PublicNavbar />
        <div className="pt-24 px-6">
          <ArticleContent article={article} slug={slug} backTo={backTo} />
        </div>
      </div>
    )
  }

  return <ArticleContent article={article} slug={slug} backTo={backTo} />
}
