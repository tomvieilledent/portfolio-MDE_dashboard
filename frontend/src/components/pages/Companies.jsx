import React, { useState } from 'react'
import { Plus, Edit2, MapPin, Calendar, Users } from 'lucide-react'

export default function Companies() {
  const [companies, setCompanies] = useState([
    {
      id: 1,
      name: 'Tech Innovators',
      sector: 'Technologies',
      location: 'Rodez',
      joinDate: 'Membre depuis 2024',
      employees: '8 employés',
      status: 'Active',
      icon: '💼',
    },
    {
      id: 2,
      name: 'Digital Solutions',
      sector: 'Marketing Digital',
      location: 'Rodez',
      joinDate: 'Membre depuis 2025',
      employees: '12 employés',
      status: 'Active',
      icon: '💼',
    },
    {
      id: 3,
      name: 'Green Energy Co.',
      sector: 'Énergie Renouvelable',
      location: 'Rodez',
      joinDate: 'Membre depuis 2023',
      employees: '15 employés',
      status: 'Active',
      icon: '💼',
    },
    {
      id: 4,
      name: 'Creative Studio',
      sector: 'Design & Communication',
      location: 'Toulouse',
      joinDate: 'Membre depuis 2025',
      employees: '6 employés',
      status: 'Active',
      icon: '💼',
    },
  ])

  const [searchQuery, setSearchQuery] = useState('')

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      {/* Header avec titre et bouton */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Entreprises</h2>
          <p className="text-sm text-gray-600 mt-1">Gestion des entreprises de la pépinière</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Ajouter une entreprise
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom, secteur ou localisation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
        />
      </div>

      {/* Grid de cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="card hover:shadow-lg transition-shadow">
            {/* En-tête de la carte */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center text-lg">
                  {company.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{company.name}</h3>
                  <p className="text-xs text-gray-600">{company.sector}</p>
                </div>
              </div>
              <span className="badge badge-success">✓ {company.status}</span>
            </div>

            {/* Infos */}
            <div className="space-y-2 mb-4 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-500" />
                <span>{company.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span>{company.joinDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-gray-500" />
                <span>{company.employees}</span>
              </div>
            </div>

            {/* Bouton */}
            <button className="w-full btn-primary flex items-center justify-center gap-2">
              <Edit2 size={18} />
              Modifier la fiche
            </button>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucune entreprise ne correspond à votre recherche</p>
        </div>
      )}
    </div>
  )
}
