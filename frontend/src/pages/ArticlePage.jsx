import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getArticle } from '../services/api'
import ReactMarkdown from 'react-markdown'
import { ChevronLeft, BookOpen, Tag, Clock } from 'lucide-react'

const DIFFICULTY_LABELS = {
  principiante: { label: 'Novice', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  intermedio:   { label: 'Tactical', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  avanzado:     { label: 'Expert', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
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
    <div className="glass-card text-center py-20 text-slate-500">
      Packet not found. <Link to="/education" className="text-cyan-400 underline ml-2">Return to Academy</Link>
    </div>
  )

  if (!article) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
      <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Decrypting intelligence report...</p>
    </div>
  )

  const diff = DIFFICULTY_LABELS[article.difficulty] || DIFFICULTY_LABELS.principiante

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 p-2 pb-20"
    >
      <Link to="/education" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
        <ChevronLeft className="w-4 h-4" />
        Return to Academy
      </Link>

      {/* Header Section */}
      <div className="glass-card border-b-0 rounded-b-none p-10">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <span className={`badge-premium ${diff.bg} ${diff.color} ${diff.border}`}>
            {diff.label} Level
          </span>
          <span className="badge-premium bg-slate-800/50 text-slate-400 border-slate-700">
            {article.category}
          </span>
          <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest ml-auto">
            <Clock className="w-4 h-4" />
            <span>5 Minute Analysis</span>
          </div>
        </div>
        
        <h1 className="text-4xl font-display font-black text-white mb-6 tracking-tight leading-tight">
          {article.title}
        </h1>
        
        <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50">
          <p className="text-slate-400 text-sm leading-relaxed italic">
            "{article.summary}"
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="glass-card mt-0 rounded-t-none border-t-0 p-10 pt-0">
        <div className="prose prose-invert prose-slate max-w-none 
                        prose-headings:font-display prose-headings:font-bold prose-headings:text-white
                        prose-p:text-slate-300 prose-p:leading-relaxed
                        prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-white prose-strong:font-bold
                        prose-code:text-rose-400 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-2xl
                        prose-li:text-slate-300
                        prose-blockquote:border-l-cyan-500 prose-blockquote:bg-cyan-500/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-2xl">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-slate-800/50">
            <div className="flex items-center gap-2 text-slate-500 mr-2">
              <Tag className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Metadata Tags</span>
            </div>
            {article.tags.map(t => (
              <span key={t} className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-500">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center pt-8">
        <div className="flex items-center gap-3 p-4 rounded-3xl bg-slate-900/40 border border-slate-800/50">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">End of Intelligence Report</p>
        </div>
      </div>
    </motion.div>
  )
}
