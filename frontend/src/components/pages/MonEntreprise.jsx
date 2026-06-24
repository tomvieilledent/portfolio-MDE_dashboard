import React, { useState } from 'react'
import { Building2, MapPin, Calendar, Users, Hash, ExternalLink, ChevronDown, ChevronUp, Edit2 } from 'lucide-react'
import CompanyModal from '../modals/CompanyModal'

const MY_COMPANY = {
  id: 1,
  name: 'Tech Innovators',
  sector: 'Technologies',
  location: 'Toulouse',
  joinDate: 'Membre depuis 2024',
  employees: '8 employés',
  status: 'Active',
  siren: '882 345 671',
  url: 'https://www.example.com/tech-innovators',
  description: 'Startup spécialisée dans le développement de solutions SaaS pour les PME. Lauréate du prix Innovation 2025.',
  team: [
    { name: 'Alice Martin', role: 'CEO',      photo: 'https://picsum.photos/seed/alice1/80' },
    { name: 'Marc Dupuis',  role: 'CTO',      photo: 'https://picsum.photos/seed/marc2/80' },
    { name: 'Sara Benali',  role: 'Designer', photo: 'https://picsum.photos/seed/sara3/80' },
    { name: 'Tom Leroy',    role: 'Dev',      photo: 'https://picsum.photos/seed/tom4/80' },
  ],
}

export default function MonEntreprise() {
  const [company, setCompany] = useState(MY_COMPANY)
  const [teamExpanded, setTeamExpanded] = useState(true)
  const [editModal, setEditModal] = useState(false)

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
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building2 size={28} className="text-orange-400" />
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
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">✓ Active</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{company.sector}</p>
              </div>
            </div>

            {company.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-5 pb-5 border-b border-gray-100">{company.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2"><MapPin size={15} className="text-gray-400" />{company.location}</div>
              <div className="flex items-center gap-2"><Calendar size={15} className="text-gray-400" />{company.joinDate}</div>
              <div className="flex items-center gap-2"><Users size={15} className="text-gray-400" />{company.employees}</div>
              {company.siren && (
                <div className="flex items-center gap-2"><Hash size={15} className="text-gray-400" /><span className="font-mono text-xs">SIREN {company.siren}</span></div>
              )}
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                ✓ Entreprise active
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
          onClose={() => setEditModal(false)}
          onSave={(data) => { setCompany((prev) => ({ ...prev, ...data })); setEditModal(false) }}
        />
      )}
    </>
  )
}
