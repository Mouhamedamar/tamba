import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Building2, LogOut, Menu, X,
  ShieldAlert, Vote, Calendar
} from 'lucide-react'
import { clearTokens } from '../utils/auth'
import { getMe } from '../services/api'

const baseLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/membres', label: 'Membres', icon: Users },
  { to: '/cellules', label: 'Cellules', icon: Building2 },
  { to: '/primo-votants', label: 'Primo Votants', icon: Vote },
  { to: '/activites', label: 'Activites', icon: Calendar },
]

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Ferme le drawer quand on change de page
  useEffect(() => { setOpen(false) }, [location.pathname])

  useEffect(() => {
    getMe().then((res) => setUserRole(res.data.role)).catch(() => {})
  }, [])

  const handleLogout = () => { clearTokens(); navigate('/login') }

  const links = [...baseLinks]
  if (userRole === 'admin') {
    links.push({ to: '/utilisateurs', label: 'Utilisateurs', icon: ShieldAlert })
  }

  const NavItems = ({ compact = false }) => (
    <>
      {/* Logo */}
      <div className={"flex items-center gap-3 border-b border-white/10 " + (compact ? "px-4 py-4" : "px-5 py-6")}>
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <span className="text-green-700 font-black text-sm">TP</span>
        </div>
        {!compact && (
          <div>
            <p className="text-white font-extrabold text-base leading-tight">Tamba Politique</p>
            <p className="text-green-200 text-xs">Portail de gestion</p>
          </div>
        )}
      </div>

      {!compact && (
        <div className="px-5 pt-4 pb-2">
          <p className="text-xs uppercase tracking-widest text-green-200/60 font-semibold">Menu</p>
        </div>
      )}

      {/* Nav links */}
      <nav className={"flex-1 space-y-1 " + (compact ? "px-2 py-3" : "px-3 pb-4")}>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              "flex items-center gap-3 rounded-2xl font-semibold transition-all duration-200 " +
              (compact ? "px-3 py-3 justify-center " : "px-4 py-3 ") +
              (isActive
                ? "bg-white/15 text-white shadow-sm"
                : "text-green-100 hover:bg-white/10 hover:text-white")
            }
            title={compact ? label : undefined}
          >
            <Icon size={20} className="flex-shrink-0" />
            {!compact && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className={"pb-4 " + (compact ? "px-2" : "px-3")}>
        <button onClick={handleLogout}
          className={"flex items-center gap-3 w-full rounded-2xl bg-white/10 font-semibold text-white hover:bg-white/20 transition-all duration-200 " + (compact ? "px-3 py-3 justify-center" : "px-4 py-3")}
          title={compact ? "Deconnexion" : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!compact && <span className="text-sm">Deconnexion</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* ── MOBILE top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 flex items-center justify-between px-4 py-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-xs">TP</span>
          </div>
          <span className="text-white font-bold text-sm">Tamba Politique</span>
        </div>
        <button onClick={() => setOpen(!open)}
          className="text-white p-2 rounded-xl hover:bg-white/10 transition-colors touch-btn">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── MOBILE overlay ── */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setOpen(false)} />
      )}

      {/* ── MOBILE drawer ── */}
      <div className={"lg:hidden fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-900 to-green-900 z-40 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl " +
        (open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-xs">TP</span>
            </div>
            <span className="text-white font-bold">Tamba Politique</span>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white p-1 touch-btn">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-3 py-4 space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  "flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold transition-all duration-200 text-sm " +
                  (isActive ? "bg-white/15 text-white" : "text-green-100 hover:bg-white/10 hover:text-white")
                }
              >
                <Icon size={20} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="px-3 pb-6">
            <button onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl bg-white/10 text-sm font-semibold text-white hover:bg-white/20 transition-all">
              <LogOut size={18} />
              Deconnexion
            </button>
          </div>
        </div>
      </div>

      {/* ── TABLET sidebar (compact icons) ── */}
      <aside className="hidden md:flex lg:hidden flex-col w-16 bg-gradient-to-b from-gray-900 to-green-900 min-h-screen fixed top-0 left-0 z-20 border-r border-white/10">
        <NavItems compact={true} />
      </aside>

      {/* ── DESKTOP sidebar (full) ── */}
      <aside className="hidden lg:flex flex-col w-60 bg-gradient-to-b from-gray-900 to-green-900 min-h-screen fixed top-0 left-0 z-20 border-r border-white/10 shadow-xl">
        <NavItems compact={false} />
      </aside>
    </>
  )
}
