import React, { useState } from 'react'
import { Search, Mail, Phone, MessageCircle } from 'lucide-react'

const initialUsers = [
  { id: 1, name: 'Sophie Dubois', role: 'CEO', company: 'Tech Innovators', email: 'sophie@tech-innovators.fr', phone: '+33 6 12 34 56 78', avatar: 'SD' },
  { id: 2, name: 'Marc Laurent', role: 'Directeur Marketing', company: 'Digital Solutions', email: 'marc@digital.fr', phone: '+33 6 23 45 67 88', avatar: 'ML' },
  { id: 3, name: 'Julie Martin', role: 'DG', company: 'Green Energy Co.', email: 'julie@greenenergy.fr', phone: '+33 5 34 56 78 90', avatar: 'JM' },
  { id: 4, name: 'Pierre Dupont', role: 'Fondateur', company: 'Creative Studio', email: 'pierre@creativestudio.fr', phone: '+33 6 45 67 89 01', avatar: 'PD' },
  { id: 5, name: 'Emma Bernard', role: 'CFO', company: 'Tech Innovators', email: 'emma@tech-innovators.fr', phone: '+33 6 56 78 90 12', avatar: 'EB' },
  { id: 6, name: 'Thomas Petit', role: 'CTO', company: 'Digital Solutions', email: 'thomas@digital.fr', phone: '+33 6 67 89 01 23', avatar: 'TP' },
]

export default function Users({ onContact }) {
  const [users] = useState(initialUsers)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Professionnels</h2>
        <p className="text-sm text-gray-500 mt-1">Répertoire des professionnels de la pépinière</p>
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
          <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 bg-gray-800">
              {user.avatar}
            </div>
            <h3 className="font-bold text-gray-900 text-base">{user.name}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{user.role}</p>
            <p className="text-xs font-medium text-primary-light mt-1 mb-4">{user.company}</p>

            <div className="w-full space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4 mb-4">
              <div className="flex items-center gap-2 justify-center">
                <Mail size={14} className="text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Phone size={14} className="text-gray-400" />
                <span>{user.phone}</span>
              </div>
            </div>

            <button
              onClick={() => onContact?.(user.name)}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <MessageCircle size={16} />
              Contacter
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Aucun professionnel ne correspond à votre recherche</p>
        </div>
      )}
    </div>
  )
}
