import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { setTokens } from '../utils/auth'
import toast from 'react-hot-toast'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import logo from '../assets/logo.svg'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await login(form)
      setTokens(data.access, data.refresh)
      toast.success('Connexion réussie !')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Identifiants incorrects'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-900 to-emerald-700 px-4">
      <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_top_left,_rgba(110,231,183,0.24),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.2),_transparent_22%)]" />

      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row items-center gap-12">

        {/* ── Partie gauche : infos ── */}
        <div className="hidden lg:flex flex-col flex-1 text-white space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-white/80">Plateforme officielle PASTEF</span>
            </div>
            <h2 className="text-5xl font-black leading-tight mb-4">
              Bienvenue sur<br />
              <span className="text-green-400">PASTEF Tamba Focus</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-sm">
              La plateforme de gestion des militants, cellules et activites du PASTEF a Tambacounda.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-3xl font-black text-green-400">500+</p>
              <p className="text-white/60 text-sm mt-1">Militants enregistres</p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-3xl font-black text-green-400">12</p>
              <p className="text-white/60 text-sm mt-1">Cellules actives</p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-3xl font-black text-green-400">3</p>
              <p className="text-white/60 text-sm mt-1">Communes couvertes</p>
            </div>
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-3xl font-black text-green-400">2029</p>
              <p className="text-white/60 text-sm mt-1">Objectif presidentiel</p>
            </div>
          </div>

          {/* Valeurs */}
          <div className="space-y-3">
            {[
              { icon: '🎯', text: 'Gestion centralisee des membres' },
              { icon: '📊', text: 'Suivi en temps reel des inscriptions' },
              { icon: '🗳️', text: 'Preparation electorale optimisee' },
              { icon: '🤝', text: 'Coordination entre cellules' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/70">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Partie droite : formulaire ── */}
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center relative mb-6">
              <div className="absolute inset-0 bg-white rounded-[60px] blur-3xl opacity-50" style={{width: '180px', height: '180px', margin: 'auto'}} />
              <div className="relative w-40 h-40 bg-white rounded-[60px] shadow-[0_30px_60px_-15px_rgba(255,255,255,0.95)] p-5 border-4 border-white">
                <img src={logo} alt="Sonko Président 2029" className="h-full w-full object-contain" />
              </div>
            </div>
            <h1 className="text-white text-4xl font-black tracking-tight drop-shadow-xl">Pastef TAMBA focus</h1>
            <p className="text-emerald-100 text-base mt-3 font-semibold drop-shadow">Administration des membres et cellules</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                <LogIn size={16} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Connexion</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all text-sm bg-gray-50"
                    placeholder="Votre identifiant"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-12 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all text-sm bg-gray-50"
                    placeholder="Votre mot de passe"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-green-500/25 hover:-translate-y-0.5 active:translate-y-0 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-gray-400 text-xs mt-6">
              Acces reserve aux membres autorises
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
