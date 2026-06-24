import React, { useState } from 'react'
import { Users, Building2, UserX, UserCheck, Trash2, AlertTriangle, ShieldCheck, Shield, X } from 'lucide-react'

const INITIAL_USERS = [
  { id: 0, name: 'Céline Marcilhac', role: 'Super Administratrice', company: 'Maison de l\'Économie', email: 'admin@mde.fr',            photo: 'https://randomuser.me/api/portraits/women/65.jpg', isAdmin: true,  isSuperAdmin: true,  deactivated: false },
  { id: 1, name: 'Sophie Dubois',    role: 'CEO',                   company: 'Tech Innovators',       email: 'sophie@tech-innovators.fr', photo: 'https://randomuser.me/api/portraits/women/44.jpg', isAdmin: false, isSuperAdmin: false, deactivated: false },
  { id: 2, name: 'Marc Laurent',     role: 'Directeur Marketing',   company: 'Digital Solutions',     email: 'marc@digital.fr',           photo: 'https://randomuser.me/api/portraits/men/32.jpg',   isAdmin: false, isSuperAdmin: false, deactivated: false },
  { id: 3, name: 'Julie Martin',     role: 'DG',                    company: 'Green Energy Co.',      email: 'julie@greenenergy.fr',       photo: 'https://randomuser.me/api/portraits/women/68.jpg', isAdmin: false, isSuperAdmin: false, deactivated: false },
  { id: 4, name: 'Pierre Dupont',    role: 'Fondateur',             company: 'Creative Studio',       email: 'pierre@creativestudio.fr',   photo: 'https://randomuser.me/api/portraits/men/45.jpg',   isAdmin: false, isSuperAdmin: false, deactivated: false },
  { id: 5, name: 'Emma Bernard',     role: 'CFO',                   company: 'Tech Innovators',       email: 'emma@tech-innovators.fr',    photo: 'https://randomuser.me/api/portraits/women/17.jpg', isAdmin: false, isSuperAdmin: false, deactivated: false },
  { id: 6, name: 'Thomas Petit',     role: 'CTO',                   company: 'Digital Solutions',     email: 'thomas@digital.fr',          photo: 'https://randomuser.me/api/portraits/men/22.jpg',   isAdmin: false, isSuperAdmin: false, deactivated: false },
]

const INITIAL_COMPANIES = [
  { id: 1, name: 'Tech Innovators',   sector: 'Technologies',           location: 'Toulouse',    employees: '8 employés',  deactivated: false },
  { id: 2, name: 'Digital Solutions', sector: 'Marketing Digital',      location: 'Montpellier', employees: '12 employés', deactivated: false },
  { id: 3, name: 'Green Energy Co.',  sector: 'Énergie Renouvelable',   location: 'Rodez',       employees: '15 employés', deactivated: false },
  { id: 4, name: 'Creative Studio',   sector: 'Design & Communication', location: 'Nîmes',       employees: '6 employés',  deactivated: false },
]

function AdminBadge({ user }) {
  if (user.isSuperAdmin) return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-600">
      <ShieldCheck size={9} /> Super Admin
    </span>
  )
  if (user.isAdmin) return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold bg-primary-light/10 text-primary-light">
      <Shield size={9} /> Admin
    </span>
  )
  return null
}

// ── Modal : suppression directe (utilisateurs non-admin) ─────────────────────
function DeleteUserModal({ user, onClose, onConfirm }) {
  const [checked, setChecked] = useState(false)
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-red-500 px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Suppression définitive</h3>
            <p className="text-xs text-white/80">Cette action est irréversible</p>
          </div>
        </div>
        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role} · {user.company}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Le compte et toutes les données de <span className="font-semibold">{user.name}</span> seront supprimés définitivement.
            </p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-red-500 flex-shrink-0" />
            <span className="text-sm text-gray-700 leading-snug">
              Je confirme la suppression <span className="font-semibold text-red-600">définitive et irréversible</span> de ce compte
            </span>
          </label>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors">Annuler</button>
            <button onClick={onConfirm} disabled={!checked}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5">
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal : nommer un successeur avant désactivation ou suppression d'un admin ─
function SuccessorModal({ users, targetUser, action, onClose, onConfirm }) {
  const [selected, setSelected] = useState(null)
  const [checked, setChecked] = useState(false)

  // Candidates : non-admin, non-désactivés, pas la cible
  const candidates = users.filter((u) => !u.isAdmin && !u.deactivated && u.id !== targetUser.id)

  const actionLabel  = action === 'delete' ? 'supprimer' : 'désactiver'
  const buttonLabel  = action === 'delete' ? 'Transférer et supprimer' : 'Transférer et désactiver'
  const successorLevel = targetUser.isSuperAdmin ? 'Super Admin' : 'Admin'

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>

        <div className={`px-5 py-4 flex items-center justify-between ${action === 'delete' ? 'bg-red-500' : 'bg-amber-500'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Désigner un successeur</h3>
              <p className="text-xs text-white/80">Avant de {actionLabel} {targetUser.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={18} /></button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              <span className="font-semibold">{targetUser.name}</span> est <span className="font-semibold">{successorLevel}</span>.
              Vous devez nommer un remplaçant avant de pouvoir {actionLabel} ce compte.
            </p>
          </div>

          <p className="text-sm font-medium text-gray-700">
            Choisir le nouveau <span className="font-semibold">{successorLevel}</span> :
          </p>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {candidates.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-4">Aucun utilisateur disponible</p>
            ) : candidates.map((u) => (
              <label key={u.id}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${
                  selected === u.id ? 'border-primary-light bg-primary-light/5' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}>
                <input type="radio" name="successor" value={u.id} checked={selected === u.id}
                  onChange={() => setSelected(u.id)} className="accent-primary-light" />
                <img src={u.photo} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-gray-100 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500">{u.role}</p>
                </div>
              </label>
            ))}
          </div>

          {action === 'delete' && (
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-red-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 leading-snug">
                Je confirme la suppression <span className="font-semibold text-red-600">définitive et irréversible</span> de ce compte
              </span>
            </label>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors">
              Annuler
            </button>
            <button
              onClick={() => selected && onConfirm(selected)}
              disabled={!selected || (action === 'delete' && !checked)}
              className={`flex-1 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 ${
                action === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              <ShieldCheck size={14} /> {buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal : promouvoir un utilisateur en admin ou superadmin ─────────────────
function GrantAdminModal({ user, currentUserIsSuperAdmin, onClose, onConfirm }) {
  // currentUserIsSuperAdmin: true → peut promouvoir en superadmin aussi
  const [level, setLevel] = useState('admin')

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>

        <div className="bg-primary-light px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Promouvoir</h3>
              <p className="text-xs text-white/80">Attribuer des droits d'administration</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={18} /></button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role} · {user.company}</p>
            </div>
          </div>

          <p className="text-sm font-medium text-gray-700">Niveau d'administration :</p>

          <div className="space-y-2">
            <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${level === 'admin' ? 'border-primary-light bg-primary-light/5' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
              <input type="radio" name="level" value="admin" checked={level === 'admin'}
                onChange={() => setLevel('admin')} className="mt-0.5 accent-primary-light" />
              <div>
                <div className="flex items-center gap-1.5">
                  <Shield size={13} className="text-primary-light" />
                  <span className="text-sm font-semibold text-gray-900">Admin</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Peut gérer les utilisateurs et entreprises, promouvoir en admin.</p>
              </div>
            </label>

            {currentUserIsSuperAdmin && (
              <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${level === 'super' ? 'border-purple-400 bg-purple-50' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}>
                <input type="radio" name="level" value="super" checked={level === 'super'}
                  onChange={() => setLevel('super')} className="mt-0.5 accent-purple-500" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-purple-600" />
                    <span className="text-sm font-semibold text-gray-900">Super Admin</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Accès complet, peut promouvoir en Super Admin et supprimer des admins.</p>
                </div>
              </label>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors">
              Annuler
            </button>
            <button onClick={() => onConfirm(level)}
              className="flex-1 bg-primary-light hover:bg-primary text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} /> Promouvoir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GestionPage({ currentUserIsSuperAdmin = true }) {
  const [subTab, setSubTab] = useState('users')
  const [users, setUsers] = useState(INITIAL_USERS)
  const [companies, setCompanies] = useState(INITIAL_COMPANIES)

  // delete direct (non-admin)
  const [deleteModal, setDeleteModal] = useState(null)
  // successor required (admin/superadmin) — { user, action: 'deactivate'|'delete' }
  const [successorModal, setSuccessorModal] = useState(null)
  // promote regular user to admin/superadmin
  const [grantModal, setGrantModal] = useState(null)

  // ── Users actions ──────────────────────────────────────────────────────────

  const handleClickDeactivate = (user) => {
    if (user.isAdmin) {
      setSuccessorModal({ user, action: 'deactivate' })
    } else {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, deactivated: true } : u))
    }
  }

  const handleClickDelete = (user) => {
    if (user.isAdmin) {
      setSuccessorModal({ user, action: 'delete' })
    } else {
      setDeleteModal(user)
    }
  }

  // Called after successor selected in SuccessorModal
  const handleSuccessorConfirm = (newAdminId) => {
    const { user: target, action } = successorModal
    setUsers((prev) => prev.map((u) => {
      if (u.id === newAdminId) return { ...u, isAdmin: true, isSuperAdmin: target.isSuperAdmin }
      if (u.id === target.id) {
        if (action === 'delete') return null
        return { ...u, isAdmin: false, isSuperAdmin: false, deactivated: true }
      }
      return u
    }).filter(Boolean))
    setSuccessorModal(null)
  }

  const handleReactivate = (id) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, deactivated: false } : u))
  }

  const handleDeleteDirect = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    setDeleteModal(null)
  }

  const handleGrantAdmin = (level) => {
    setUsers((prev) => prev.map((u) =>
      u.id === grantModal.id
        ? { ...u, isAdmin: true, isSuperAdmin: level === 'super' }
        : u
    ))
    setGrantModal(null)
  }

  // ── Companies actions ──────────────────────────────────────────────────────
  const handleToggleCompany = (id) => {
    setCompanies((prev) => prev.map((c) => c.id === id ? { ...c, deactivated: !c.deactivated } : c))
  }

  const activeUsers      = users.filter((u) => !u.deactivated)
  const deactivatedUsers = users.filter((u) => u.deactivated)

  return (
    <>
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Gestion</h2>
          <p className="text-sm text-gray-500 mt-1">Administration des comptes et des entreprises</p>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
          <button onClick={() => setSubTab('users')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${subTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Users size={15} /> Utilisateurs
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${subTab === 'users' ? 'bg-primary-light/10 text-primary-light' : 'bg-gray-200 text-gray-500'}`}>
              {users.length}
            </span>
          </button>
          <button onClick={() => setSubTab('companies')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${subTab === 'companies' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Building2 size={15} /> Entreprises
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${subTab === 'companies' ? 'bg-primary-light/10 text-primary-light' : 'bg-gray-200 text-gray-500'}`}>
              {companies.length}
            </span>
          </button>
        </div>

        {/* ── Utilisateurs ── */}
        {subTab === 'users' && (
          <div className="space-y-6">

            {/* Comptes actifs */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Comptes actifs · {activeUsers.length}
              </h3>
              <div className="space-y-2">
                {activeUsers.map((user) => (
                  <div key={user.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-4 shadow-sm">
                    <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <AdminBadge user={user} />
                      </div>
                      <p className="text-xs text-gray-400 truncate">{user.role} · {user.company}</p>
                    </div>
                    <p className="text-xs text-gray-400 hidden md:block shrink-0">{user.email}</p>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Promouvoir — visible uniquement pour les non-admins */}
                      {!user.isAdmin && (
                        <button
                          onClick={() => setGrantModal(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-light/40 text-primary-light hover:bg-primary-light/5 text-xs font-medium transition-colors"
                          title="Promouvoir administrateur"
                        >
                          <ShieldCheck size={13} /> Promouvoir
                        </button>
                      )}
                      <button
                        onClick={() => handleClickDeactivate(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 text-xs font-medium transition-colors"
                      >
                        <UserX size={13} /> Désactiver
                      </button>
                      <button
                        onClick={() => handleClickDelete(user)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors"
                      >
                        <Trash2 size={13} /> Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comptes désactivés */}
            {deactivatedUsers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Comptes désactivés · {deactivatedUsers.length}
                </h3>
                <div className="space-y-2">
                  {deactivatedUsers.map((user) => (
                    <div key={user.id} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-4">
                      <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 grayscale opacity-60 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-500">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.role} · {user.company}</p>
                      </div>
                      <span className="text-xs font-semibold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full hidden md:block shrink-0">Désactivé</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleReactivate(user.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 text-xs font-medium transition-colors"
                        >
                          <UserCheck size={13} /> Réactiver
                        </button>
                        <button
                          onClick={() => handleClickDelete(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors"
                        >
                          <Trash2 size={13} /> Supprimer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Entreprises ── */}
        {subTab === 'companies' && (
          <div className="space-y-2">
            {companies.map((company) => (
              <div key={company.id}
                className={`border rounded-xl px-4 py-3 flex items-center gap-4 shadow-sm ${company.deactivated ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${company.deactivated ? 'bg-gray-200' : 'bg-primary-light/10'}`}>
                  <Building2 size={18} className={company.deactivated ? 'text-gray-400' : 'text-primary-light'} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${company.deactivated ? 'text-gray-400' : 'text-gray-900'}`}>{company.name}</p>
                    {company.deactivated && (
                      <span className="text-xs font-semibold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">Désactivée</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{company.sector} · {company.location} · {company.employees}</p>
                </div>
                <button
                  onClick={() => handleToggleCompany(company.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex-shrink-0 ${
                    company.deactivated
                      ? 'border-green-200 text-green-600 hover:bg-green-50'
                      : 'border-amber-200 text-amber-600 hover:bg-amber-50'
                  }`}
                >
                  {company.deactivated
                    ? <><UserCheck size={13} /> Réactiver</>
                    : <><UserX size={13} /> Désactiver</>
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {deleteModal && (
        <DeleteUserModal
          user={deleteModal}
          onClose={() => setDeleteModal(null)}
          onConfirm={() => handleDeleteDirect(deleteModal.id)}
        />
      )}

      {successorModal && (
        <SuccessorModal
          users={users}
          targetUser={successorModal.user}
          action={successorModal.action}
          onClose={() => setSuccessorModal(null)}
          onConfirm={handleSuccessorConfirm}
        />
      )}

      {grantModal && (
        <GrantAdminModal
          user={grantModal}
          currentUserIsSuperAdmin={currentUserIsSuperAdmin}
          onClose={() => setGrantModal(null)}
          onConfirm={handleGrantAdmin}
        />
      )}
    </>
  )
}
