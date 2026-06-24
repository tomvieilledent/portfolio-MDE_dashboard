import React, { useState, useRef } from 'react'
import { Search, Mail, Phone, MessageCircle, UserPlus, Building2, RotateCcw, ImagePlus, Download } from 'lucide-react'
import CreateAccountModal from '../modals/CreateAccountModal'

const initialUsers = [
  { id: 0, name: 'Céline Marcilhac', role: 'Super Administratrice', company: 'Maison de l\'Économie', email: 'admin@mde.fr',                  phone: '+33 5 65 00 00 00', photo: 'https://randomuser.me/api/portraits/women/65.jpg', isAdmin: true },
  { id: 1, name: 'Sophie Dubois',    role: 'CEO',                   company: 'Tech Innovators',       email: 'sophie@tech-innovators.fr',     phone: '+33 6 12 34 56 78', photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 2, name: 'Marc Laurent',     role: 'Directeur Marketing',   company: 'Digital Solutions',     email: 'marc@digital.fr',               phone: '+33 6 23 45 67 88', photo: 'https://randomuser.me/api/portraits/men/32.jpg'   },
  { id: 3, name: 'Julie Martin',     role: 'DG',                    company: 'Green Energy Co.',      email: 'julie@greenenergy.fr',           phone: '+33 5 34 56 78 90', photo: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 4, name: 'Pierre Dupont',    role: 'Fondateur',             company: 'Creative Studio',       email: 'pierre@creativestudio.fr',      phone: '+33 6 45 67 89 01', photo: 'https://randomuser.me/api/portraits/men/45.jpg'   },
  { id: 5, name: 'Emma Bernard',     role: 'CFO',                   company: 'Tech Innovators',       email: 'emma@tech-innovators.fr',       phone: '+33 6 56 78 90 12', photo: 'https://randomuser.me/api/portraits/women/17.jpg' },
  { id: 6, name: 'Thomas Petit',     role: 'CTO',                   company: 'Digital Solutions',     email: 'thomas@digital.fr',             phone: '+33 6 67 89 01 23', photo: 'https://randomuser.me/api/portraits/men/22.jpg'   },
]

const COMPANY_COLORS = {
  'Maison de l\'Économie': { bg: 'bg-primary-light', light: 'bg-primary-light/10', text: 'text-primary-light', hex: '#4f8a8b' },
  'Tech Innovators':       { bg: 'bg-orange-500',    light: 'bg-orange-50',        text: 'text-orange-600',    hex: '#f97316' },
  'Digital Solutions':     { bg: 'bg-blue-500',      light: 'bg-blue-50',          text: 'text-blue-600',      hex: '#3b82f6' },
  'Green Energy Co.':      { bg: 'bg-green-500',     light: 'bg-green-50',         text: 'text-green-600',     hex: '#22c55e' },
  'Creative Studio':       { bg: 'bg-purple-500',    light: 'bg-purple-50',        text: 'text-purple-600',    hex: '#a855f7' },
}

function getColor(company) {
  return COMPANY_COLORS[company] || { bg: 'bg-gray-500', light: 'bg-gray-50', text: 'text-gray-600', hex: '#6b7280' }
}

function FlipCard({ user, flipped, onFlip, onContact, businessCard, onUploadCard, onRemoveCard }) {
  const color = getColor(user.company)
  const fileRef = useRef()

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    onUploadCard(URL.createObjectURL(file))
    e.target.value = ''
  }

  return (
    <div
      className={`flip-card cursor-pointer${flipped ? ' flipped' : ''}`}
      style={{ height: '330px' }}
      onClick={onFlip}
    >
      <div className="flip-card-inner">

        {/* ── FACE AVANT ── */}
        <div className="flip-card-front bg-white shadow-sm border border-gray-100 flex flex-col items-center text-center p-6 hover:shadow-md transition-shadow">
          <img
            src={user.photo}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-gray-100 shadow-sm"
          />
          <h3 className="font-bold text-gray-900 text-base">{user.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{user.role}</p>
          {user.isAdmin && (
            <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-light/10 text-primary-light">
              ★ Admin MDE
            </span>
          )}
          <p className="text-xs font-semibold mt-1 mb-4 text-primary-light">{user.company}</p>

          <div className="w-full space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4 mb-3">
            <div className="flex items-center gap-2 justify-center">
              <Mail size={14} className="text-gray-400" />
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Phone size={14} className="text-gray-400" />
              <span className="text-xs">{user.phone}</span>
            </div>
          </div>

          {/* Bouton upload carte de visite */}
          <button
            onClick={(e) => { e.stopPropagation(); fileRef.current.click() }}
            className="mt-auto flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-light transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
            title="Uploader une carte de visite"
          >
            <ImagePlus size={13} />
            {businessCard ? 'Changer la carte' : 'Ajouter une carte de visite'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

        {/* ── FACE ARRIÈRE — clic sur zone vide = flip retour ── */}
        <div className="flip-card-back shadow-md border border-gray-100 bg-white flex flex-col overflow-hidden">

          {businessCard ? (
            /* Image uploadée — centrée à bonnes proportions */
            <>
              {/* Barre du haut */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 flex-shrink-0">
                <span className="text-xs font-semibold text-gray-500">Carte de visite</span>
                <a
                  href={businessCard}
                  download="carte-de-visite.jpg"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-light transition-colors"
                  title="Télécharger la carte"
                >
                  <Download size={14} />
                </a>
              </div>

              {/* Image élargie */}
              <div className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-50">
                <img
                  src={businessCard}
                  alt="Carte de visite"
                  className="w-full max-h-56 object-contain rounded-md shadow-md"
                />
              </div>

              {/* Hint retour */}
              <p className="text-center text-xs text-gray-300 py-1.5 flex-shrink-0">Cliquer pour retourner</p>
            </>
          ) : (
            /* Carte générée par défaut */
            <>
              <div className={`${color.bg} px-5 pt-4 pb-9 relative flex-shrink-0`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">{user.company}</p>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">{user.name}</h3>
                <p className="text-sm text-white/80">{user.role}</p>
              </div>

              <div className="relative flex-1 bg-white px-5 pb-4">
                <img
                  src={user.photo}
                  alt={user.name}
                  className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-md absolute -top-7 right-5"
                />
                <div className="pt-3 space-y-2 mt-1">
                  <a href={`mailto:${user.email}`} onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-light transition-colors">
                    <div className={`w-6 h-6 ${color.light} rounded-md flex items-center justify-center flex-shrink-0`}>
                      <Mail size={11} className={color.text} />
                    </div>
                    <span className="truncate text-xs">{user.email}</span>
                  </a>
                  <a href={`tel:${user.phone}`} onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 text-gray-700 hover:text-primary-light transition-colors">
                    <div className={`w-6 h-6 ${color.light} rounded-md flex items-center justify-center flex-shrink-0`}>
                      <Phone size={11} className={color.text} />
                    </div>
                    <span className="text-xs">{user.phone}</span>
                  </a>
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className={`w-6 h-6 ${color.light} rounded-md flex items-center justify-center flex-shrink-0`}>
                      <Building2 size={11} className={color.text} />
                    </div>
                    <span className="text-xs">{user.company}</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onContact?.(user.name) }}
                    className={`flex-1 ${color.bg} hover:opacity-90 text-white text-xs font-semibold py-1.5 rounded-xl transition-opacity flex items-center justify-center gap-1.5`}
                  >
                    <MessageCircle size={13} /> Contacter
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); fileRef.current.click() }}
                    className="flex items-center justify-center border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500 px-3 py-1.5 rounded-xl transition-colors"
                    title="Uploader une carte de visite"
                  >
                    <ImagePlus size={13} />
                  </button>
                </div>
              </div>
            </>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </div>

      </div>
    </div>
  )
}

export default function Users({ onContact, role, profile }) {
  const [users, setUsers] = useState(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [flipped, setFlipped] = useState(new Set())
  const [businessCards, setBusinessCards] = useState({})
  const [createModal, setCreateModal] = useState(false)

  const toggleFlip = (id) => setFlipped((prev) => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const handleUploadCard = (id, url) => setBusinessCards((prev) => ({ ...prev, [id]: url }))
  const handleRemoveCard = (id) => setBusinessCards((prev) => { const next = { ...prev }; delete next[id]; return next })

  // Résout la carte de visite effective : le profil connecté prime sur l'upload local du Trombinoscope
  const resolveCard = (user) => {
    if (profile?.name === user.name && profile?.businessCard) return profile.businessCard
    return businessCards[user.id] || null
  }

  const handleNewAccount = (data) => {
    setUsers((prev) => [...prev, {
      id: Date.now(),
      name: data.name,
      role: data.role,
      company: data.company,
      email: data.email,
      phone: '—',
      photo: `https://randomuser.me/api/portraits/lego/${(prev.length % 8) + 1}.jpg`,
    }])
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Professionnels</h2>
          <p className="text-sm text-gray-500 mt-1">Répertoire des professionnels de la pépinière</p>
        </div>
        {role === 'admin' && (
          <button onClick={() => setCreateModal(true)} className="flex items-center gap-2 btn-primary text-sm">
            <UserPlus size={16} /> Créer un compte Patron
          </button>
        )}
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom ou entreprise..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((user) => (
          <FlipCard
            key={user.id}
            user={user}
            flipped={flipped.has(user.id)}
            onFlip={() => toggleFlip(user.id)}
            onContact={onContact}
            businessCard={resolveCard(user)}
            onUploadCard={(url) => handleUploadCard(user.id, url)}
            onRemoveCard={() => handleRemoveCard(user.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Aucun professionnel ne correspond à votre recherche</p>
        </div>
      )}

      {createModal && (
        <CreateAccountModal
          forRole="patron"
          onClose={() => setCreateModal(false)}
          onSuccess={handleNewAccount}
        />
      )}
    </div>
  )
}
