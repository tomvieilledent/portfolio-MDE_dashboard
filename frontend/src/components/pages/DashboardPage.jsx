import React from 'react'
import { Building2, Users, BookOpen, TrendingUp } from 'lucide-react'

const stats = [
  { label: 'Entreprises actives', value: '24', Icon: Building2, bg: 'bg-orange-100', color: 'text-orange-400' },
  { label: 'Professionnels', value: '156', Icon: Users, bg: 'bg-blue-100', color: 'text-blue-500' },
  { label: 'Formations disponibles', value: '18', Icon: BookOpen, bg: 'bg-purple-100', color: 'text-purple-500' },
  { label: 'Taux de réussite', value: '87%', Icon: TrendingUp, bg: 'bg-green-100', color: 'text-primary' },
]

const activities = [
  { photo: 'https://picsum.photos/seed/techinnovators/40', name: 'Tech Innovators', action: 'Mise à jour de fiche', time: 'Il y a 2h' },
  { photo: 'https://picsum.photos/seed/digitalsolutions/40', name: 'Digital Solutions', action: 'Nouvelle inscription', time: 'Il y a 5h' },
  { photo: 'https://picsum.photos/seed/greenenergy/40', name: 'Green Energy Co.', action: 'Formation complétée', time: 'Hier' },
  { photo: 'https://picsum.photos/seed/creativestudio/40', name: 'Creative Studio', action: 'Mise à jour de fiche', time: 'Hier' },
]

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Tableau de bord</h2>
        <p className="text-gray-500 mt-1">Vue d'ensemble de la pépinière d'entreprises</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mb-4`}>
              <stat.Icon size={22} className={stat.color} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Activités récentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5">Activités récentes</h3>
        <div className="divide-y divide-gray-100">
          {activities.map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <img
                src={item.photo}
                alt={item.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.action}</p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
