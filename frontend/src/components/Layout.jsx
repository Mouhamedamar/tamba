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
      <div className="fixed inset-0 z-0 bg-black/55" />

      {/* Sidebar */}
      <Sidebar />

      {/* Contenu principal */}
      <main className="flex-1 relative z-10 min-h-screen min-h-dvh
        pt-14 md:pt-0
        pl-0 md:pl-16 lg:pl-60">
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
