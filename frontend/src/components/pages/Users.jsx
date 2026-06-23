import React, { useState, useEffect } from 'react'
import { Search, Mail, Phone, MessageCircle, UserPlus, UserX, KeyRound, X, Loader2 } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

// Backend : {id, email, first_name, last_name, phone, profile_picture,
// is_super_admin, company_id, ...}. On dérive name/role/initiales.
function mapUser(u, companyById) {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email
  const initials = (u.first_name || u.last_name)
    ? [u.first_name, u.last_name].filter(Boolean).map((p) => p[0]).join('').toUpperCase()
    : (u.email || '?').slice(0, 2).toUpperCase()
  return {
    id: u.id,
    name,
    role: u.is_super_admin ? 'Administrateur' : 'Membre',
    company: companyById[u.company_id] || '',
    email: u.email,
    phone: u.phone || '',
    avatar: initials,
    photo: u.profile_picture || null,
  }
}

// Modal admin : création d'utilisateur ou réinitialisation de mot de passe.
function AdminUserModal({ mode, user, onClose, onDone }) {
  const isCreate = mode === 'create'
  const [form, setForm] = useState({ email: '', password: '', first_name: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (isCreate) {
        await api.createUser({ email: form.email, password: form.password, first_name: form.first_name })
      } else {
        await api.resetUserPassword(user.id, form.password)
      }
      onDone()
    } catch (err) {
      setError(err.message || 'Échec de l\'opération')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-primary-light px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              {isCreate ? <UserPlus size={20} className="text-white" /> : <KeyRound size={20} className="text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{isCreate ? 'Créer un utilisateur' : 'Réinitialiser le mot de passe'}</h2>
              <p className="text-sm text-white/80">{isCreate ? 'Nouveau compte professionnel' : user?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">{error}</p>}

          {isCreate && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                <input required type="email" placeholder="prenom@exemple.fr" value={form.email} onChange={set('email')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                <input type="text" placeholder="Jean" value={form.first_name} onChange={set('first_name')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {isCreate ? 'Mot de passe *' : 'Nouveau mot de passe *'}
            </label>
            <input required type="password" minLength={8} placeholder="Au moins 8 caractères" value={form.password} onChange={set('password')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={submitting}
              className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition-colors text-sm disabled:opacity-60">
              Annuler
            </button>
            <button type="submit" disabled={submitting}
              className="flex-1 bg-primary-light hover:bg-primary text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {submitting ? 'En cours…' : isCreate ? 'Créer' : 'Réinitialiser'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Users({ onContact }) {
  const { role } = useAuth()
  const isAdmin = role === 'admin'
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [adminModal, setAdminModal] = useState(null) // null | {mode:'create'} | {mode:'reset', user}
  const [busyId, setBusyId] = useState(null)          // user en cours de désactivation

  const loadUsers = () => {
    setLoading(true)
    return Promise.all([api.getUsers(), api.getCompanies()])
      .then(([{ users }, { companies }]) => {
        const companyById = Object.fromEntries(companies.map((c) => [c.id, c.name]))
        setUsers(users.map((u) => mapUser(u, companyById)))
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [])

  const handleDeactivate = async (user) => {
    if (!window.confirm(`Désactiver le compte de ${user.name} ?`)) return
    setBusyId(user.id)
    try {
      await api.deactivateUser(user.id)
      await loadUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.company || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Professionnels</h2>
          <p className="text-sm text-gray-500 mt-1">Répertoire des professionnels de la pépinière</p>
        </div>
        {isAdmin && (
          <button onClick={() => setAdminModal({ mode: 'create' })} className="btn-primary flex items-center gap-2 flex-shrink-0">
            <UserPlus size={18} />
            Créer un utilisateur
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom ou entreprise..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-white"
        />
      </div>

      {loading && <p className="text-gray-400 py-8 text-center">Chargement des professionnels…</p>}
      {error && <p className="text-red-500 py-8 text-center">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((user) => (
          <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            {user.photo ? (
              <img
                src={user.photo}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-gray-100 shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-full mb-3 border-2 border-gray-100 shadow-sm bg-primary-light flex items-center justify-center text-white text-xl font-bold">
                {user.avatar}
              </div>
            )}
            <h3 className="font-bold text-gray-900 text-base">{user.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{user.role}</p>
            <p className="text-xs font-medium text-primary-light mt-1 mb-4">{user.company}</p>

            <div className="w-full space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4 mb-4">
              <div className="flex items-center gap-2 justify-center">
                <Mail size={14} className="text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Phone size={14} className="text-gray-400" />
                <span>{user.phone}</span>
              </div>
            </div>

            <button
              onClick={() => onContact?.(user.name)}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              Contacter
            </button>

            {isAdmin && (
              <div className="w-full grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => setAdminModal({ mode: 'reset', user })}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-lg transition-colors"
                >
                  <KeyRound size={14} /> Mot de passe
                </button>
                <button
                  onClick={() => handleDeactivate(user)}
                  disabled={busyId === user.id}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {busyId === user.id ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />} Désactiver
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-400">Aucun professionnel ne correspond à votre recherche</p>
        </div>
      )}

      {adminModal && (
        <AdminUserModal
          mode={adminModal.mode}
          user={adminModal.user}
          onClose={() => setAdminModal(null)}
          onDone={() => { setAdminModal(null); loadUsers() }}
        />
      )}
    </div>
  )
}
