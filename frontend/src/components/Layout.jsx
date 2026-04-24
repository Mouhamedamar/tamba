import Sidebar from './Sidebar'
import { Outlet, useLocation } from 'react-router-dom'
import logo from '../assets/logo.svg'

const pageTitles = {
  '/dashboard': 'Tableau de bord',
  '/membres': 'Membres',
  '/cellules': 'Cellules',
  '/utilisateurs': 'Utilisateurs Système',
}

export default function Layout() {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'Tableau de bord'

  return (
    <div className="flex min-h-screen relative">
      {/* Overlay to ensure readability */}
      <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-[2px] z-0 pointer-events-none" />

      <Sidebar />
      <main className="flex-1 lg:ml-72 min-h-screen relative z-10">
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md shadow-sm border-b border-slate-200/50">
          <div className="flex flex-col gap-3 px-4 py-4 md:px-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-700 font-bold">Portail administratif</p>
              <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
            </div>
            <div className="hidden md:inline-flex items-center rounded-full bg-white/50 px-5 py-2 text-sm font-medium text-emerald-800 border border-emerald-200/50 shadow-sm backdrop-blur-sm">
              Menu vertical activé
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
