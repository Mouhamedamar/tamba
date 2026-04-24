import { useState, useEffect } from 'react'
import { getUsers, createUser, updateUser, deleteUser, getCellules } from '../services/api'
import { Plus, Pencil, Trash2, Search, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import Loader from '../components/Loader'

export default function Utilisateurs() {
  const [users, setUsers] = useState([])
  const [cellules, setCellules] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    telephone: '',
    role: 'agent',
    cellule: ''
  })

  const fetchDeps = async () => {
    try {
      setLoading(true)
      const [uRes, cRes] = await Promise.all([
        getUsers(),
        getCellules()
      ])
      setUsers(uRes.data?.results || uRes.data || [])
      setCellules(cRes.data?.results || cRes.data || [])
    } catch (e) {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeps()
  }, [])

  const filteredUsers = users.filter(u => 
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.last_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clean payload
    const payload = { ...formData }
    if (!payload.cellule) delete payload.cellule
    if (editingUser && !payload.password) {
      delete payload.password
      delete payload.password_confirm
    }
    
    try {
      if (editingUser) {
        await updateUser(editingUser.id, payload)
        toast.success("Utilisateur modifié !")
      } else {
        await createUser(payload)
        toast.success("Utilisateur créé !")
      }
      setModalOpen(false)
      fetchDeps()
    } catch (e) {
      const msg = e.response?.data?.password?.[0] || e.response?.data?.username?.[0] || "Erreur de formulaire"
      toast.error(msg)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer définitivement cet utilisateur ?")) return
    try {
      await deleteUser(id)
      toast.success("Utilisateur supprimé")
      fetchDeps()
    } catch (e) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const openModal = (user = null) => {
    setEditingUser(user)
    if (user) {
      setFormData({
        username: user.username,
        email: user.email || '',
        password: '',
        password_confirm: '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        telephone: user.telephone || '',
        role: user.role || 'agent',
        cellule: user.cellule || ''
      })
    } else {
      setFormData({
        username: '', email: '', password: '', password_confirm: '',
        first_name: '', last_name: '', telephone: '', role: 'agent', cellule: ''
      })
    }
    setModalOpen(true)
  }

  if (loading) return <Loader />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par pseudo ou nom..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition"
        >
          <Plus size={18} />
          Nouvel Utilisateur
        </button>
      </div>

      <div className="card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900">Pseudo</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Nom Complet</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Rôle</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Cellule</th>
                <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">{u.username}</td>
                  <td className="px-6 py-4">{u.first_name} {u.last_name}</td>
                  <td className="px-6 py-4 uppercase text-xs font-bold tracking-wider text-emerald-700">{u.role}</td>
                  <td className="px-6 py-4">{u.cellule_nom || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openModal(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><ShieldCheck size={20} /></div>
              <h2 className="text-xl font-bold text-slate-800">{editingUser ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom</label>
                  <input required className="w-full px-3 py-2 border rounded-lg" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <input required className="w-full px-3 py-2 border rounded-lg" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Pseudo *</label>
                <input required className="w-full px-3 py-2 border rounded-lg" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rôle *</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="admin">Administrateur</option>
                    <option value="responsable">Responsable</option>
                    <option value="agent">Agent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Associé à la Cellule</label>
                  <select className="w-full px-3 py-2 border rounded-lg" value={formData.cellule} onChange={(e) => setFormData({...formData, cellule: e.target.value})}>
                    <option value="">Aucune</option>
                    {cellules.map(c => <option key={c.id} value={c.id}>{c.nom_cellule}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">{editingUser ? 'Nouveau mot de passe' : 'Mot de passe *'}</label>
                  <input type="password" required={!editingUser} className="w-full px-3 py-2 border rounded-lg" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Confirmer mot de passe</label>
                  <input type="password" required={!!formData.password} className="w-full px-3 py-2 border rounded-lg" value={formData.password_confirm} onChange={(e) => setFormData({...formData, password_confirm: e.target.value})} />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t mt-6">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 px-4 py-2 bg-slate-100 font-medium rounded-lg hover:bg-slate-200">Annuler</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
