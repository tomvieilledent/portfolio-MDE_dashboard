import React, { useState } from 'react'
import { Search, Clock, Calendar, GraduationCap, Users, Plus, Edit2, Bookmark, BookmarkPlus, Timer, ExternalLink, Link } from 'lucide-react'

const frenchMonths = {
  Janvier: 0, Février: 1, Mars: 2, Avril: 3, Mai: 4, Juin: 5,
  Juillet: 6, Août: 7, Septembre: 8, Octobre: 9, Novembre: 10, Décembre: 11,
}

function daysRemaining(endDateStr) {
  const [day, month, year] = endDateStr.split(' ')
  const end = new Date(parseInt(year), frenchMonths[month], parseInt(day))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24))
}
import TrainingModal from '../modals/TrainingModal'
import TrainingFormModal from '../modals/TrainingFormModal'

const categoryColors = {
  Marketing:  'bg-orange-100 text-orange-700',
  Finance:    'bg-blue-100 text-blue-700',
  Management: 'bg-purple-100 text-purple-700',
  Digital:    'bg-teal-100 text-teal-700',
}

const categoryIcon = {
  Marketing:  { bg: 'bg-orange-100', text: 'text-orange-500' },
  Finance:    { bg: 'bg-blue-100',   text: 'text-blue-500'   },
  Management: { bg: 'bg-purple-100', text: 'text-purple-500' },
  Digital:    { bg: 'bg-teal-100',   text: 'text-teal-500'   },
}

const categoryBar = {
  Marketing:  'bg-orange-400',
  Finance:    'bg-blue-400',
  Management: 'bg-purple-400',
  Digital:    'bg-teal-400',
}

const initialTrainings = [
  { id: 1, title: 'Marketing Digital 2026', category: 'Marketing', description: 'Stratégies marketing digital pour entrepreneurs', duration: '3 jours', endDate: '30 Juin 2026', enrolled: 11, capacity: 15, url: 'https://www.mde.mr/formations/marketing-digital' },
  { id: 2, title: 'Gestion Financière pour PME', category: 'Finance', description: 'Bases de la gestion financière pour petites entreprises', duration: '3 jours', endDate: '5 Juillet 2026', enrolled: 8, capacity: 12, url: '' },
  { id: 3, title: 'Leadership et Management', category: 'Management', description: 'Développer ses compétences en leadership', duration: '5 jours', endDate: '20 Juillet 2026', enrolled: 14, capacity: 14, url: 'https://www.mde.mr/formations/leadership' },
  { id: 4, title: 'Transformation Digitale', category: 'Digital', description: "Accompagner le développement digital d'une entreprise", duration: '5 jours', endDate: '10 Août 2026', enrolled: 5, capacity: 16, url: '' },
]

export default function Trainings() {
  const [trainings, setTrainings] = useState(initialTrainings)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTraining, setSelectedTraining] = useState(null)
  const [formModal, setFormModal] = useState(null) // null | { mode: 'create' } | { mode: 'edit', training }
  const [saved, setSaved] = useState(new Set())

  const toggleSave = (id) => setSaved((prev) => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const handleSave = (data) => {
    setTrainings((prev) => {
      const exists = prev.find((t) => t.id === data.id)
      return exists ? prev.map((t) => (t.id === data.id ? data : t)) : [...prev, data]
    })
  }

  const filtered = trainings.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Catalogue de Formations</h2>
            <p className="text-sm text-gray-500 mt-1">Formations professionnelles pour entrepreneurs</p>
          </div>
          <button
            onClick={() => setFormModal({ mode: 'create' })}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Plus size={16} />
            Créer une formation
          </button>
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
                  <div className={`w-10 h-10 ${categoryIcon[training.category]?.bg || 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
                    <GraduationCap size={20} className={categoryIcon[training.category]?.text || 'text-gray-500'} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {training.url ? (
                      <a
                        href={training.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-gray-900 hover:text-purple-600 hover:underline transition-colors flex items-center gap-1.5 group"
                        title={training.url}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {training.title}
                        <ExternalLink size={13} className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="font-bold text-gray-900 flex items-center gap-1.5">
                        {training.title}
                        <Link size={13} className="text-gray-300 flex-shrink-0" title="Aucun lien — cliquez sur Modifier pour en ajouter un" />
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[training.category] || 'bg-gray-100 text-gray-700'}`}>
                    {training.category}
                  </span>
                  <button
                    onClick={() => toggleSave(training.id)}
                    title={saved.has(training.id) ? 'Retirer des favoris' : 'Sauvegarder'}
                    className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
                  >
                    {saved.has(training.id)
                      ? <BookmarkPlus size={18} className="text-amber-500" />
                      : <Bookmark size={18} className="text-gray-300 hover:text-amber-400" />
                    }
                  </button>
                </div>
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
                {(() => {
                  const days = daysRemaining(training.endDate)
                  if (days <= 0) {
                    return (
                      <div className="flex items-center gap-2">
                        <Timer size={15} className="text-gray-400" />
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Inscriptions terminées</span>
                      </div>
                    )
                  }
                  const color = days <= 7
                    ? 'bg-red-100 text-red-600'
                    : days <= 14
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-green-100 text-green-600'
                  return (
                    <div className="flex items-center gap-2">
                      <Timer size={15} className="text-gray-400" />
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
                        {days === 1 ? '1 jour restant' : `${days} jours restants`} pour s'inscrire
                      </span>
                    </div>
                  )
                })()}
              </div>

              {/* Jauge d'inscrits */}
              {(() => {
                const pct = Math.round((training.enrolled / training.capacity) * 100)
                const full = training.enrolled >= training.capacity
                const barColor = full ? 'bg-red-400' : categoryBar[training.category] || 'bg-gray-400'
                return (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users size={13} className="text-gray-400" />
                        Inscrits
                      </span>
                      <span className={`text-xs font-semibold ${full ? 'text-red-500' : 'text-gray-700'}`}>
                        {training.enrolled} / {training.capacity}
                        {full && ' — Complet'}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })()}

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTraining(training)}
                  disabled={training.enrolled >= training.capacity}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {training.enrolled >= training.capacity ? 'Complet' : "S'inscrire"}
                </button>
                <button
                  onClick={() => setFormModal({ mode: 'edit', training })}
                  className="p-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-gray-500 hover:text-purple-500"
                  title="Modifier la formation"
                >
                  <Edit2 size={16} />
                </button>
              </div>
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

      {formModal && (
        <TrainingFormModal
          training={formModal.mode === 'edit' ? formModal.training : null}
          onClose={() => setFormModal(null)}
          onSave={handleSave}
        />
      )}
    </>
  )
}
