import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function TimelineChart({ data }) {
  if (!data?.length) return (
    <div className="card flex items-center justify-center h-48 text-gray-500 text-sm">
      Sin datos de actividad reciente
    </div>
  )

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <p className="section-title mb-0">Actividad — últimas 24 horas</p>
        <span className="text-xs text-gray-500 font-mono">
          pico: {Math.max(...data.map(d => d.count)).toLocaleString()} ataques/h
        </span>
      </div>
      <Line
        data={{
          labels: data.map(d => d.hour.slice(11, 16)),
          datasets: [{
            label:           'Ataques',
            data:            data.map(d => d.count),
            borderColor:     '#06b6d4',
            backgroundColor: (ctx) => {
              const canvas = ctx.chart.ctx
              const gradient = canvas.createLinearGradient(0, 0, 0, 180)
              gradient.addColorStop(0, 'rgba(6,182,212,0.2)')
              gradient.addColorStop(1, 'rgba(6,182,212,0)')
              return gradient
            },
            fill:        true,
            tension:     0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: '#06b6d4',
            borderWidth: 2,
          }],
        }}
        options={{
          responsive: true,
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: {
              ticks: { color: '#475569', maxTicksLimit: 12, font: { size: 11 } },
              grid: { color: 'rgba(30,37,64,0.8)', drawBorder: false },
            },
            y: {
              ticks: { color: '#475569', font: { size: 11 } },
              grid: { color: 'rgba(30,37,64,0.8)', drawBorder: false },
              beginAtZero: true,
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#111827',
              borderColor: '#1e2540',
              borderWidth: 1,
              titleColor: '#94a3b8',
              bodyColor: '#e2e8f0',
              padding: 10,
            },
          },
        }}
      />
    </div>
  )
}
