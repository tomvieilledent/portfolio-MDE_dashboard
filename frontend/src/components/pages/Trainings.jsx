import React, { useState } from 'react'
import { Search, Clock, Calendar, GraduationCap, Users, Plus, Edit2, Bookmark, BookmarkPlus, Timer, ExternalLink, Link, X, BookOpen, Zap, Star } from 'lucide-react'
import TrainingModal from '../modals/TrainingModal'
import TrainingFormModal from '../modals/TrainingFormModal'

const FILTERS = ['Tout', 'Marketing', 'Finance', 'Management', 'Digital']

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

function LinkModal({ training, onClose, onSave }) {
  const [url, setUrl] = useState(training.url || '')
  const isValid = url === '' || url.startsWith('http://') || url.startsWith('https://')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValid) return
    onSave({ ...training, url: url.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-purple-500 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Link size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-white/70">Hyperlien</p>
              <h3 className="text-sm font-bold text-white leading-tight">{training.title}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">URL de la formation</label>
            <input
              autoFocus type="url" placeholder="https://www.exemple.com/formation"
              value={url} onChange={(e) => setUrl(e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${!isValid ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            />
            {!isValid && <p className="mt-1 text-xs text-red-500">L'URL doit commencer par https:// ou http://</p>}
            {url && isValid && (
              <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1.5 flex items-center gap-1 text-xs text-purple-500 hover:underline w-fit">
                <ExternalLink size={11} /> Tester le lien
              </a>
            )}
          </div>
          {training.url && (
            <button type="button" onClick={() => setUrl('')} className="text-xs text-red-400 hover:text-red-600 transition-colors">
              Supprimer le lien
            </button>
          )}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2 rounded-xl text-sm transition-colors">Annuler</button>
            <button type="submit" disabled={!isValid} className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-medium py-2 rounded-xl text-sm transition-colors">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Catalogue card (simplified, no enrollment) ──────────────────────────────
function CatalogueCard({ training, isAdmin, saved, onToggleSave, onEdit, onLink }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${categoryIcon[training.category]?.bg || 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
            <GraduationCap size={20} className={categoryIcon[training.category]?.text || 'text-gray-500'} />
          </div>
          <div className="flex items-center gap-1.5">
            {training.url ? (
              <a href={training.url} target="_blank" rel="noopener noreferrer"
                className="font-bold text-gray-900 hover:text-purple-600 hover:underline transition-colors flex items-center gap-1 group"
                onClick={(e) => e.stopPropagation()}>
                {training.title}
                <ExternalLink size={12} className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </a>
            ) : (
              <span className="font-bold text-gray-900">{training.title}</span>
            )}
            {isAdmin && (
              <button onClick={onLink} title={training.url ? 'Modifier le lien' : 'Ajouter un lien'}
                className={`p-1 rounded-md transition-colors flex-shrink-0 ${training.url ? 'text-purple-400 hover:bg-purple-50 hover:text-purple-600' : 'text-gray-300 hover:bg-gray-100 hover:text-gray-500'}`}>
                <Link size={13} />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[training.category] || 'bg-gray-100 text-gray-700'}`}>
            {training.category}
          </span>
          <button onClick={onToggleSave} title={saved ? 'Retirer des favoris' : 'Sauvegarder'}
            className="p-1.5 rounded-lg transition-colors hover:bg-gray-100">
            {saved ? <BookmarkPlus size={18} className="text-amber-500" /> : <Bookmark size={18} className="text-gray-300 hover:text-amber-400" />}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">{training.description}</p>

      <div className="flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" />{training.duration}</span>
        <span className="flex items-center gap-1.5"><Users size={14} className="text-gray-400" />{training.capacity} places</span>
      </div>

      {isAdmin && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors text-gray-500 hover:text-purple-500 text-xs font-medium">
            <Edit2 size={13} /> Modifier
          </button>
        </div>
      )}
    </div>
  )
}

// ── Active formation card (with enrollment) ──────────────────────────────────
function ActiveCard({ training, isAdmin, saved, onToggleSave, onEnroll, onEdit, onLink }) {
  const days = daysRemaining(training.endDate)
  const pct = Math.round((training.enrolled / training.capacity) * 100)
  const full = training.enrolled >= training.capacity
  const ended = days <= 0
  const barColor = full ? 'bg-red-400' : categoryBar[training.category] || 'bg-gray-400'

  const urgencyColor = ended
    ? 'bg-gray-100 text-gray-500'
    : days <= 7 ? 'bg-red-100 text-red-600'
    : days <= 14 ? 'bg-orange-100 text-orange-600'
    : 'bg-green-100 text-green-600'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${categoryIcon[training.category]?.bg || 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
            <GraduationCap size={20} className={categoryIcon[training.category]?.text || 'text-gray-500'} />
          </div>
          <div className="flex items-center gap-1.5">
            {training.url ? (
              <a href={training.url} target="_blank" rel="noopener noreferrer"
                className="font-bold text-gray-900 hover:text-purple-600 hover:underline transition-colors flex items-center gap-1 group"
                onClick={(e) => e.stopPropagation()}>
                {training.title}
                <ExternalLink size={12} className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </a>
            ) : (
              <span className="font-bold text-gray-900">{training.title}</span>
            )}
            {isAdmin && (
              <button onClick={onLink} title={training.url ? 'Modifier le lien' : 'Ajouter un lien'}
                className={`p-1 rounded-md transition-colors flex-shrink-0 ${training.url ? 'text-purple-400 hover:bg-purple-50 hover:text-purple-600' : 'text-gray-300 hover:bg-gray-100 hover:text-gray-500'}`}>
                <Link size={13} />
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${categoryColors[training.category] || 'bg-gray-100 text-gray-700'}`}>
            {training.category}
          </span>
          <button onClick={onToggleSave} title={saved ? 'Retirer des favoris' : 'Sauvegarder'}
            className="p-1.5 rounded-lg transition-colors hover:bg-gray-100">
            {saved ? <BookmarkPlus size={18} className="text-amber-500" /> : <Bookmark size={18} className="text-gray-300 hover:text-amber-400" />}
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">{training.description}</p>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2"><Clock size={15} className="text-gray-400" /><span>{training.duration}</span></div>
        <div className="flex items-center gap-2"><Calendar size={15} className="text-gray-400" /><span>Jusqu'au {training.endDate}</span></div>
        <div className="flex items-center gap-2">
          <Timer size={15} className="text-gray-400" />
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${urgencyColor}`}>
            {ended ? 'Inscriptions terminées' : days === 1 ? '1 jour restant pour s\'inscrire' : `${days} jours restants pour s'inscrire`}
          </span>
        </div>
      </div>

      {/* Jauge */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 text-xs text-gray-500"><Users size={13} className="text-gray-400" />Inscrits</span>
          <span className={`text-xs font-semibold ${full ? 'text-red-500' : 'text-gray-700'}`}>
            {training.enrolled} / {training.capacity}{full && ' — Complet'}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onEnroll} disabled={full || ended}
          className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
          {full ? 'Complet' : ended ? 'Terminée' : "S'inscrire"}
        </button>
        {isAdmin && (
          <button onClick={onEdit} className="p-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-gray-500 hover:text-purple-500" title="Modifier">
            <Edit2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Trainings({ isAdmin = false }) {
  const [trainings, setTrainings] = useState(initialTrainings)
  const [subTab, setSubTab] = useState('catalogue')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Tout')
  const [selectedTraining, setSelectedTraining] = useState(null)
  const [formModal, setFormModal] = useState(null)
  const [saved, setSaved] = useState(new Set())
  const [linkModal, setLinkModal] = useState(null)

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

  const handleSaveLink = (data) => {
    setTrainings((prev) => prev.map((t) => (t.id === data.id ? data : t)))
  }

  const baseFiltered = trainings.filter((t) => {
    const matchesFilter = activeFilter === 'Tout' || t.category === activeFilter
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const activeTrainings = baseFiltered.filter((t) => daysRemaining(t.endDate) > 0)
  const savedTrainings = baseFiltered.filter((t) => saved.has(t.id))

  const displayed =
    subTab === 'catalogue' ? baseFiltered :
    subTab === 'actives'   ? activeTrainings :
                             savedTrainings

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Formations</h2>
            <p className="text-sm text-gray-500 mt-1">Formations professionnelles pour entrepreneurs</p>
          </div>
          {isAdmin && (
            <button onClick={() => setFormModal({ mode: 'create' })}
              className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
              <Plus size={16} /> Créer une formation
            </button>
          )}
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setSubTab('catalogue')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              subTab === 'catalogue' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen size={15} /> Catalogue
          </button>
          <button
            onClick={() => setSubTab('actives')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              subTab === 'actives' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Zap size={15} />
            Formations actives
            {trainings.filter((t) => daysRemaining(t.endDate) > 0).length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                subTab === 'actives' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {trainings.filter((t) => daysRemaining(t.endDate) > 0).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              subTab === 'saved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Star size={15} />
            Sauvegardées
            {saved.size > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                subTab === 'saved' ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'
              }`}>
                {saved.size}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par titre ou catégorie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-white"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeFilter === f
                  ? 'bg-purple-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-500'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Cards */}
        {displayed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayed.map((training) =>
              subTab === 'actives' ? (
                <ActiveCard
                  key={training.id}
                  training={training}
                  isAdmin={isAdmin}
                  saved={saved.has(training.id)}
                  onToggleSave={() => toggleSave(training.id)}
                  onEnroll={() => setSelectedTraining(training)}
                  onEdit={() => setFormModal({ mode: 'edit', training })}
                  onLink={() => setLinkModal(training)}
                />
              ) : (
                <CatalogueCard
                  key={training.id}
                  training={training}
                  isAdmin={isAdmin}
                  saved={saved.has(training.id)}
                  onToggleSave={() => toggleSave(training.id)}
                  onEdit={() => setFormModal({ mode: 'edit', training })}
                  onLink={() => setLinkModal(training)}
                />
              )
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {subTab === 'actives'
                ? 'Aucune formation active en ce moment'
                : subTab === 'saved'
                ? 'Vous n\'avez pas encore sauvegardé de formation'
                : 'Aucune formation ne correspond à votre recherche'}
            </p>
          </div>
        )}
      </div>

      {selectedTraining && (
        <TrainingModal training={selectedTraining} onClose={() => setSelectedTraining(null)} />
      )}

      {formModal && (
        <TrainingFormModal
          training={formModal.mode === 'edit' ? formModal.training : null}
          onClose={() => setFormModal(null)}
          onSave={handleSave}
        />
      )}

      {linkModal && (
        <LinkModal training={linkModal} onClose={() => setLinkModal(null)} onSave={handleSaveLink} />
      )}
    </>
  )
}
