import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#ec4899']

export default function HoneypotChart({ data }) {
  if (!data?.length) return (
    <div className="card flex items-center justify-center h-72 text-gray-500 text-sm">
      Sin datos todavía
    </div>
  )

  const total = data.reduce((s, d) => s + d.count, 0)

  return (
    <div className="card">
      <p className="section-title">Distribución por honeypot</p>
      <div className="relative w-48 h-48 mx-auto mb-4">
        <Doughnut
          data={{
            labels: data.map(d => d.honeypot),
            datasets: [{
              data:            data.map(d => d.count),
              backgroundColor: COLORS.slice(0, data.length),
              borderColor:     'rgba(0,0,0,0)',
              hoverBorderColor:'rgba(0,0,0,0)',
              borderWidth:     0,
            }],
          }}
          options={{
            cutout: '72%',
            plugins: { legend: { display: false }, tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${Math.round(ctx.parsed/total*100)}%)`
              }
            }},
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-gray-100 tabular-nums">{total.toLocaleString()}</span>
          <span className="text-xs text-gray-500">total</span>
        </div>
      </div>

      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={d.honeypot} className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i] }} />
            <span className="text-xs text-gray-300 capitalize flex-1">{d.honeypot}</span>
            <span className="text-xs font-mono text-gray-400 tabular-nums">{d.count.toLocaleString()}</span>
            <div className="w-16 h-1 rounded-full bg-gray-700 overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${d.count/total*100}%`, background: COLORS[i] }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
