import { useEffect, useState, lazy, Suspense } from 'react'
import { getDashboard } from '../services/api'
import Loader from '../components/Loader'
import { Users, Building2, TrendingUp, UserCheck } from 'lucide-react'

const DashboardCharts = lazy(() => import('../components/DashboardCharts'))

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
)

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  // Backend fields: membres_par_cellule[].cellule__nom_cellule, [].count, [].cellule__couleur
  const cellulesLabels = data?.membres_par_cellule?.map((c) => c.cellule__nom_cellule || 'Sans cellule') ?? []
  const cellulesValues = data?.membres_par_cellule?.map((c) => c.count ?? 0) ?? []
  const cellulesColors = data?.membres_par_cellule?.map((c) => c.cellule__couleur || '#16a34a') ?? []

  // Backend fields: evolution_inscriptions[].date, [].count
  const evolutionLabels = data?.evolution_inscriptions?.map((e) => e.date) ?? []
  const evolutionValues = data?.evolution_inscriptions?.map((e) => e.count ?? 0) ?? []

  const barData = {
    labels: cellulesLabels,
    datasets: [{
      label: 'Membres par cellule',
      data: cellulesValues,
      backgroundColor: cellulesColors.map(color => color + 'CC'), // Ajouter opacité
      borderRadius: 6,
    }],
  }

  const doughnutData = {
    labels: cellulesLabels,
    datasets: [{
      data: cellulesValues,
      backgroundColor: cellulesColors,
      borderWidth: 2,
    }],
  }

  const lineData = {
    labels: evolutionLabels,
    datasets: [{
      label: 'Inscriptions',
      data: evolutionValues,
      borderColor: '#16a34a',
      backgroundColor: 'rgba(22, 163, 74, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#16a34a',
    }],
  }

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {data?.user_role === 'admin' ? 'Dashboard Global' : data?.user_cellule ? `Dashboard - ${data.user_cellule}` : 'Mon Dashboard'}
        </h1>
        <p className="text-gray-500 text-base mt-1">
          {data?.user_role === 'admin' ? "Vue d'ensemble de toute l'organisation" : `Bienvenue, ${data?.user_name || 'Utilisateur'}`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
        <StatCard icon={Users} label="Total membres" value={data?.total_membres} color="bg-green-600" />
        
        {data?.user_role === 'admin' && (
          <StatCard icon={Building2} label="Cellules actives" value={data?.total_cellules} color="bg-blue-500" />
        )}
        
        <StatCard icon={UserCheck} label="Membres actifs" value={data?.membres_actifs} color="bg-purple-500" />
        <StatCard icon={TrendingUp} label="Ce mois" value={data?.nouveaux_ce_mois} color="bg-orange-500" sub="inscriptions" />
        
        {/* New KPIs */}
        <StatCard icon={TrendingUp} label="Croissance" value={`${data?.growth_rate ?? 0}%`} color={data?.growth_rate > 0 ? "bg-emerald-500" : "bg-red-500"} sub="30 jours" />
        <StatCard icon={UserCheck} label="Électeurs" value={`${data?.electeurs_percent ?? 0}%`} color="bg-indigo-500" sub="avec carte" />
        <StatCard icon={TrendingUp} label="Moy. jour" value={data?.avg_daily_inscriptions} color="bg-cyan-500" sub="inscriptions" />
        {data?.user_role === 'admin' && (
          <StatCard icon={Building2} label="Completion" value={`${data?.completion_score ?? 0}%`} color="bg-amber-500" sub="données électorales" />
        )}
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card h-96" />
            <div className="card h-96" />
            <div className="card lg:col-span-2 h-96" />
          </div>
        }
      >
        <DashboardCharts
          barData={barData}
          doughnutData={doughnutData}
          lineData={lineData}
          chartOptions={chartOptions}
          cellulesValues={cellulesValues}
          evolutionValues={evolutionValues}
        />
      </Suspense>
    </div>
  )
}
