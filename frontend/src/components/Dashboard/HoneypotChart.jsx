import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Layers, Target } from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { honeypotHex } from '../../constants/honeypotColors'
import { useTheme } from '../../context/ThemeContext'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function HoneypotChart({ data }) {
  const { isDark } = useTheme()

  const tooltipBg    = isDark ? '#0a0a0a' : '#ffffff'
  const tooltipBody  = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)'
  const tooltipBorder = isDark ? 'rgba(251,191,36,0.2)' : 'rgba(180,83,9,0.2)'
  const accentColor  = isDark ? '#FBBF24' : '#B45309'

  const total = (data ?? []).reduce((s, d) => s + d.count, 0)

  const options = useMemo(() => ({
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleFont: { family: 'Outfit', weight: 'bold' },
        bodyFont:  { family: 'JetBrains Mono' },
        titleColor: accentColor,
        bodyColor: tooltipBody,
        callbacks: {
          label: ctx => ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${Math.round(ctx.parsed / total * 100)}%)`
        }
      }
    },
  }), [isDark, total])

  if (!data?.length) return (
    <div className="glass-card flex flex-col items-center justify-center h-80 gap-3"
      style={{ color: 'var(--txt-3)' }}>
      <Layers className="w-7 h-7 opacity-20" />
      <p className="text-[10px] font-bold uppercase tracking-widest">Sin datos de distribución</p>
    </div>
  )

  return (
    <div className="glass-card flex flex-col">
      <div className="flex items-center gap-3 mb-7">
        <div className="p-2 rounded-lg" style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent-border)' }}>
          <Target className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h3 className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--txt)' }}>Distribución por nodo</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--txt-3)' }}>
            Tráfico por tipo de sensor
          </p>
        </div>
      </div>

      <div className="relative w-40 h-40 mx-auto mb-8 group">
        <Doughnut
          data={{
            labels: data.map(d => d.honeypot),
            datasets: [{
              data:            data.map(d => d.count),
              backgroundColor: data.map(d => honeypotHex(d.honeypot)),
              hoverOffset:     4,
              borderWidth:     0,
              borderRadius:    8,
              spacing:         2,
            }],
          }}
          options={options}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-transform group-hover:scale-105 duration-500">
          <span className="text-2xl font-display font-black tracking-tight leading-none" style={{ color: 'var(--txt)' }}>
            {total.toLocaleString()}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--txt-3)' }}>
            Total hits
          </span>
        </div>
      </div>

      <div className="space-y-3.5 overflow-y-auto max-h-[160px] pr-1 custom-scrollbar">
        {data.sort((a, b) => b.count - a.count).map((d) => {
          const color   = honeypotHex(d.honeypot)
          const percent = Math.round(d.count / total * 100)
          return (
            <div key={d.honeypot}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--txt)' }}>{d.honeypot}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-mono font-bold" style={{ color: 'var(--txt)' }}>{percent}%</span>
                  <span className="text-[10px] font-mono" style={{ color: 'var(--txt-3)' }}>
                    {d.count.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="w-full h-px rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${percent}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
