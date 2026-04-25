import { useState, useEffect } from 'react'
import { getUsers, createUser, updateUser, deleteUser, getCellules } from '../services/api'
import { Plus, Pencil, Trash2, Search, ShieldCheck, User, Users, Shield, X, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Loader from '../components/Loader'
import ConfirmModal from '../components/ConfirmModal'

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700',
  responsable: 'bg-purple-100 text-purple-700',
  agent: 'bg-blue-100 text-blue-700',
}

const ROLE_LABELS = { admin: 'Administrateur', responsable: 'Responsable', agent: 'Agent' }

const EMPTY_FORM = {
  username: '', email: '', password: '', password_confirm: '',
  first_name: '', last_name: '', telephone: '', role: 'agent', cellule: ''
}

const initials = (u) => {
  if (u.first_name && u.last_name) return (u.first_name[0] + u.last_name[0]).toUpperCase()
  return u.username?.[0]?.toUpperCase() || '?'
}

const avatarColor = (role) => {
  if (role === 'admin') return 'from-red-400 to-red-600'
  if (role === 'responsable') return 'from-purple-400 to-purple-600'
  return 'from-blue-400 to-blue-600'
}

export default function Utilisateurs() {
  const [users, setUsers] = useState([])
  const [cellules, setCellules] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const fetchDeps = async () => {
    try {
      setLoading(true)
      const [uRes, cRes] = await Promise.all([getUsers(), getCellules()])
      setUsers(uRes.data?.results || uRes.data || [])
      setCellules(cRes.data?.results || cRes.data || [])
    } catch { toast.error('Erreur lors du chargement') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchDeps() }, [])

  const filtered = users.filter(u =>
    (u.username || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.last_name || '').toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => { setEditingUser(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (u) => {
    setEditingUser(u)
    setForm({
      username: u.username, email: u.email || '', password: '', password_confirm: '',
      first_name: u.first_name || '', last_name: u.last_name || '',
      telephone: u.telephone || '', role: u.role || 'agent', cellule: u.cellule || ''
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form }
    if (!payload.cellule) delete payload.cellule
    if (editingUser && !payload.password) { delete payload.password; delete payload.password_confirm }
    try {
      if (editingUser) {
        await updateUser(editingUser.id, payload)
        toast.success('Utilisateur modifie !')
      } else {
        await createUser(payload)
        toast.success('Utilisateur cree !')
      }
      setModalOpen(false)
      fetchDeps()
    } catch (err) {
      const data = err.response?.data
      const msg = data ? Object.values(data).flat().join(' ') : 'Erreur de formulaire'
      toast.error(msg)
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(deleteTarget.id)
      toast.success('Utilisateur supprime')
      setDeleteTarget(null)
      fetchDeps()
    } catch { toast.error('Erreur lors de la suppression') }
  }

  const admins = users.filter(u => u.role === 'admin').length
  const responsables = users.filter(u => u.role === 'responsable').length
  const agents = users.filter(u => u.role === 'agent').length

  if (loading) return <Loader />

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Utilisateurs</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestion des comptes systeme</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Plus size={18} /> Nouvel utilisateur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center"><Users size={18} className="text-gray-600" /></div>
          <div><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold text-gray-800">{users.length}</p></div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><Shield size={18} className="text-red-600" /></div>
          <div><p className="text-xs text-gray-500">Admins</p><p className="text-xl font-bold text-gray-800">{admins}</p></div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><ShieldCheck size={18} className="text-purple-600" /></div>
          <div><p className="text-xs text-gray-500">Responsables</p><p className="text-xl font-bold text-gray-800">{responsables}</p></div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><User size={18} className="text-blue-600" /></div>
          <div><p className="text-xs text-gray-500">Agents</p><p className="text-xl font-bold text-gray-800">{agents}</p></div>
        </div>
      </div>

      {/* Search + Table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher par pseudo ou nom..."
              className="input-field pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p>Aucun utilisateur trouve</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {['Utilisateur', 'Role', 'Cellule', 'Telephone', 'Actions'].map(h => (
                    <th key={h} className="table-header text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className={"w-9 h-9 bg-gradient-to-br rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 " + avatarColor(u.role)}>
                          {initials(u)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.username}</p>
                          {(u.first_name || u.last_name) && (
                            <p className="text-xs text-gray-400">{u.first_name} {u.last_name}</p>
                          )}
                          {u.email && <p className="text-xs text-gray-400">{u.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold " + (ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600')}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-gray-600">{u.cellule_nom || '—'}</td>
                    <td className="table-cell text-sm text-gray-600">{u.telephone || '—'}</td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                        <button onClick={() => setDeleteTarget(u)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><ShieldCheck size={20} className="text-white" /></div>
                  <div>
                    <h2 className="text-white font-bold text-lg">{editingUser ? 'Modifier' : 'Nouvel'} utilisateur</h2>
                    <p className="text-slate-300 text-xs">Compte d acces au systeme</p>
                  </div>
                </div>
                <button onClick={() => setModalOpen(false)} className="text-white/70 hover:text-white"><X size={20} /></button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Identite */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><User size={13} /> Identite</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Prenom</label>
                    <input className="input-field" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} placeholder="Prenom" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                    <input className="input-field" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} placeholder="Nom" />
                  </div>
                </div>
              </div>

              {/* Compte */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><ShieldCheck size={13} /> Compte</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom d utilisateur <span className="text-red-500">*</span></label>
                    <input className="input-field" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required placeholder="username" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Role <span className="text-red-500">*</span></label>
                      <select className="input-field" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                        <option value="admin">Administrateur</option>
                        <option value="responsable">Responsable</option>
                        <option value="agent">Agent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Cellule</label>
                      <select className="input-field" value={form.cellule} onChange={e => setForm({ ...form, cellule: e.target.value })}>
                        <option value="">Aucune</option>
                        {cellules.map(c => <option key={c.id} value={c.id}>{c.nom_cellule}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <input type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemple.com" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Telephone</label>
                      <input className="input-field" value={form.telephone} onChange={e => setForm({ ...form, telephone: e.target.value })} placeholder="77 XXX XX XX" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Mot de passe */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {editingUser ? 'Changer le mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{editingUser ? 'Nouveau' : 'Mot de passe'} {!editingUser && <span className="text-red-500">*</span>}</label>
                    <input type="password" className="input-field" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editingUser} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer {!!form.password && <span className="text-red-500">*</span>}</label>
                    <input type="password" className="input-field" value={form.password_confirm} onChange={e => setForm({ ...form, password_confirm: e.target.value })} required={!!form.password} />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Annuler</button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
                  {saving ? 'Enregistrement...' : (editingUser ? 'Enregistrer' : 'Creer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={"Supprimer l utilisateur \"" + deleteTarget.username + "\" ? Cette action est irreversible."}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
