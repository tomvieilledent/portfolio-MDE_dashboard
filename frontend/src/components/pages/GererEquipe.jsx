import React, { useState } from 'react'
import { UserPlus, Mail, CheckCircle, Clock, Users } from 'lucide-react'
import CreateAccountModal from '../modals/CreateAccountModal'

const initialTeam = [
  { id: 1, name: 'Alice Martin',  role: 'CTO',       email: 'alice@techinnovators.fr',  status: 'Actif',        photo: 'https://picsum.photos/seed/alice1/80' },
  { id: 2, name: 'Marc Dupuis',   role: 'Dev',        email: 'marc@techinnovators.fr',   status: 'Actif',        photo: 'https://picsum.photos/seed/marc2/80' },
  { id: 3, name: 'Sara Benali',   role: 'Designer',   email: 'sara@techinnovators.fr',   status: 'En attente',   photo: 'https://picsum.photos/seed/sara3/80' },
  { id: 4, name: 'Tom Leroy',     role: 'Commercial', email: 'tom@techinnovators.fr',    status: 'En attente',   photo: 'https://picsum.photos/seed/tom4/80' },
]

export default function GererEquipe() {
  const [team, setTeam] = useState(initialTeam)
  const [modal, setModal] = useState(false)

  const actifs    = team.filter((m) => m.status === 'Actif')
  const enAttente = team.filter((m) => m.status === 'En attente')

  const handleNewMember = (data) => {
    setTeam((prev) => [...prev, {
      ...data,
      id: Date.now(),
      photo: `https://picsum.photos/seed/${data.name.replace(' ', '')}/80`,
    }])
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gérer l'équipe</h2>
            <p className="text-sm text-gray-500 mt-1">Membres de Tech Innovators sur la plateforme</p>
          </div>
          <button
            onClick={() => setModal(true)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <UserPlus size={16} /> Inviter un salarié
          </button>
        </div>

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
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Clock size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{enAttente.length}</p>
              <p className="text-xs text-gray-500">En attente</p>
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
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  {member.status === 'Actif'
                    ? <><CheckCircle size={11} /> Actif</>
                    : <><Clock size={11} /> En attente</>
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
