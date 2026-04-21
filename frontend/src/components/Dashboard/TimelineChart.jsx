import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function TimelineChart({ data }) {
  if (!data?.length) return <div className="card flex items-center justify-center h-48 text-gray-500">Sin datos</div>

  const chartData = {
    labels: data.map(d => d.hour.slice(11, 16)),
    datasets: [{
      label:           'Ataques',
      data:            data.map(d => d.count),
      borderColor:     '#00d4ff',
      backgroundColor: 'rgba(0,212,255,0.1)',
      fill:            true,
      tension:         0.4,
      pointRadius:     3,
    }],
  }

  return (
    <div className="card">
      <p className="text-sm font-semibold text-gray-300 mb-4">Ataques últimas 24 horas</p>
      <Line
        data={chartData}
        options={{
          responsive: true,
          scales: {
            x: { ticks: { color: '#6b7280', maxTicksLimit: 12 }, grid: { color: '#1e2d4e' } },
            y: { ticks: { color: '#6b7280' }, grid: { color: '#1e2d4e' } },
          },
          plugins: { legend: { display: false } },
        }}
      />
    </div>
  )
}
