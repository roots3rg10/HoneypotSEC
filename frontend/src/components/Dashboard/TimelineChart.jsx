import { Line } from 'react-chartjs-2'
import { Activity, TrendingUp } from 'lucide-react'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function TimelineChart({ data }) {
  if (!data?.length) return (
    <div className="glass-card flex flex-col items-center justify-center h-56 gap-3"
      style={{ color: 'rgba(255,255,255,0.2)' }}>
      <Activity className="w-7 h-7 opacity-20" />
      <p className="text-[10px] font-bold uppercase tracking-widest">Sin datos de actividad disponibles</p>
    </div>
  )

  const peak = Math.max(...data.map(d => d.count))

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.12)' }}>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white tracking-tight">Velocidad de amenazas</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Distribución temporal (24h)
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-display font-black text-white leading-none">{peak.toLocaleString('es-ES')}</p>
          <p className="text-[10px] font-bold uppercase tracking-tighter text-amber-400">Pico de ataques / hora</p>
        </div>
      </div>

      <div className="h-[240px]">
        <Line
          data={{
            labels: data.map(d => d.hour.slice(11, 16)),
            datasets: [{
              label: 'Hits',
              data:  data.map(d => d.count),
              borderColor: '#FBBF24',
              backgroundColor: (ctx) => {
                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 240)
                gradient.addColorStop(0,   'rgba(251,191,36,0.2)')
                gradient.addColorStop(0.6, 'rgba(251,191,36,0.04)')
                gradient.addColorStop(1,   'rgba(0,0,0,0)')
                return gradient
              },
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: '#050505',
              pointHoverBorderColor: '#FBBF24',
              pointHoverBorderWidth: 2,
              borderWidth: 2,
            }],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            scales: {
              x: {
                ticks: { color: 'rgba(255,255,255,0.2)', maxTicksLimit: 12, font: { size: 10, weight: '600' } },
                grid: { display: false },
                border: { display: false },
              },
              y: {
                ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 10, weight: '600' }, maxTicksLimit: 5 },
                grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
                border: { display: false },
                beginAtZero: true,
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#0a0a0a',
                borderColor: 'rgba(251,191,36,0.2)',
                borderWidth: 1,
                titleFont: { family: 'Outfit', size: 12, weight: 'bold' },
                bodyFont:  { family: 'JetBrains Mono', size: 11 },
                titleColor: '#FBBF24',
                bodyColor: 'rgba(255,255,255,0.7)',
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
