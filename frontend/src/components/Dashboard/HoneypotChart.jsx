import { Doughnut } from 'react-chartjs-2'
import { Layers, Target } from 'lucide-react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORS = ['#06b6d4', '#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#ec4899']

export default function HoneypotChart({ data }) {
  if (!data?.length) return (
    <div className="glass-card flex flex-col items-center justify-center h-80 text-slate-500 gap-3">
      <Layers className="w-8 h-8 opacity-20" />
      <p className="text-xs font-bold uppercase tracking-widest opacity-40">No distribution data</p>
    </div>
  )

  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="glass-card flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-indigo-500/10">
          <Target className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-white tracking-tight">Node Distribution</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Traffic by sensor type</p>
        </div>
      </div>

      <div className="relative w-44 h-44 mx-auto mb-10 group">
        <Doughnut
          data={{
            labels: data.map(d => d.honeypot),
            datasets: [{
              data:            data.map(d => d.count),
              backgroundColor: COLORS.slice(0, data.length),
              hoverOffset:     4,
              borderWidth:     0,
              borderRadius:    10,
              spacing:         2,
            }],
          }}
          options={{
            cutout: '82%',
            plugins: { 
              legend: { display: false }, 
              tooltip: {
                backgroundColor: 'rgba(2, 6, 23, 0.9)',
                backdropFilter: 'blur(8px)',
                titleFont: { family: 'Outfit', weight: 'bold' },
                bodyFont: { family: 'JetBrains Mono' },
                callbacks: {
                  label: ctx => ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${Math.round(ctx.parsed/total*100)}%)`
                }
              }
            },
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-transform group-hover:scale-110 duration-500">
          <span className="text-3xl font-display font-extrabold text-white tracking-tight leading-none">{total.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Hits</span>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar">
        {data.sort((a, b) => b.count - a.count).map((d, i) => {
          const color = COLORS[data.indexOf(d) % COLORS.length]
          const percent = Math.round(d.count/total*100)
          return (
            <div key={d.honeypot} className="group cursor-default">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wide group-hover:text-white transition-colors">{d.honeypot}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-mono text-white font-bold">{percent}%</span>
                  <span className="text-[10px] font-mono text-slate-500">{d.count.toLocaleString()}</span>
                </div>
              </div>
              <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
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
