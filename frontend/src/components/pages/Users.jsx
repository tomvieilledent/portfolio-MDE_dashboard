import React, { useState, useEffect } from 'react'
import { Search, Mail, Phone, MessageCircle } from 'lucide-react'
import { api } from '../../lib/api'

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

export default function Users({ onContact }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    // On charge users + companies en parallèle pour afficher le nom d'entreprise.
    Promise.all([api.getUsers(), api.getCompanies()])
      .then(([{ users }, { companies }]) => {
        if (cancelled) return
        const companyById = Object.fromEntries(companies.map((c) => [c.id, c.name]))
        setUsers(users.map((u) => mapUser(u, companyById)))
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.company || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Professionnels</h2>
        <p className="text-sm text-gray-500 mt-1">Répertoire des professionnels de la pépinière</p>
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
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Aucun professionnel ne correspond à votre recherche</p>
        </div>
      )}
    </div>
  )
}
