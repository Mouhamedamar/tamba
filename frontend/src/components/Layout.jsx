import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex min-h-screen min-h-dvh bg-slate-100">
      <Sidebar />

      {/* Contenu principal — marges adaptées par breakpoint */}
      <main className={[
        "flex-1 min-h-screen min-h-dvh",
        "pt-14",          // mobile : espace pour la top bar
        "md:pl-16",       // tablette : espace pour sidebar compacte
        "md:pt-0",        // tablette : pas de top bar
        "lg:pl-60",       // desktop : espace pour sidebar complète
      ].join(" ")}>
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
