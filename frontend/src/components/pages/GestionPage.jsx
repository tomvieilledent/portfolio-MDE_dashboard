import React, { useState, useEffect } from 'react'
import { Users, Building2, UserX, UserCheck, Trash2, AlertTriangle, ShieldCheck, Shield, X, Loader2 } from 'lucide-react'
import { api, mediaUrl } from '../../lib/api'

// ── Rôle plateforme dérivé du backend ────────────────────────────────────────
// superAdmin = is_super_admin ; admin = administrateur d'une entreprise
// (Company.admin_id) ; user = ni l'un ni l'autre. Seul le rôle super admin est
// modifiable ici (le rôle « admin d'entreprise » se gère depuis la fiche
// entreprise via son email d'administrateur).
const getPlatformRole = (user) => {
  if (user.isSuperAdmin) return 'superAdmin'
  if (user.isAdmin)      return 'admin'
  return 'user'
}

const ROLE_META = {
  user:       { label: 'Utilisateur',  color: 'bg-gray-100 text-gray-600',              icon: <Users size={9} /> },
  admin:      { label: "Admin d'entreprise", color: 'bg-primary-light/10 text-primary-light', icon: <Shield size={9} /> },
  superAdmin: { label: 'Super Admin',  color: 'bg-purple-100 text-purple-600',          icon: <ShieldCheck size={9} /> },
}

function RoleBadge({ user }) {
  const meta = ROLE_META[getPlatformRole(user)]
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${meta.color}`}>
      {meta.icon} {meta.label}
    </span>
  )
}

// ── Modal : basculer le rôle Super Admin ─────────────────────────────────────
function RoleModal({ target, isLastSuperAdmin, onClose, onConfirm }) {
  const currentlySuper = target.isSuperAdmin
  const [makeSuper, setMakeSuper] = useState(currentlySuper)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // On ne peut pas rétrograder le dernier super admin actif.
  const demotingLast = currentlySuper && !makeSuper && isLastSuperAdmin
  const canConfirm = makeSuper !== currentlySuper && !demotingLast

  const confirm = async () => {
    setError('')
    setSubmitting(true)
    try {
      await onConfirm(makeSuper)
    } catch (err) {
      setError(err.message || 'Échec de la modification du rôle')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>

        <div className="bg-primary-light px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Modifier le rôle</h3>
              <p className="text-xs text-white/80">{target.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white"><X size={18} /></button>
        </div>

        <div className="px-5 py-5 space-y-3">
          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
          )}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <img src={target.photo} alt={target.name} className="w-10 h-10 rounded-full object-cover border border-gray-100 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{target.name}</p>
              <p className="text-xs text-gray-500">{target.email}{target.company ? ` · ${target.company}` : ''}</p>
            </div>
          </div>

          {target.isAdmin && !target.isSuperAdmin && (
            <p className="text-xs text-gray-400 italic">
              Cet utilisateur est administrateur d'une entreprise — ce rôle se gère depuis la fiche entreprise.
            </p>
          )}

          <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50">
            <input type="checkbox" checked={makeSuper} onChange={(e) => setMakeSuper(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-purple-500 flex-shrink-0" />
            <div>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_META.superAdmin.color}`}>
                {ROLE_META.superAdmin.icon} Super Admin
              </span>
              <p className="text-xs text-gray-500 mt-1">Accès complet — peut gérer tous les comptes et toutes les entreprises.</p>
            </div>
          </label>

          {demotingLast && (
            <p className="text-xs text-red-500 font-medium">
              Impossible : dernier Super Admin actif. Nommez un remplaçant d'abord.
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} disabled={submitting}
              className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
              Annuler
            </button>
            <button onClick={confirm} disabled={!canConfirm || submitting}
              className="flex-1 bg-primary-light hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />} Confirmer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Modal : suppression définitive ───────────────────────────────────────────
function DeleteUserModal({ user, onClose, onConfirm }) {
  const [checked, setChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const confirm = async () => {
    setError('')
    setSubmitting(true)
    try {
      await onConfirm()
    } catch (err) {
      setError(err.message || 'Échec de la suppression')
      setSubmitting(false)
    }
  }

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
          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>
          )}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}{user.company ? ` · ${user.company}` : ''}</p>
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
            <button onClick={onClose} disabled={submitting}
              className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">Annuler</button>
            <button onClick={confirm} disabled={!checked || submitting}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5">
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Mapping backend → UI ─────────────────────────────────────────────────────
function mapUser(u, adminUserIds, companyById) {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email
  return {
    id: u.id,
    name,
    email: u.email,
    company: companyById[u.company_id] || '',
    photo: mediaUrl(u.profile_picture)
      || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f8a8b&color=fff`,
    isSuperAdmin: !!u.is_super_admin,
    isAdmin: adminUserIds.has(u.id),
    deactivated: !u.is_active,
  }
}

function mapCompany(c) {
  return { id: c.id, name: c.name, sector: c.description || '—', location: '—', employees: '', deactivated: !c.is_active }
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function GestionPage() {
  const [subTab,    setSubTab]    = useState('users')
  const [users,     setUsers]     = useState([])
  const [companies, setCompanies] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [busyId,    setBusyId]    = useState(null)

  const [deleteModal, setDeleteModal] = useState(null)
  const [roleModal,   setRoleModal]   = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.getUsers(), api.getCompanies()])
      .then(([{ users: rawUsers }, { companies: rawCompanies }]) => {
        if (cancelled) return
        const adminUserIds = new Set((rawCompanies || []).map((c) => c.admin_id).filter(Boolean))
        const companyById = Object.fromEntries((rawCompanies || []).map((c) => [c.id, c.name]))
        setUsers((rawUsers || []).map((u) => mapUser(u, adminUserIds, companyById)))
        setCompanies((rawCompanies || []).map(mapCompany))
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const activeSuperAdmins = users.filter((u) => u.isSuperAdmin && !u.deactivated)

  const patchUser = (id, changes) =>
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...changes } : u))

  const handleDeactivate = async (user) => {
    setBusyId(user.id)
    try { await api.deactivateUser(user.id); patchUser(user.id, { deactivated: true }) }
    catch (err) { setError(err.message) }
    finally { setBusyId(null) }
  }

  const handleReactivate = async (user) => {
    setBusyId(user.id)
    try { await api.reactivateUser(user.id); patchUser(user.id, { deactivated: false }) }
    catch (err) { setError(err.message) }
    finally { setBusyId(null) }
  }

  const handleDeleteConfirm = async () => {
    const user = deleteModal
    await api.deleteUser(user.id)
    setUsers((prev) => prev.filter((u) => u.id !== user.id))
    setDeleteModal(null)
  }

  const handleRoleConfirm = async (makeSuper) => {
    const target = roleModal
    const { user } = await api.setUserRole(target.id, makeSuper)
    patchUser(target.id, { isSuperAdmin: !!user.is_super_admin })
    setRoleModal(null)
  }

  const handleToggleCompany = async (company) => {
    setBusyId(company.id)
    try {
      if (company.deactivated) await api.reactivateCompany(company.id)
      else await api.deactivateCompany(company.id)
      setCompanies((prev) => prev.map((c) => c.id === company.id ? { ...c, deactivated: !c.deactivated } : c))
    } catch (err) { setError(err.message) }
    finally { setBusyId(null) }
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

        {loading && <p className="text-gray-400 py-8 text-center">Chargement…</p>}
        {error && <p className="text-red-500 py-4 text-center">{error}</p>}

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
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Comptes actifs · {activeUsers.length}
              </h3>
              <div className="space-y-2">
                {activeUsers.map((user) => {
                  const busy = busyId === user.id
                  return (
                    <div key={user.id} className="border rounded-xl px-4 py-3 flex items-center gap-4 shadow-sm bg-white border-gray-100">
                      <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <RoleBadge user={user} />
                        </div>
                        <p className="text-xs text-gray-400 truncate">{user.company || '—'}</p>
                      </div>
                      <p className="text-xs text-gray-400 hidden md:block shrink-0">{user.email}</p>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => setRoleModal(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-light/40 text-primary-light hover:bg-primary-light/5 text-xs font-medium transition-colors">
                          <Shield size={13} /> Rôle
                        </button>
                        <button onClick={() => handleDeactivate(user)} disabled={busy}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 text-xs font-medium transition-colors disabled:opacity-50">
                          {busy ? <Loader2 size={13} className="animate-spin" /> : <UserX size={13} />} Désactiver
                        </button>
                        <button onClick={() => setDeleteModal(user)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors">
                          <Trash2 size={13} /> Supprimer
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {deactivatedUsers.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Comptes désactivés · {deactivatedUsers.length}
                </h3>
                <div className="space-y-2">
                  {deactivatedUsers.map((user) => {
                    const busy = busyId === user.id
                    return (
                      <div key={user.id} className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-4">
                        <img src={user.photo} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 grayscale opacity-60 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-500">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.company || '—'}</p>
                        </div>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full hidden md:block shrink-0">Désactivé</span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button onClick={() => handleReactivate(user)} disabled={busy}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 text-xs font-medium transition-colors disabled:opacity-50">
                            {busy ? <Loader2 size={13} className="animate-spin" /> : <UserCheck size={13} />} Réactiver
                          </button>
                          <button onClick={() => setDeleteModal(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors">
                            <Trash2 size={13} /> Supprimer
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Entreprises ── */}
        {subTab === 'companies' && (
          <div className="space-y-2">
            {companies.map((company) => {
              const busy = busyId === company.id
              return (
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
                    <p className="text-xs text-gray-400">{company.sector}</p>
                  </div>
                  <button onClick={() => handleToggleCompany(company)} disabled={busy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex-shrink-0 disabled:opacity-50 ${
                      company.deactivated
                        ? 'border-green-200 text-green-600 hover:bg-green-50'
                        : 'border-amber-200 text-amber-600 hover:bg-amber-50'
                    }`}>
                    {busy ? <Loader2 size={13} className="animate-spin" />
                      : company.deactivated ? <><UserCheck size={13} /> Réactiver</> : <><UserX size={13} /> Désactiver</>}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {deleteModal && (
        <DeleteUserModal
          user={deleteModal}
          onClose={() => setDeleteModal(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {roleModal && (
        <RoleModal
          target={roleModal}
          isLastSuperAdmin={roleModal.isSuperAdmin && activeSuperAdmins.length <= 1}
          onClose={() => setRoleModal(null)}
          onConfirm={handleRoleConfirm}
        />
      )}
    </>
  )
}
