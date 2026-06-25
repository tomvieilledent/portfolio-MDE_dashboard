import React, { useState, useEffect } from 'react'
import { Search, Clock, Calendar, GraduationCap, Users, Plus, Edit2, Bookmark, BookmarkPlus, Timer, ExternalLink, Link, X, BookOpen, Zap, Star, CalendarClock, MapPin } from 'lucide-react'
import TrainingModal from '../modals/TrainingModal'
import TrainingFormModal from '../modals/TrainingFormModal'
import SessionFormModal from '../modals/SessionFormModal'
import { api } from '../../lib/api'

const FILTERS = ['Tout', 'Marketing', 'Finance', 'Management', 'Digital']

const frenchMonths = {
  Janvier: 0, Février: 1, Mars: 2, Avril: 3, Mai: 4, Juin: 5,
  Juillet: 6, Août: 7, Septembre: 8, Octobre: 9, Novembre: 10, Décembre: 11,
}

// Le backend ne stocke que {id, title, description, company_id, picture,
// is_active}. Les champs riches de l'UI (catégorie, dates, capacité…) ne sont
// pas exposés → on les comble avec des valeurs neutres en attendant un modèle
// backend plus complet.
function mapTraining(t) {
  return {
    id: t.id,
    title: t.title,
    description: t.description || '',
    category: '',
    duration: '',
    endDate: '',
    enrolled: 0,
    capacity: 0,
    url: '',
  }
}

function daysRemaining(endDateStr) {
  if (!endDateStr) return 0
  const [day, month, year] = endDateStr.split(' ')
  if (!(month in frenchMonths) || !year) return 0
  const end = new Date(parseInt(year), frenchMonths[month], parseInt(day))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24))
}

// Jours restants avant une date ISO (sessions programmées côté backend).
function daysUntilISO(isoStr) {
  if (!isoStr) return 0
  const d = new Date(isoStr)
  if (isNaN(d)) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24))
}

function formatDateTime(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (isNaN(d)) return ''
  return d.toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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

// Normalise une URL saisie sans protocole : « www.google.com » → « https://www.google.com ».
function normalizeUrl(raw) {
  const v = (raw || '').trim()
  if (!v) return ''
  if (/^https?:\/\//i.test(v)) return v
  return `https://${v}`
}

function LinkModal({ training, onClose, onSave }) {
  const [url, setUrl] = useState(training.url || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...training, url: normalizeUrl(url) })
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
              autoFocus type="text" placeholder="www.exemple.com/formation"
              value={url} onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <p className="mt-1 text-xs text-gray-400">Pas besoin de https:// — il est ajouté automatiquement.</p>
            {url && (
              <a href={normalizeUrl(url)} target="_blank" rel="noopener noreferrer" className="mt-1.5 flex items-center gap-1 text-xs text-purple-500 hover:underline w-fit">
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
            <button type="submit" className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 rounded-xl text-sm transition-colors">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UserAvatar({ user, size = 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  const initials = user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
  return user.photo ? (
    <img src={user.photo} alt={user.name} title={user.name}
      className={`${dim} rounded-full object-cover border-2 border-white flex-shrink-0`} />
  ) : (
    <div title={user.name}
      className={`${dim} rounded-full bg-primary-light flex items-center justify-center text-white font-bold border-2 border-white flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ── Right panel: interest recap (admin only) ──────────────────────────────────
function InterestPanel({ trainings, interests }) {
  const total = Object.values(interests).reduce((acc, arr) => acc + arr.length, 0)

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star size={15} className="text-amber-500" fill="currentColor" />
            <h3 className="text-sm font-bold text-gray-900">Intérêts exprimés</h3>
          </div>
          {total > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-600">{total}</span>
          )}
        </div>

        <div className="space-y-4">
          {trainings.map((training) => {
            const users = interests[training.id] || []
            return (
              <div key={training.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <p className="text-xs font-semibold text-gray-700 leading-snug mb-2 line-clamp-2">{training.title}</p>

                {users.length === 0 ? (
                  <p className="text-xs text-gray-300 italic">Aucun intérêt pour l'instant</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-1.5">
                      {users.map((user) => (
                        <div key={user.id} className="flex flex-col items-center gap-0.5" style={{ width: '44px' }}>
                          <UserAvatar user={user} size="sm" />
                          <span className="text-gray-500 leading-tight text-center w-full truncate" style={{ fontSize: '10px' }}>
                            {user.name.split(' ')[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      {users.length} personne{users.length > 1 ? 's' : ''} intéressée{users.length > 1 ? 's' : ''}
                    </p>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

// ── Star interest button ──────────────────────────────────────────────────────
function StarButton({ interested, count, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? 'Connectez-vous pour exprimer votre intérêt' : interested ? 'Retirer mon intérêt' : 'Je suis intéressé(e)'}
      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
        interested
          ? 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100'
          : disabled
          ? 'border-gray-100 text-gray-300 cursor-default'
          : 'border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-500 hover:bg-amber-50'
      }`}
    >
      <Star size={13} fill={interested ? 'currentColor' : 'none'} />
      {interested ? 'Intéressé(e)' : 'M\'intéresse'}
      {count > 0 && (
        <span className={`ml-0.5 px-1.5 py-0.5 rounded-full font-bold ${interested ? 'bg-amber-200 text-amber-700' : 'bg-gray-100 text-gray-500'}`} style={{ fontSize: '10px' }}>
          {count}
        </span>
      )}
    </button>
  )
}

// ── Catalogue card ────────────────────────────────────────────────────────────
function CatalogueCard({ training, isAdmin, saved, onToggleSave, onEdit, onLink, interested, interestCount, onToggleInterest, canInteract }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col">
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

      <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
        <StarButton
          interested={interested}
          count={interestCount}
          onClick={onToggleInterest}
          disabled={!canInteract}
        />
        {isAdmin && (
          <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors text-gray-500 hover:text-purple-500 text-xs font-medium">
            <Edit2 size={13} /> Modifier
          </button>
        )}
      </div>
    </div>
  )
}

// ── Active formation card ─────────────────────────────────────────────────────
function ActiveCard({ training, isAdmin, saved, onToggleSave, onEnroll, onEdit, onLink, interested, interestCount, onToggleInterest, canInteract }) {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col">
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

      <div className="mb-4">
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

      <div className="mt-auto flex items-center justify-between gap-2">
        <StarButton
          interested={interested}
          count={interestCount}
          onClick={onToggleInterest}
          disabled={!canInteract}
        />
        <div className="flex gap-2">
          <button onClick={onEnroll} disabled={full || ended}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm px-4 py-2">
            {full ? 'Complet' : ended ? 'Terminée' : "S'inscrire"}
          </button>
          {isAdmin && (
            <button onClick={onEdit} className="p-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors text-gray-500 hover:text-purple-500" title="Modifier">
              <Edit2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Carte d'une session programmée (Formations actives) ──────────────────────
function SessionCard({ session, title, isAdmin, enrolled, onEnroll, onUnenroll, onCancel, canEnroll }) {
  const count = session.enrolled ?? 0
  const cap = session.max_participants || 0
  const pct = cap ? Math.min(100, Math.round((count / cap) * 100)) : 0
  const full = cap > 0 && count >= cap
  const days = daysUntilISO(session.start_date)
  const cancelled = session.status === 'cancelled'
  const completed = session.status === 'completed'
  const ended = completed || cancelled || days < 0
  const barColor = full ? 'bg-red-400' : pct >= 75 ? 'bg-orange-400' : 'bg-purple-400'

  const urgencyColor = ended
    ? 'bg-gray-100 text-gray-500'
    : days <= 7 ? 'bg-red-100 text-red-600'
    : days <= 14 ? 'bg-orange-100 text-orange-600'
    : 'bg-green-100 text-green-600'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <CalendarClock size={20} className="text-purple-500" />
          </div>
          <span className="font-bold text-gray-900">{title}</span>
        </div>
        {cancelled && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Annulée</span>}
        {completed && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">Terminée</span>}
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2"><Calendar size={15} className="text-gray-400" /><span>Du {formatDateTime(session.start_date)}</span></div>
        <div className="flex items-center gap-2"><Clock size={15} className="text-gray-400" /><span>au {formatDateTime(session.end_date)}</span></div>
        {session.location && (
          <div className="flex items-center gap-2"><MapPin size={15} className="text-gray-400" /><span>{session.location}</span></div>
        )}
        {!ended && (
          <div className="flex items-center gap-2">
            <Timer size={15} className="text-gray-400" />
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${urgencyColor}`}>
              {days === 0 ? "Aujourd'hui" : days === 1 ? '1 jour restant' : `${days} jours restants`}
            </span>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5 text-xs text-gray-500"><Users size={13} className="text-gray-400" />Inscrits</span>
          <span className={`text-xs font-semibold ${full ? 'text-red-500' : 'text-gray-700'}`}>
            {count} / {cap}{full && ' — Complet'}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
        {isAdmin ? (
          !ended && (
            <button onClick={onCancel}
              className="text-sm px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium">
              Annuler la session
            </button>
          )
        ) : enrolled ? (
          <button onClick={onUnenroll} disabled={ended}
            className="text-sm px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 rounded-xl transition-colors font-medium">
            Se désinscrire
          </button>
        ) : (
          <button onClick={onEnroll} disabled={full || ended || !canEnroll}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm px-4 py-2">
            {full ? 'Complet' : ended ? 'Terminée' : "S'inscrire"}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Trainings({ isAdmin = false, profile = null }) {
  const [trainings, setTrainings] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [subTab, setSubTab] = useState('catalogue')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('Tout')
  const [selectedTraining, setSelectedTraining] = useState(null)
  const [formModal, setFormModal] = useState(null)
  const [sessionModal, setSessionModal] = useState(false)
  const [saved, setSaved] = useState(new Set())
  const [linkModal, setLinkModal] = useState(null)
  const [interests, setInterests] = useState({})
  const [interestedSet, setInterestedSet] = useState(new Set())
  const [enrolledSessions, setEnrolledSessions] = useState(new Set())

  const loadSessions = () =>
    api.getSessions()
      .then((res) => setSessions(res?.sessions || (Array.isArray(res) ? res : [])))
      .catch(() => { /* sessions optionnelles : on n'écrase pas l'erreur principale */ })

  useEffect(() => {
    let cancelled = false
    Promise.all([api.getTrainings(), api.getSessions().catch(() => ({ sessions: [] }))])
      .then(([tRes, sRes]) => {
        if (cancelled) return
        const list = tRes?.trainings || tRes?.items || (Array.isArray(tRes) ? tRes : [])
        setTrainings(list.map(mapTraining))
        setSessions(sRes?.sessions || (Array.isArray(sRes) ? sRes : []))
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const toggleSave = (id) => setSaved((prev) => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const toggleInterest = (trainingId) => {
    if (!profile) return
    const user = {
      id: `profile-${profile.name}`,
      name: profile.name,
      photo: profile.photo || null,
      role: profile.role || '',
      company: '',
    }
    setInterestedSet((prev) => {
      const next = new Set(prev)
      if (next.has(trainingId)) {
        next.delete(trainingId)
        setInterests((p) => ({ ...p, [trainingId]: (p[trainingId] || []).filter((u) => u.id !== user.id) }))
      } else {
        next.add(trainingId)
        setInterests((p) => ({ ...p, [trainingId]: [...(p[trainingId] || []), user] }))
      }
      return next
    })
  }

  // Persiste réellement la formation (le backend ne stocke que title +
  // description ; catégorie/lien restent des enrichissements côté UI).
  const handleSave = async (data) => {
    const payload = { title: data.title, description: data.description }
    if (data.id) {
      const res = await api.updateTraining(data.id, payload)
      const updated = res?.training || res
      setTrainings((prev) => prev.map((t) => (t.id === data.id
        ? { ...mapTraining(updated), category: data.category, url: data.url } : t)))
    } else {
      const res = await api.createTraining(payload)
      const created = res?.training || res
      setTrainings((prev) => [...prev, { ...mapTraining(created), category: data.category, url: data.url }])
    }
  }

  const handleProgramSession = async (trainingId, payload) => {
    await api.createSession(trainingId, payload)
    await loadSessions()
  }

  const enrollSession = async (sessionId) => {
    try {
      await api.enrollSession(sessionId)
      setEnrolledSessions((prev) => new Set(prev).add(sessionId))
      await loadSessions()
    } catch (err) { setError(err.message) }
  }

  const unenrollSession = async (sessionId) => {
    try {
      await api.unenrollSession(sessionId)
      setEnrolledSessions((prev) => { const n = new Set(prev); n.delete(sessionId); return n })
      await loadSessions()
    } catch (err) { setError(err.message) }
  }

  const cancelSession = async (sessionId) => {
    try {
      await api.deleteSession(sessionId)
      await loadSessions()
    } catch (err) { setError(err.message) }
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

  const savedTrainings = baseFiltered.filter((t) => saved.has(t.id))

  // Sessions programmées (source backend) = formations « actives ».
  const trainingTitleById = Object.fromEntries(trainings.map((t) => [t.id, t.title]))
  const activeSessions = sessions
    .filter((s) => s.status !== 'cancelled' && s.status !== 'completed')
    .filter((s) => (trainingTitleById[s.training_id] || '').toLowerCase().includes(searchQuery.toLowerCase()))

  const displayed = subTab === 'catalogue' ? baseFiltered : savedTrainings

  const cardProps = (training) => ({
    training,
    isAdmin,
    saved: saved.has(training.id),
    onToggleSave: () => toggleSave(training.id),
    interested: interestedSet.has(training.id),
    interestCount: (interests[training.id] || []).length,
    onToggleInterest: () => toggleInterest(training.id),
    canInteract: !!profile && !isAdmin,
    onEdit: () => setFormModal({ mode: 'edit', training }),
    onLink: () => setLinkModal(training),
  })

  return (
    <>
      <div className={`flex gap-6 items-start`}>
        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Formations</h2>
              <p className="text-sm text-gray-500 mt-1">Formations professionnelles pour entrepreneurs</p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button onClick={() => setSessionModal(true)}
                  className="flex items-center gap-2 border border-purple-300 text-purple-600 hover:bg-purple-50 font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
                  <CalendarClock size={16} /> Programmer une formation
                </button>
                <button onClick={() => setFormModal({ mode: 'create' })}
                  className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm">
                  <Plus size={16} /> Créer une formation
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl w-fit">
            <button onClick={() => setSubTab('catalogue')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${subTab === 'catalogue' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <BookOpen size={15} /> Catalogue
            </button>
            <button onClick={() => setSubTab('actives')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${subTab === 'actives' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Zap size={15} />
              Formations actives
              {activeSessions.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${subTab === 'actives' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
                  {activeSessions.length}
                </span>
              )}
            </button>
            <button onClick={() => setSubTab('saved')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${subTab === 'saved' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Star size={15} />
              Sauvegardées
              {saved.size > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${subTab === 'saved' ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'}`}>
                  {saved.size}
                </span>
              )}
            </button>
          </div>

          <div className="relative mb-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher par titre ou catégorie..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-white" />
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === f ? 'bg-purple-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-400 hover:text-purple-500'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {loading && <p className="text-gray-400 py-8 text-center">Chargement des formations…</p>}
          {error && <p className="text-red-500 py-8 text-center">{error}</p>}

          {/* Onglet « Formations actives » : sessions programmées (backend) */}
          {!loading && subTab === 'actives' && (
            activeSessions.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    title={trainingTitleById[session.training_id] || 'Formation'}
                    isAdmin={isAdmin}
                    enrolled={enrolledSessions.has(session.id)}
                    canEnroll={!!profile}
                    onEnroll={() => enrollSession(session.id)}
                    onUnenroll={() => unenrollSession(session.id)}
                    onCancel={() => cancelSession(session.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Aucune formation programmée pour le moment</p>
              </div>
            )
          )}

          {/* Catalogue / Sauvegardées : fiches formation */}
          {!loading && subTab !== 'actives' && (
            displayed.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayed.map((training) => (
                  <CatalogueCard key={training.id} {...cardProps(training)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">
                  {subTab === 'saved' ? "Vous n'avez pas encore sauvegardé de formation"
                    : 'Aucune formation ne correspond à votre recherche'}
                </p>
              </div>
            )
          )}
        </div>

        {/* ── Right panel (admin only) ── */}
        {isAdmin && <InterestPanel trainings={trainings} interests={interests} />}
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

      {sessionModal && (
        <SessionFormModal
          trainings={trainings}
          onClose={() => setSessionModal(false)}
          onSave={handleProgramSession}
        />
      )}
    </>
  )
}
