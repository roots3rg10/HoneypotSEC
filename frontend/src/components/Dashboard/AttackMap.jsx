import { useEffect, useRef } from 'react'
import createGlobe from 'cobe'
import { Globe } from 'lucide-react'
import { honeypotHex, honeypotRgb } from '../../constants/honeypotColors'
import { useTheme } from '../../context/ThemeContext'

const CONTAINER_H = 364

function toMarkers(attacks) {
  return (attacks ?? [])
    .filter(a => a.latitude != null && a.longitude != null)
    .map(a => ({
      location: [a.latitude, a.longitude],
      size:     Math.min(0.05 + Math.log2(a.count + 1) * 0.015, 0.14),
      color:    honeypotRgb(a.honeypot),
    }))
}

function Legend({ attacks }) {
  const honeypots = [...new Set((attacks ?? []).map(a => a.honeypot))].sort()
  if (!honeypots.length) return null
  return (
    <div className="absolute bottom-3 left-4 flex flex-wrap gap-x-4 gap-y-1 z-10">
      {honeypots.map(hp => (
        <div key={hp} className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: honeypotHex(hp), boxShadow: `0 0 5px ${honeypotHex(hp)}99` }}
          />
          <span className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--txt-2)' }}>
            {hp}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AttackMap({ attacks }) {
  const wrapRef   = useRef(null)
  const canvasRef = useRef(null)
  const globeRef  = useRef(null)
  const rafRef    = useRef(null)
  const phiRef    = useRef(0)
  const { isDark } = useTheme()

  // Re-crear el globo cuando cambia el tema
  useEffect(() => {
    const wrap   = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    canvas.style.opacity = '0'
    const w = wrap.offsetWidth || 600

    const globe = createGlobe(canvas, {
      devicePixelRatio:  2,
      width:             w,
      height:            CONTAINER_H,
      phi:               phiRef.current,
      theta:             0.25,
      dark:              isDark ? 1 : 0,
      diffuse:           1.3,
      mapSamples:        16000,
      mapBrightness:     isDark ? 6 : 9,
      mapBaseBrightness: isDark ? 0 : 0.05,
      scale:             1.1,
      baseColor:         isDark ? [0.1, 0.1, 0.1] : [0.88, 0.92, 0.97],
      markerColor:       [0.98, 0.75, 0.14],
      glowColor:         isDark ? [0.2, 0.1, 0.01] : [0.65, 0.78, 0.92],
      markers:           toMarkers(attacks),
    })

    globeRef.current = globe
    canvas.style.opacity = '1'

    const animate = () => {
      phiRef.current += 0.004
      globe.update({ phi: phiRef.current })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafRef.current)
      globe.destroy()
      globeRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark])

  // Actualizar marcadores cuando cambian los datos
  useEffect(() => {
    if (globeRef.current && attacks?.length) {
      globeRef.current.update({ markers: toMarkers(attacks) })
    }
  }, [attacks])

  const totalCountries = new Set((attacks ?? []).map(a => a.country)).size

  return (
    <div className="glass-card p-0 overflow-hidden" style={{ height: '420px' }}>

      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between card-header"
      >
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-amber-400" />
          <h3 className="font-display font-bold text-sm tracking-widest text-white uppercase">
            Vectores de amenaza global
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"
              style={{ boxShadow: '0 0 6px rgba(251,191,36,0.6)' }}
            />
            <span className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--txt-2)' }}>
              Ataques activos
            </span>
          </div>
          <span className="badge-premium badge-amber">{totalCountries} países</span>
        </div>
      </div>

      {/* Globe */}
      <div
        ref={wrapRef}
        style={{
          height:     `${CONTAINER_H}px`,
          background: 'var(--globe-bg)',
          overflow:   'hidden',
          position:   'relative',
          transition: 'background 0.3s ease',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block', opacity: 0 }}
        />
        <Legend attacks={attacks} />
      </div>
    </div>
  )
}
