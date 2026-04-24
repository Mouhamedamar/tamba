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
      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center relative mb-8">
            <div className="absolute inset-0 bg-white rounded-[60px] blur-3xl opacity-50" style={{width: '180px', height: '180px', margin: 'auto'}} />
            <div className="relative w-48 h-48 bg-white rounded-[60px] shadow-[0_30px_60px_-15px_rgba(255,255,255,0.95)] p-6 border-4 border-white">
              <img src={logo} alt="Sonko Président 2029" className="h-full w-full object-contain" />
            </div>
          </div>
          <h1 className="text-white text-5xl font-black tracking-tight drop-shadow-xl">Sonko Président 2029</h1>
          <p className="text-emerald-100 text-lg mt-4 font-semibold drop-shadow">Administration des membres et cellules</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Entrez votre nom d'utilisateur"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Entrez votre mot de passe"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
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
        </div>
      </div>
    </div>
  )
}
