import React, { useState, useEffect } from 'react'
import { Plus, Edit2, MapPin, Calendar, Users, Search, Building2, ExternalLink, ChevronDown, ChevronUp, Power, Trash2, Loader2 } from 'lucide-react'
import CompanyModal from '../modals/CompanyModal'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

// Le backend renvoie {id, name, admin_email, description, location,
// website_link, company_picture, employee_count, is_active, created_at}.
function mapCompany(c) {
  const year = c.created_at ? new Date(c.created_at).getFullYear() : null
  const count = typeof c.employee_count === 'number' ? c.employee_count : 0
  return {
    ...c,
    location: c.location || '—',
    joinDate: year ? `Membre depuis ${year}` : '',
    employees: `${count} membre${count > 1 ? 's' : ''}`,
    url: c.website_link || '',
    logo: c.company_picture || null,
    team: [], // pas d'équipe exposée par le backend pour l'instant
  }
}

export default function Companies() {
  const { user, role } = useAuth()
  const isSuperAdmin = role === 'admin'
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [expanded, setExpanded] = useState(new Set())
  const [userEmails, setUserEmails] = useState([]) // pour le champ admin_email du modal
  const [busyId, setBusyId] = useState(null)        // entreprise en cours d'action

  // L'utilisateur courant est-il l'admin de cette entreprise ?
  const isCompanyAdmin = (company) => {
    if (!user) return false
    if (company.admin_id && company.admin_id === user.id) return true
    const adminEmail = (company.admin_email || '').toLowerCase().trim()
    const myEmail = (user.email || '').toLowerCase().trim()
    return !!adminEmail && adminEmail === myEmail
  }

  const handleDeactivate = async (company) => {
    if (!window.confirm(`Désactiver l'entreprise « ${company.name} » ?`)) return
    setBusyId(company.id)
    try {
      const { company: updated } = await api.deactivateCompany(company.id)
      setCompanies((prev) => prev.map((c) => (c.id === updated.id ? mapCompany(updated) : c)))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (company) => {
    if (!window.confirm(`Supprimer définitivement « ${company.name} » ? Cette action est irréversible.`)) return
    setBusyId(company.id)
    try {
      await api.deleteCompany(company.id)
      setCompanies((prev) => prev.filter((c) => c.id !== company.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const toggleExpand = (id) => setExpanded((prev) => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  useEffect(() => {
    let cancelled = false
    // companies pour la liste, users pour proposer un admin_email valide à la création
    Promise.all([api.getCompanies(), api.getUsers().catch(() => ({ users: [] }))])
      .then(([{ companies }, { users }]) => {
        if (cancelled) return
        setCompanies(companies.map(mapCompany))
        setUserEmails(users.map((u) => u.email).filter(Boolean))
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.sector || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Création / édition persistées via l'API. Avec un logo on envoie un
  // multipart (company_picture_file), sinon du JSON.
  const handleSave = async (form) => {
    const isEdit = typeof form.id === 'string'
    let payload
    if (form.logoFile) {
      payload = new FormData()
      payload.append('name', form.name)
      payload.append('description', form.description || '')
      payload.append('location', form.location || '')
      payload.append('website_link', form.url || '')
      if (form.admin_email) payload.append('admin_email', form.admin_email)
      payload.append('company_picture_file', form.logoFile)
    } else {
      payload = {
        name: form.name,
        description: form.description || null,
        location: form.location || null,
        website_link: form.url || null,
      }
      if (form.admin_email) payload.admin_email = form.admin_email
    }

    const { company } = isEdit
      ? await api.updateCompany(form.id, payload)
      : await api.createCompany(payload)
    const saved = mapCompany(company)

    setCompanies((prev) => {
      const exists = prev.some((c) => c.id === saved.id)
      return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev]
    })
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Entreprises</h2>
            <p className="text-sm text-gray-500 mt-1">Gestion des entreprises de la pépinière</p>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => setModal({ mode: 'add' })}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Ajouter une entreprise
            </button>
          )}
        </div>

        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, secteur ou localisation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-white"
          />
        </div>

        {loading && <p className="text-gray-400 py-8 text-center">Chargement des entreprises…</p>}
        {error && <p className="text-red-500 py-8 text-center">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((company) => {
            const isExpanded = expanded.has(company.id)
            const hasTeam = company.team && company.team.length > 0
            const canDeactivate = isSuperAdmin || isCompanyAdmin(company)
            const canDelete = isSuperAdmin
            const busy = busyId === company.id

            return (
              <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                        ) : (
                          <Building2 size={22} className="text-orange-400" />
                        )}
                      </div>
                      <div>
                        {company.url ? (
                          <a
                            href={company.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-gray-900 hover:text-primary-light hover:underline transition-colors flex items-center gap-1 group"
                          >
                            {company.name}
                            <ExternalLink size={13} className="text-primary-light opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ) : (
                          <h3 className="font-bold text-gray-900">{company.name}</h3>
                        )}
                        {company.location && company.location !== '—' && (
                          <p className="text-xs text-gray-500">{company.location}</p>
                        )}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${company.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                      {company.is_active ? '✓ Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-gray-400" />
                      <span>{company.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={15} className="text-gray-400" />
                      <span>{company.joinDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={15} className="text-gray-400" />
                      <span>{company.employees}</span>
                    </div>
                  </div>

                  {company.description && (
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">{company.description}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => setModal({ mode: 'edit', company })}
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      Modifier la fiche
                    </button>
                    {hasTeam && (
                      <button
                        onClick={() => toggleExpand(company.id)}
                        title={isExpanded ? "Masquer l'équipe" : "Voir l'équipe"}
                        className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl transition-colors"
                      >
                        <Users size={15} />
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    )}
                  </div>

                  {/* Actions de gestion : désactivation (super admin ou admin de
                      l'entreprise) et suppression définitive (super admin). */}
                  {(canDeactivate || canDelete) && (
                    <div className="flex gap-2 mt-2">
                      {canDeactivate && company.is_active && (
                        <button
                          onClick={() => handleDeactivate(company)}
                          disabled={busy}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {busy ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />} Désactiver
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(company)}
                          disabled={busy}
                          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-red-200 text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Supprimer
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Dépliant équipe */}
                {hasTeam && isExpanded && (
                  <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Équipe — {company.team.length} membre{company.team.length > 1 ? 's' : ''}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {company.team.map((member, i) => (
                        <div key={i} className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2 shadow-sm border border-gray-100">
                          <img
                            src={member.photo}
                            alt={member.name}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">{member.name}</p>
                            <p className="text-xs text-gray-400">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">Aucune entreprise ne correspond à votre recherche</p>
          </div>
        )}
      </div>

      {modal && (
        <CompanyModal
          company={modal.mode === 'edit' ? modal.company : null}
          userEmails={userEmails}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </>
  )
}
