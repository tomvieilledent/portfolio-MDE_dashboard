import React, { useState, useEffect } from 'react'
import { UserPlus, Mail, CheckCircle, Clock, Users } from 'lucide-react'
import CreateAccountModal from '../modals/CreateAccountModal'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

// Backend user → membre d'équipe. Pas de poste ni d'état « en attente »
// (tant que la feature email d'activation n'existe pas) → Actif / Désactivé.
function mapMember(u) {
  const name = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email
  return {
    id: u.id,
    name,
    role: u.is_super_admin ? 'Administrateur' : 'Membre',
    email: u.email,
    status: u.is_active ? 'Actif' : 'Désactivé',
    photo: u.profile_picture
      || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4f8a8b&color=fff`,
  }
}

export default function GererEquipe() {
  const { user, companyAdminId } = useAuth()
  const myCompanyId = companyAdminId || user?.company_id || null
  const [team, setTeam] = useState([])
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.getUsers(), api.getCompanies().catch(() => ({ companies: [] }))])
      .then(([{ users }, { companies }]) => {
        if (cancelled) return
        const mine = (companies || []).find((c) => c.id === myCompanyId)
        setCompanyName(mine?.name || '')
        setTeam((users || []).filter((u) => u.company_id === myCompanyId).map(mapMember))
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [myCompanyId])

  const actifs    = team.filter((m) => m.status === 'Actif')
  const inactifs  = team.filter((m) => m.status !== 'Actif')

  const handleNewMember = () => {
    // Création réelle bloquée tant que la feature email d'activation n'est pas
    // tranchée ; on recharge simplement la liste après fermeture du modal.
    setModal(false)
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gérer l'équipe</h2>
            <p className="text-sm text-gray-500 mt-1">Membres{companyName ? ` de ${companyName}` : ''} sur la plateforme</p>
          </div>
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <UserPlus size={16} /> Inviter un salarié
          </button>
        </div>

        {loading && <p className="text-gray-400 py-6 text-center">Chargement de l'équipe…</p>}
        {error && <p className="text-red-500 py-6 text-center">{error}</p>}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-light/10 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-primary-light" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{team.length}</p>
              <p className="text-xs text-gray-500">Membres total</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{actifs.length}</p>
              <p className="text-xs text-gray-500">Comptes actifs</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{inactifs.length}</p>
              <p className="text-xs text-gray-500">Désactivés</p>
            </div>
          </div>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {team.map((member) => (
              <div key={member.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <img src={member.photo} alt={member.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.role}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Mail size={13} />
                  <span className="truncate max-w-48">{member.email}</span>
                </div>
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                  member.status === 'Actif'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {member.status === 'Actif'
                    ? <><CheckCircle size={11} /> Actif</>
                    : <><Clock size={11} /> Désactivé</>
                  }
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <CreateAccountModal
          forRole="salarie"
          onClose={() => setModal(false)}
          onSuccess={handleNewMember}
        />
      )}
    </>
  )
}
