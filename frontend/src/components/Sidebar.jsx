import { useEffect, useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Building2, LogOut, Menu, X, ShieldAlert, Vote, Calendar } from 'lucide-react'
import { clearTokens } from '../utils/auth'
import { getMe } from '../services/api'
import logo from '../assets/logo.svg'

const baseLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/membres', label: 'Membres', icon: Users },
  { to: '/cellules', label: 'Cellules', icon: Building2 },
  { to: '/primo-votants', label: 'Primo Votants', icon: Vote },
  { to: '/activites', label: 'Activites', icon: Calendar },
]

const linkClass = (isActive) =>
  'flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-200 text-sm ' +
  (isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white')

const linkClassCompact = (isActive) =>
  'flex items-center justify-center p-3 rounded-2xl transition-all duration-200 ' +
  (isActive ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white')

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { setOpen(false) }, [location.pathname])
  useEffect(() => {
    getMe().then(res => setUserRole(res.data.role)).catch(() => {})
  }, [])

  const handleLogout = () => { clearTokens(); navigate('/login') }

  const links = [...baseLinks]
  if (userRole === 'admin') links.push({ to: '/utilisateurs', label: 'Utilisateurs', icon: ShieldAlert })

  return (
    <>
      {/* ── MOBILE : top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-gray-900/95 backdrop-blur-md flex items-center justify-between px-4 shadow-lg border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-xl p-1 flex items-center justify-center">
            <img src={logo} alt="logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-white font-bold text-sm">Tamba Politique</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-white p-2 rounded-xl hover:bg-white/10 transition-colors">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── MOBILE : overlay ── */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* ── MOBILE : drawer ── */}
      <div className={
        'md:hidden fixed top-0 left-0 h-full w-72 z-40 flex flex-col ' +
        'bg-gradient-to-b from-gray-900 to-green-900 shadow-2xl ' +
        'transform transition-transform duration-300 ease-in-out ' +
        (open ? 'translate-x-0' : '-translate-x-full')
      }>
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl p-1.5 flex items-center justify-center">
              <img src={logo} alt="logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">Tamba Politique</p>
              <p className="text-white/50 text-xs">Portail de gestion</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => linkClass(isActive)}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-6">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-white/10 text-sm font-semibold text-white hover:bg-white/20 transition-all">
            <LogOut size={18} />
            Deconnexion
          </button>
        </div>
      </div>

      {/* ── TABLETTE : sidebar compacte (icones) ── */}
      <aside className="hidden md:flex lg:hidden fixed top-0 left-0 h-full w-16 z-20 flex-col bg-gradient-to-b from-gray-900 to-green-900 border-r border-white/10">
        <div className="flex items-center justify-center py-4 border-b border-white/10">
          <div className="w-9 h-9 bg-white rounded-xl p-1.5 flex items-center justify-center">
            <img src={logo} alt="logo" className="w-full h-full object-contain" />
          </div>
        </div>
        <nav className="flex-1 flex flex-col items-center py-4 space-y-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} title={label} className={({ isActive }) => linkClassCompact(isActive)}>
              <Icon size={20} />
            </NavLink>
          ))}
        </nav>
        <div className="flex flex-col items-center pb-4">
          <button onClick={handleLogout} title="Deconnexion" className="flex items-center justify-center p-3 rounded-2xl text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ── DESKTOP : sidebar complète ── */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-60 z-20 flex-col bg-gradient-to-b from-gray-900 to-green-900 border-r border-white/10 shadow-xl">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-10 h-10 bg-white rounded-2xl p-1.5 flex items-center justify-center flex-shrink-0">
            <img src={logo} alt="logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Tamba Politique</p>
            <p className="text-white/50 text-xs">Portail de gestion</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => linkClass(isActive)}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-5">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-white/10 text-sm font-semibold text-white hover:bg-white/20 transition-all">
            <LogOut size={18} />
            Deconnexion
          </button>
        </div>
      </aside>
    </>
  )
}
