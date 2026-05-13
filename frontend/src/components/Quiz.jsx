import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, RefreshCw, ChevronRight, Lock } from 'lucide-react'
import { getQuiz, submitQuiz } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Quiz({ slug }) {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [questions, setQuestions] = useState(null)
  const [answers,   setAnswers]   = useState([])
  const [result,    setResult]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [submitting,setSubmitting]= useState(false)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    getQuiz(slug)
      .then(r => {
        setQuestions(r.data)
        setAnswers(new Array(r.data.length).fill(-1))
      })
      .catch(() => setError('Quiz no disponible para este módulo.'))
      .finally(() => setLoading(false))
  }, [slug])

  function handleSelect(qIdx, optIdx) {
    if (result) return
    setAnswers(prev => prev.map((a, i) => i === qIdx ? optIdx : a))
  }

  async function handleSubmit() {
    if (answers.includes(-1)) return
    setSubmitting(true)
    try {
      const res = await submitQuiz(slug, answers)
      setResult(res.data)
    } catch {
      setError('Error al enviar el quiz. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleRetry() {
    setResult(null)
    setAnswers(new Array(questions.length).fill(-1))
  }

  if (loading) return null
  if (error)   return (
    <p className="text-center text-sm py-4" style={{ color: 'var(--txt-3)' }}>{error}</p>
  )

  const allAnswered = !answers.includes(-1)

  return (
    <div className="space-y-5">
      {/* Questions */}
      {questions.map((q, qi) => {
        const given   = answers[qi]
        const correct = result?.details[qi]?.correct_index

        return (
          <div key={q.id} className="space-y-2">
            <p className="text-sm font-semibold mb-3" style={{ color: 'var(--txt)' }}>
              <span className="font-black mr-2" style={{ color: 'var(--accent)' }}>{qi + 1}.</span>
              {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                let bg      = 'var(--inset)'
                let border  = 'var(--border)'
                let color   = isDark ? 'rgba(255,255,255,0.82)' : '#1e293b'
                let icon    = null

                if (result) {
                  if (oi === correct) {
                    bg = 'rgba(34,197,94,0.08)'; border = 'rgba(34,197,94,0.3)'; color = '#22c55e'
                    icon = <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#22c55e' }} />
                  } else if (oi === given && given !== correct) {
                    bg = 'rgba(244,63,94,0.08)'; border = 'rgba(244,63,94,0.3)'; color = '#fb7185'
                    icon = <XCircle className="w-4 h-4 shrink-0" style={{ color: '#fb7185' }} />
                  }
                } else if (given === oi) {
                  bg = 'var(--accent-dim)'; border = 'var(--accent-border)'; color = 'var(--accent)'
                }

                return (
                  <button
                    key={oi}
                    onClick={() => handleSelect(qi, oi)}
                    disabled={!!result}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all duration-150"
                    style={{ background: bg, border: `1px solid ${border}`, color }}
                  >
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 transition-colors"
                      style={{ background: border === 'var(--border)' ? 'var(--surface)' : bg, border: `1px solid ${border}`, color }}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {icon}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Submit / Result */}
      <AnimatePresence mode="wait">
        {!result ? (
          !user ? (
            <motion.div key="login-cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 p-4 rounded-xl mt-2"
              style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)' }}>
              <Lock className="w-4 h-4 shrink-0 text-amber-400" />
              <p className="text-sm flex-1" style={{ color: 'var(--txt-2)' }}>
                <a href="/login" style={{ color: '#FBBF24', fontWeight: 700 }}>Inicia sesión</a>
                {' '}para enviar tus respuestas y guardar tu resultado.
              </p>
            </motion.div>
          ) : (
          <motion.button
            key="submit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="btn-premium w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-40 mt-2"
          >
            {submitting ? 'Evaluando...' : (
              <><ChevronRight className="w-4 h-4" />Enviar respuestas</>
            )}
          </motion.button>
          )
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 text-center"
            style={{
              background: result.passed ? 'rgba(34,197,94,0.06)' : 'rgba(244,63,94,0.06)',
              border:     `1px solid ${result.passed ? 'rgba(34,197,94,0.25)' : 'rgba(244,63,94,0.25)'}`,
            }}
          >
            {result.passed
              ? <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-3" />
              : <XCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            }
            <p className="font-display font-black text-2xl mb-1" style={{ color: 'var(--txt)' }}>
              {result.score} / {result.max_score}
            </p>
            <p className="text-sm mb-4" style={{ color: result.passed ? '#22c55e' : '#fb7185' }}>
              {result.passed
                ? '¡Superado! Puntuación por encima del 70%.'
                : 'Necesitas el 70% para superar el módulo. Inténtalo de nuevo.'
              }
            </p>
            {!result.passed && (
              <button onClick={handleRetry}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
                style={{ color: 'var(--txt-3)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--txt)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--txt-3)'}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Repetir quiz
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
