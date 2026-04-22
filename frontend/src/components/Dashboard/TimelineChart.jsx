import { Line } from 'react-chartjs-2'
import { Activity, TrendingUp } from 'lucide-react'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function TimelineChart({ data }) {
  if (!data?.length) return (
    <div className="glass-card flex flex-col items-center justify-center h-56 text-slate-500 gap-3">
      <Activity className="w-8 h-8 opacity-20" />
      <p className="text-xs font-bold uppercase tracking-widest opacity-40">No activity data available</p>
    </div>
  )

  const peak = Math.max(...data.map(d => d.count))

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <TrendingUp className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white tracking-tight">Threat Velocity</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Temporal distribution (24h)</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-display font-bold text-white leading-none">{peak.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-tighter">Peak Hits / Hour</p>
        </div>
      </div>

      <div className="h-[240px]">
        <Line
          data={{
            labels: data.map(d => d.hour.slice(11, 16)),
            datasets: [{
              label:           'Hits',
              data:            data.map(d => d.count),
              borderColor:     '#06b6d4',
              backgroundColor: (ctx) => {
                const canvas = ctx.chart.ctx
                const gradient = canvas.createLinearGradient(0, 0, 0, 240)
                gradient.addColorStop(0, 'rgba(6,182,212,0.25)')
                gradient.addColorStop(0.5, 'rgba(99,102,241,0.05)')
                gradient.addColorStop(1, 'rgba(0,0,0,0)')
                return gradient
              },
              fill:        true,
              tension:     0.45,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#06b6d4',
              pointHoverBorderWidth: 3,
              borderWidth: 3,
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
              x: {
                ticks: { color: '#64748b', maxTicksLimit: 12, font: { size: 10, weight: '600' } },
                grid: { display: false },
              },
              y: {
                ticks: { color: '#64748b', font: { size: 10, weight: '600' }, maxTicksLimit: 5 },
                grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
                beginAtZero: true,
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: 'rgba(2, 6, 23, 0.9)',
                backdropFilter: 'blur(8px)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                titleFont: { family: 'Outfit', size: 12, weight: 'bold' },
                bodyFont: { family: 'JetBrains Mono', size: 11 },
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
              },
            },
          }}
        />
      </div>
    </div>
  )
}
