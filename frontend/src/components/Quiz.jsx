import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Award, RefreshCw, ChevronRight } from 'lucide-react'
import { getQuiz, submitQuiz } from '../services/api'

export default function Quiz({ slug }) {
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
    <p className="text-center text-sm py-4" style={{ color: 'rgba(255,255,255,0.3)' }}>{error}</p>
  )

  const allAnswered = !answers.includes(-1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Award className="w-5 h-5 text-amber-400" />
        <h2 className="font-display font-bold text-lg text-white">Pon a prueba lo aprendido</h2>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
          {questions.length} preguntas
        </span>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q, qi) => {
          const given   = answers[qi]
          const correct = result?.details[qi]?.correct_index

          return (
            <div key={q.id} className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-sm font-semibold text-white mb-4">
                <span className="text-amber-400 mr-2">{qi + 1}.</span>{q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  let bg     = 'rgba(255,255,255,0.03)'
                  let border = 'rgba(255,255,255,0.07)'
                  let color  = 'rgba(255,255,255,0.6)'
                  let icon   = null

                  if (result) {
                    if (oi === correct) {
                      bg = 'rgba(34,197,94,0.08)'; border = 'rgba(34,197,94,0.3)'; color = '#4ade80'
                      icon = <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    } else if (oi === given && given !== correct) {
                      bg = 'rgba(244,63,94,0.08)'; border = 'rgba(244,63,94,0.3)'; color = '#fb7185'
                      icon = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    }
                  } else if (given === oi) {
                    bg = 'rgba(251,191,36,0.08)'; border = 'rgba(251,191,36,0.3)'; color = '#FBBF24'
                  }

                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(qi, oi)}
                      disabled={!!result}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all"
                      style={{ background: bg, border: `1px solid ${border}`, color }}
                    >
                      <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ borderColor: border, color }}>
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
      </div>

      {/* Submit / Result */}
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.button
            key="submit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="btn-premium w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {submitting ? 'Evaluando...' : (
              <><ChevronRight className="w-4 h-4" />Enviar respuestas</>
            )}
          </motion.button>
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
            <p className="font-display font-black text-2xl text-white mb-1">
              {result.score} / {result.max_score}
            </p>
            <p className="text-sm mb-4" style={{ color: result.passed ? '#4ade80' : '#fb7185' }}>
              {result.passed
                ? '¡Superado! Puntuación por encima del 70%.'
                : `Necesitas el 70% para superar el módulo. Inténtalo de nuevo.`
              }
            </p>
            {!result.passed && (
              <button onClick={handleRetry}
                className="flex items-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
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
