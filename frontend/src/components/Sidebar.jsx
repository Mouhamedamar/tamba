import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Building2, LogOut, Menu, X, ShieldAlert } from 'lucide-react'
import { clearTokens } from '../utils/auth'
import { getMe } from '../services/api'
import logo from '../assets/logo.svg'

const baseLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/membres', label: 'Membres', icon: Users },
  { to: '/cellules', label: 'Cellules', icon: Building2 },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getMe()
      .then((res) => setUserRole(res.data.role))
      .catch(() => {})
  }, [])

  const handleLogout = () => {
    clearTokens()
    navigate('/login')
  }

  // Si on est admin, on ajoute l'onglet Utilisateurs
  const links = [...baseLinks]
  if (userRole === 'admin') {
    links.push({ to: '/utilisateurs', label: 'Utilisateurs System', icon: ShieldAlert })
  }

  const NavItems = () => (
    <>
      <div className="flex items-center gap-4 px-6 py-7 border-b border-white/10">
        <div className="relative rounded-[28px] bg-white p-3 shadow-[0_18px_50px_-30px_rgba(255,255,255,0.95)]">
          <img src={logo} alt="Sonko Président 2029" className="h-16 w-16 object-contain" />
          <span className="absolute -bottom-1 -right-1 inline-flex h-3 w-3 rounded-full bg-lime-400 ring-2 ring-white" />
        </div>
        <div>
          <p className="text-white font-extrabold text-lg leading-tight">Sonko Président</p>
          <p className="text-emerald-200 text-sm">Portail de gestion</p>
        </div>
      </div>

      <div className="px-6 pt-5 pb-3">
        <p className="text-xs uppercase tracking-[0.35em] text-emerald-100/70">Menu principal</p>
      </div>

      <nav className="flex-1 px-4 pb-6 space-y-2">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 rounded-3xl text-base font-semibold transition duration-200 ${
                isActive
                  ? 'bg-white/15 text-white border-l-4 border-lime-300 shadow-[0_12px_30px_-18px_rgba(255,255,255,0.35)]'
                  : 'text-emerald-100 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={20} className="text-current" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-5 py-3 rounded-3xl bg-white/10 text-base font-semibold text-white hover:bg-white/20 transition duration-200"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-4 py-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-3xl bg-white p-1 shadow-md">
            <img src={logo} alt="Sonko Président 2029" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Sonko Président</p>
            <p className="text-emerald-300 text-[11px] uppercase tracking-[0.2em]">Menu vertical</p>
          </div>
        </div>
        <button onClick={() => setOpen(!open)} className="text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 h-full w-64 bg-green-700 z-40 flex flex-col transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavItems />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-gradient-to-b from-slate-950/90 via-emerald-950/90 to-emerald-950/90 backdrop-blur-md min-h-screen fixed top-0 left-0 border-r border-white/10 shadow-[4px_0_30px_rgba(15,23,42,0.24)]">
        <NavItems />
      </aside>
    </>
  )
}
