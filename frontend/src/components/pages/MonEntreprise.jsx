import React, { useState, useEffect } from 'react'
import { Building2, MapPin, Calendar, Users, ExternalLink, ChevronDown, ChevronUp, Edit2 } from 'lucide-react'
import CompanyModal from '../modals/CompanyModal'
import { api, mediaUrl } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

// Backend company → forme attendue par le JSX.
function mapCompany(c, team = []) {
  const year = c.created_at ? new Date(c.created_at).getFullYear() : null
  const count = typeof c.employee_count === 'number' ? c.employee_count : team.length
  return {
    ...c,
    location: c.location || '—',
    joinDate: year ? `Membre depuis ${year}` : '',
    employees: `${count} membre${count > 1 ? 's' : ''}`,
    url: c.website_link || '',
    logo: mediaUrl(c.company_picture) || null,
    team,
  }
}

function mapMember(u) {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email
  return {
    name,
    role: u.is_super_admin ? 'Administrateur' : 'Membre',
    photo: mediaUrl(u.profile_picture)
      || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f8a8b&color=fff`,
  }
}

export default function MonEntreprise() {
  const { user, companyAdminId } = useAuth()
  const myCompanyId = companyAdminId || user?.company_id || null
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userEmails, setUserEmails] = useState([])
  const [teamExpanded, setTeamExpanded] = useState(true)
  const [editModal, setEditModal] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.getCompanies(), api.getUsers().catch(() => ({ users: [] }))])
      .then(([{ companies }, { users }]) => {
        if (cancelled) return
        const mine = (companies || []).find((c) => c.id === myCompanyId) || (companies || [])[0]
        setUserEmails((users || []).map((u) => u.email).filter(Boolean))
        if (!mine) { setCompany(null); return }
        const team = (users || []).filter((u) => u.company_id === mine.id).map(mapMember)
        setCompany(mapCompany(mine, team))
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [myCompanyId])

  const handleSave = async (form) => {
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
    const { company: updated } = await api.updateCompany(form.id, payload)
    setCompany((prev) => mapCompany(updated, prev?.team || []))
  }

  if (loading) return <p className="text-gray-400 py-12 text-center">Chargement de votre entreprise…</p>
  if (error) return <p className="text-red-500 py-12 text-center">{error}</p>
  if (!company) return <p className="text-gray-400 py-12 text-center">Aucune entreprise associée à votre compte.</p>

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mon entreprise</h2>
            <p className="text-sm text-gray-500 mt-1">Fiche de votre entreprise sur la pépinière</p>
          </div>
          <button
            onClick={() => setEditModal(true)}
            className="flex items-center gap-2 btn-primary text-sm"
          >
            <Edit2 size={15} /> Modifier la fiche
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fiche principale */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={28} className="text-orange-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {company.url ? (
                    <a href={company.url} target="_blank" rel="noopener noreferrer"
                      className="text-xl font-bold text-gray-900 hover:text-primary-light hover:underline flex items-center gap-1.5 group">
                      {company.name}
                      <ExternalLink size={14} className="text-primary-light opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${company.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{company.is_active ? '✓ Active' : 'Inactive'}</span>
                </div>
                {company.location && company.location !== '—' && (
                  <p className="text-sm text-gray-500 mt-0.5">{company.location}</p>
                )}
              </div>
            </div>

            {company.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-5 pb-5 border-b border-gray-100">{company.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2"><MapPin size={15} className="text-gray-400" />{company.location}</div>
              <div className="flex items-center gap-2"><Calendar size={15} className="text-gray-400" />{company.joinDate}</div>
              <div className="flex items-center gap-2"><Users size={15} className="text-gray-400" />{company.employees}</div>
            </div>
          </div>

          {/* Carte stats */}
          <div className="space-y-4">
            <div className="bg-primary-light rounded-xl p-5 text-white">
              <p className="text-3xl font-bold">{company.team.length}</p>
              <p className="text-sm opacity-80 mt-1">Membres sur la plateforme</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Statut</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${company.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                {company.is_active ? '✓ Entreprise active' : 'Entreprise désactivée'}
              </span>
            </div>
          </div>
        </div>

        {/* Équipe */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button
            onClick={() => setTeamExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-bold text-gray-900">Équipe — {company.team.length} membres</span>
            {teamExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>
          {teamExpanded && (
            <div className="px-6 pb-5 border-t border-gray-100 pt-4">
              <div className="flex flex-wrap gap-3">
                {company.team.map((member, i) => (
                  <div key={i} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                    <img src={member.photo} alt={member.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
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
      </div>

      {editModal && (
        <CompanyModal
          company={company}
          userEmails={userEmails}
          onClose={() => setEditModal(false)}
          onSave={handleSave}
        />
      )}
    </>
  )
}
