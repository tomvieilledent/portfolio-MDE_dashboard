import React, { useState } from 'react'
import { Plus, Edit2, MapPin, Calendar, Users, Search, Building2 } from 'lucide-react'
import CompanyModal from '../modals/CompanyModal'

const initialCompanies = [
  { id: 1, name: 'Tech Innovators', sector: 'Technologies', location: 'Paris', joinDate: 'Membre depuis 2024', employees: '8 employés', status: 'Active' },
  { id: 2, name: 'Digital Solutions', sector: 'Marketing Digital', location: 'Lyon', joinDate: 'Membre depuis 2025', employees: '12 employés', status: 'Active' },
  { id: 3, name: 'Green Energy Co.', sector: 'Énergie Renouvelable', location: 'Nantes', joinDate: 'Membre depuis 2023', employees: '15 employés', status: 'Active' },
  { id: 4, name: 'Creative Studio', sector: 'Design & Communication', location: 'Bordeaux', joinDate: 'Membre depuis 2025', employees: '6 employés', status: 'Active' },
]

export default function Companies() {
  const [companies, setCompanies] = useState(initialCompanies)
  const [searchQuery, setSearchQuery] = useState('')
  const [modal, setModal] = useState(null) // null | { mode: 'add' } | { mode: 'edit', company }

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
        : [...prev, data]
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
          {filtered.map((company) => (
            <div key={company.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Building2 size={22} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{company.name}</h3>
                    <p className="text-xs text-gray-500">{company.sector}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
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
              </div>

              <button
                onClick={() => setModal({ mode: 'edit', company })}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                Modifier la fiche
              </button>
            </div>
          ))}
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
