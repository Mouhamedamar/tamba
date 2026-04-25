import { useEffect, useState, lazy, Suspense } from 'react'
import { getDashboard } from '../services/api'
import Loader from '../components/Loader'
import { Users, Building2, TrendingUp, UserCheck, Vote, MapPin, Award, BarChart2 } from 'lucide-react'

const DashboardCharts = lazy(() => import('../components/DashboardCharts'))

const StatCard = ({ icon: Icon, label, value, color, sub, trend }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={"w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 " + color}>
      <Icon size={22} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500 truncate">{label}</p>
      <p className="text-2xl font-black text-gray-800 leading-tight">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    {trend !== undefined && (
      <div className={"ml-auto text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 " + (trend >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
        {trend >= 0 ? "+" : ""}{trend}%
      </div>
    )}
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

  const isAdmin = data?.user_role === 'admin'
  const cellulesLabels = data?.membres_par_cellule?.map((c) => c.cellule__nom_cellule || 'Sans cellule') ?? []
  const cellulesValues = data?.membres_par_cellule?.map((c) => c.count ?? 0) ?? []
  const cellulesColors = data?.membres_par_cellule?.map((c) => c.cellule__couleur || '#16a34a') ?? []
  const evolutionLabels = data?.evolution_inscriptions?.map((e) => e.date) ?? []
  const evolutionValues = data?.evolution_inscriptions?.map((e) => e.count ?? 0) ?? []

  const barData = {
    labels: cellulesLabels,
    datasets: [{ label: 'Membres', data: cellulesValues, backgroundColor: cellulesColors.map(c => c + 'CC'), borderRadius: 8 }],
  }
  const doughnutData = {
    labels: cellulesLabels,
    datasets: [{ data: cellulesValues, backgroundColor: cellulesColors, borderWidth: 2 }],
  }
  const lineData = {
    labels: evolutionLabels,
    datasets: [{
      label: 'Inscriptions', data: evolutionValues,
      borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.08)',
      tension: 0.4, fill: true, pointBackgroundColor: '#16a34a', pointRadius: 3,
    }],
  }
  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-800">
            {isAdmin ? 'Dashboard Global' : data?.user_cellule ? "Dashboard - " + data.user_cellule : 'Mon Dashboard'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAdmin ? "Vue d ensemble de toute l organisation" : "Bienvenue, " + (data?.user_name || 'Utilisateur')}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-green-700">En direct</span>
        </div>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total membres" value={data?.total_membres} color="bg-gradient-to-br from-green-500 to-emerald-600" />
        {isAdmin && <StatCard icon={Building2} label="Cellules actives" value={data?.total_cellules} color="bg-gradient-to-br from-blue-500 to-blue-600" />}
        <StatCard icon={Vote} label="Electeurs inscrits" value={data?.electeurs_percent + "%"} color="bg-gradient-to-br from-indigo-500 to-indigo-600" sub="avec carte" />
        <StatCard icon={TrendingUp} label="Ce mois" value={data?.nouveaux_ce_mois} color="bg-gradient-to-br from-orange-500 to-orange-600" sub="nouvelles inscriptions" trend={data?.growth_rate} />
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UserCheck} label="Membres actifs" value={data?.membres_actifs} color="bg-gradient-to-br from-purple-500 to-purple-600" />
        <StatCard icon={BarChart2} label="Moy. par jour" value={data?.avg_daily_inscriptions} color="bg-gradient-to-br from-cyan-500 to-cyan-600" sub="inscriptions / jour" />
        {isAdmin && <StatCard icon={Award} label="Completion" value={data?.completion_score + "%"} color="bg-gradient-to-br from-amber-500 to-amber-600" sub="donnees electorales" />}
        {isAdmin && <StatCard icon={MapPin} label="Quartiers" value={data?.top_quartiers?.length ?? 0} color="bg-gradient-to-br from-rose-500 to-rose-600" sub="zones actives" />}
      </div>

      {/* Top quartiers */}
      {isAdmin && data?.top_quartiers?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-green-600" /> Top quartiers
          </h2>
          <div className="space-y-3">
            {data.top_quartiers.map((q, i) => {
              const max = data.top_quartiers[0]?.count || 1
              const pct = Math.round((q.count / max) * 100)
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <span className="text-sm font-medium text-gray-700 w-32 truncate">{q.quartier || 'Non renseigne'}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: pct + "%" }} />
                  </div>
                  <span className="text-xs font-bold text-gray-600 w-8 text-right">{q.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Charts */}
      <Suspense fallback={
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 h-80 animate-pulse" />
          <div className="bg-white rounded-2xl border border-gray-100 h-80 animate-pulse" />
          <div className="bg-white rounded-2xl border border-gray-100 lg:col-span-2 h-80 animate-pulse" />
        </div>
      }>
        <DashboardCharts
          barData={barData} doughnutData={doughnutData} lineData={lineData}
          chartOptions={chartOptions} cellulesValues={cellulesValues} evolutionValues={evolutionValues}
        />
      </Suspense>
    </div>
  )
}
