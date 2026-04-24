import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function DashboardCharts({ barData, doughnutData, lineData, chartOptions, cellulesValues, evolutionValues }) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Membres par cellule</h2>
          {cellulesValues.length > 0 ? (
            <Bar data={barData} options={chartOptions} />
          ) : (
            <p className="text-gray-400 text-base text-center py-8">Aucune donnée disponible</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Répartition par cellule</h2>
          {cellulesValues.length > 0 ? (
            <div className="flex justify-center">
              <div className="w-64">
                <Doughnut data={doughnutData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-base text-center py-8">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      <div className="card lg:col-span-2">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Évolution des inscriptions</h2>
        {evolutionValues.length > 0 ? (
          <Line data={lineData} options={{ ...chartOptions, plugins: { legend: { display: true } } }} />
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">Aucune donnée disponible</p>
        )}
      </div>
    </>
  )
}
