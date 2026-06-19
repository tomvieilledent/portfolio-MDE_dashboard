import React, { useState } from 'react'
import { Search, Clock, Calendar, GraduationCap } from 'lucide-react'
import TrainingModal from '../modals/TrainingModal'

const categoryColors = {
  Marketing: 'bg-orange-100 text-orange-700',
  Finance: 'bg-blue-100 text-blue-700',
  Management: 'bg-purple-100 text-purple-700',
  Digital: 'bg-teal-100 text-teal-700',
}

const initialTrainings = [
  { id: 1, title: 'Marketing Digital 2026', category: 'Marketing', description: 'Stratégies marketing digital pour entrepreneurs', duration: '3 jours', endDate: '15 Mai 2026' },
  { id: 2, title: 'Gestion Financière pour PME', category: 'Finance', description: 'Bases de la gestion financière pour petites entreprises', duration: '3 jours', endDate: '22 Mai 2026' },
  { id: 3, title: 'Leadership et Management', category: 'Management', description: 'Développer ses compétences en leadership', duration: '5 jours', endDate: '6 Juin 2026' },
  { id: 4, title: 'Transformation Digitale', category: 'Digital', description: "Accompagner le développement digital d'une entreprise", duration: '5 jours', endDate: '14 Juin 2026' },
]

export default function Trainings() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTraining, setSelectedTraining] = useState(null)

  const filtered = initialTrainings.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <div>
        <div className="mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Catalogue de Formations</h2>
          <p className="text-sm text-gray-500 mt-1">Formations professionnelles pour entrepreneurs</p>
        </div>

        <div className="relative mb-6 mt-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, catégorie ou niveau..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((training) => (
            <div key={training.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                    <GraduationCap size={20} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">{training.title}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ml-2 ${categoryColors[training.category] || 'bg-gray-100 text-gray-700'}`}>
                  {training.category}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-5">{training.description}</p>

              <div className="space-y-2 mb-5 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-gray-400" />
                  <span>{training.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-gray-400" />
                  <span>Jusqu'au {training.endDate}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTraining(training)}
                className="w-full btn-primary"
              >
                S'inscrire
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">Aucune formation ne correspond à votre recherche</p>
          </div>
        )}
      </div>

      {selectedTraining && (
        <TrainingModal
          training={selectedTraining}
          onClose={() => setSelectedTraining(null)}
        />
      )}
    </>
  )
}
