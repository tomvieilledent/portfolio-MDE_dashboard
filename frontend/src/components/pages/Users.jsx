import React, { useState } from 'react'
import { Plus, Mail, Phone, MapPin } from 'lucide-react'

export default function Users() {
  const [users] = useState([
    {
      id: 1,
      name: 'Guillaume Salva',
      company: 'Tech Innovators',
      email: 'guillaume@example.com',
      phone: '+33 1 23 45 67 89',
      role: 'Manager',
      location: 'Paris',
      avatar: 'GS',
    },
    {
      id: 2,
      name: 'Marie Dupont',
      company: 'Digital Solutions',
      email: 'marie@example.com',
      phone: '+33 4 56 78 90 12',
      role: 'Responsable RH',
      location: 'Lyon',
      avatar: 'MD',
    },
    {
      id: 3,
      name: 'Jean Martin',
      company: 'Green Energy Co.',
      email: 'jean@example.com',
      phone: '+33 2 34 56 78 90',
      role: 'Directeur',
      location: 'Nantes',
      avatar: 'JM',
    },
    {
      id: 4,
      name: 'Sophie Bernard',
      company: 'Creative Studio',
      email: 'sophie@example.com',
      phone: '+33 5 67 89 01 23',
      role: 'Designer',
      location: 'Bordeaux',
      avatar: 'SB',
    },
  ])

  const [searchQuery, setSearchQuery] = useState('')

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.company.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trombinoscope</h2>
          <p className="text-sm text-gray-600 mt-1">Annuaire des collaborateurs</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher par nom ou entreprise..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
        />
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="card">
            {/* Avatar & Name */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-primary-light rounded-lg flex items-center justify-center text-white font-bold text-xl">
                {user.avatar}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.role}</p>
                <p className="text-xs text-primary-light font-medium mt-1">{user.company}</p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-700 border-t pt-4">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <span>{user.location}</span>
              </div>
            </div>

            {/* Button */}
            <button className="w-full btn-primary mt-4">Voir profil</button>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Aucun utilisateur ne correspond à votre recherche</p>
        </div>
      )}
    </div>
  )
}
