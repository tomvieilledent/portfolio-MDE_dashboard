import React, { useState } from 'react'
import { Plus, Edit2, MapPin, Calendar, Users, Search, Building2, Hash, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import CompanyModal from '../modals/CompanyModal'

const initialCompanies = [
  {
    id: 1, name: 'Tech Innovators', sector: 'Technologies', location: 'Toulouse',
    joinDate: 'Membre depuis 2024', employees: '8 employés', status: 'Active', siren: '882 345 671',
    url: 'https://www.example.com/tech-innovators',
    description: 'Startup spécialisée dans le développement de solutions SaaS pour les PME. Lauréate du prix Innovation 2025.',
    team: [
      { name: 'Alice Martin', role: 'CEO', photo: 'https://picsum.photos/seed/alice1/80' },
      { name: 'Marc Dupuis', role: 'CTO', photo: 'https://picsum.photos/seed/marc2/80' },
      { name: 'Sara Benali', role: 'Designer', photo: 'https://picsum.photos/seed/sara3/80' },
      { name: 'Tom Leroy', role: 'Dev', photo: 'https://picsum.photos/seed/tom4/80' },
    ],
  },
  {
    id: 2, name: 'Digital Solutions', sector: 'Marketing Digital', location: 'Montpellier',
    joinDate: 'Membre depuis 2025', employees: '12 employés', status: 'Active', siren: '791 234 508',
    url: 'https://www.example.com/digital-solutions',
    description: 'Agence digitale proposant des services de marketing, SEO et gestion des réseaux sociaux pour les entreprises locales.',
    team: [
      { name: 'Julie Morin', role: 'Directrice', photo: 'https://picsum.photos/seed/julie5/80' },
      { name: 'Karim Faure', role: 'Dev', photo: 'https://picsum.photos/seed/karim6/80' },
      { name: 'Léa Petit', role: 'Marketing', photo: 'https://picsum.photos/seed/lea7/80' },
    ],
  },
  {
    id: 3, name: 'Green Energy Co.', sector: 'Énergie Renouvelable', location: 'Rodez',
    joinDate: 'Membre depuis 2023', employees: '15 employés', status: 'Active', siren: '523 891 042',
    url: '',
    description: "Entreprise engagée dans la transition énergétique, spécialisée dans l'installation de panneaux solaires et la gestion de l'énergie verte.",
    team: [
      { name: 'Paul Garnier', role: 'CEO', photo: 'https://picsum.photos/seed/paul8/80' },
      { name: 'Nadia Chou', role: 'Ingénieure', photo: 'https://picsum.photos/seed/nadia9/80' },
      { name: 'Hugo Roux', role: 'Commercial', photo: 'https://picsum.photos/seed/hugo10/80' },
      { name: 'Emma Blanc', role: 'RH', photo: 'https://picsum.photos/seed/emma11/80' },
      { name: 'Yann Simon', role: 'Tech Lead', photo: 'https://picsum.photos/seed/yann12/80' },
    ],
  },
  {
    id: 4, name: 'Creative Studio', sector: 'Design & Communication', location: 'Nîmes',
    joinDate: 'Membre depuis 2025', employees: '6 employés', status: 'Active', siren: '410 673 829',
    url: 'https://www.example.com/creative-studio',
    description: 'Studio créatif offrant des services de branding, identité visuelle et production de contenus pour startups et PME.',
    team: [
      { name: 'Camille Rey', role: 'Art Director', photo: 'https://picsum.photos/seed/camille13/80' },
      { name: 'Ines Dumas', role: 'Graphiste', photo: 'https://picsum.photos/seed/ines14/80' },
    ],
  },
]

export default function Companies() {
  const [companies, setCompanies] = useState(initialCompanies)
  const [searchQuery, setSearchQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [expanded, setExpanded] = useState(new Set())

  const toggleExpand = (id) => setExpanded((prev) => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSave = (data) => {
    setCompanies((prev) => {
      const exists = prev.find((c) => c.id === data.id)
      return exists
        ? prev.map((c) => (c.id === data.id ? data : c))
        : [...prev, { team: [], ...data }]
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
          <button
            onClick={() => setModal({ mode: 'add' })}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Ajouter une entreprise
          </button>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((company) => {
            const isExpanded = expanded.has(company.id)
            const hasTeam = company.team && company.team.length > 0

            return (
              <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 size={22} className="text-orange-400" />
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
                        <p className="text-xs text-gray-500">{company.sector}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
                      ✓ Active
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
                    {company.siren && (
                      <div className="flex items-center gap-2">
                        <Hash size={15} className="text-gray-400" />
                        <span className="font-mono text-xs text-gray-500">SIREN {company.siren}</span>
                      </div>
                    )}
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
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </>
  )
}
