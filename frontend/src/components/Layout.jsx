import Sidebar from './Sidebar'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex min-h-screen min-h-dvh relative">

      {/* Image arriere-plan fixe */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/bg-login.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Overlay sombre pour lisibilite */}
      <div className="fixed inset-0 z-0 bg-black/55" />

      {/* Sidebar au-dessus */}
      <div className="relative z-20">
        <Sidebar />
      </div>

      {/* Contenu principal */}
      <main className={[
        "flex-1 min-h-screen min-h-dvh relative z-10",
        "pt-14",
        "md:pl-16",
        "md:pt-0",
        "lg:pl-60",
      ].join(" ")}>
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
