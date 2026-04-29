import { Doughnut } from 'react-chartjs-2'
import { Layers, Target } from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORS = ['#FBBF24', '#F59E0B', '#D97706', '#ffffff', '#9ca3af', '#6b7280']

export default function HoneypotChart({ data }) {
  if (!data?.length) return (
    <div className="glass-card flex flex-col items-center justify-center h-80 gap-3"
      style={{ color: 'rgba(255,255,255,0.2)' }}>
      <Layers className="w-7 h-7 opacity-20" />
      <p className="text-[10px] font-bold uppercase tracking-widest">Sin datos de distribución</p>
    </div>
  )

  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="glass-card flex flex-col">
      <div className="flex items-center gap-3 mb-7">
        <div className="p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.12)' }}>
          <Target className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-white tracking-tight">Distribución por nodo</h3>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
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
              backgroundColor: COLORS.slice(0, data.length),
              hoverOffset:     4,
              borderWidth:     0,
              borderRadius:    8,
              spacing:         2,
            }],
          }}
          options={{
            cutout: '80%',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0a0a0a',
                borderColor: 'rgba(251,191,36,0.2)',
                borderWidth: 1,
                titleFont: { family: 'Outfit', weight: 'bold' },
                bodyFont:  { family: 'JetBrains Mono' },
                titleColor: '#FBBF24',
                bodyColor: 'rgba(255,255,255,0.7)',
                callbacks: {
                  label: ctx => ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${Math.round(ctx.parsed / total * 100)}%)`
                }
              }
            },
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-transform group-hover:scale-105 duration-500">
          <span className="text-2xl font-display font-black text-white tracking-tight leading-none">
            {total.toLocaleString()}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Total hits
          </span>
        </div>
      </div>

      <div className="space-y-3.5 overflow-y-auto max-h-[160px] pr-1 custom-scrollbar">
        {data.sort((a, b) => b.count - a.count).map((d) => {
          const color   = COLORS[data.indexOf(d) % COLORS.length]
          const percent = Math.round(d.count / total * 100)
          return (
            <div key={d.honeypot}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-bold text-white uppercase tracking-wide">{d.honeypot}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-mono font-bold text-white">{percent}%</span>
                  <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {d.count.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="w-full h-px rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
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
