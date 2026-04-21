import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORS = ['#00d4ff', '#a855f7', '#f59e0b', '#22c55e', '#ef4444', '#ec4899']

export default function HoneypotChart({ data }) {
  if (!data?.length) return <div className="card flex items-center justify-center h-64 text-gray-500">Sin datos</div>

  const chartData = {
    labels: data.map(d => d.honeypot),
    datasets: [{
      data:            data.map(d => d.count),
      backgroundColor: COLORS.slice(0, data.length),
      borderColor:     'transparent',
    }],
  }

  return (
    <div className="card">
      <p className="text-sm font-semibold text-gray-300 mb-4">Ataques por honeypot</p>
      <Doughnut
        data={chartData}
        options={{
          plugins: { legend: { labels: { color: '#9ca3af', font: { size: 12 } } } },
          cutout: '65%',
        }}
      />
    </div>
  )
}
