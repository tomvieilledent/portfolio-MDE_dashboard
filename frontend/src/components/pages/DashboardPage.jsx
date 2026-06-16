import React from 'react'
import { TrendingUp, Users, BookOpen, Newspaper } from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    { label: 'Entreprises actives', value: '4', icon: '🏢', color: 'bg-blue-100' },
    { label: 'Collaborateurs', value: '41', icon: '👥', color: 'bg-green-100' },
    { label: 'Formations disponibles', value: '4', icon: '📚', color: 'bg-purple-100' },
    { label: 'Actualités', value: '12', icon: '📰', color: 'bg-orange-100' },
  ]

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Bienvenue sur le Tableau de bord</h2>
        <p className="text-gray-600 mt-2">Vue d'ensemble de la Maison de l'Économie</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Access */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Accès rapide</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors">
              → Consulter les entreprises
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors">
              → Voir l'annuaire collaborateurs
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors">
              → Consulter les formations
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors">
              → Lire les actualités
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Activité récente</h3>
          <div className="space-y-3">
            <div className="pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">Nouvelle entreprise ajoutée</p>
              <p className="text-xs text-gray-500">Creative Studio - il y a 2 jours</p>
            </div>
            <div className="pb-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">Formation créée</p>
              <p className="text-xs text-gray-500">Design Thinking Workshop - il y a 1 semaine</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Nouvel utilisateur inscrit</p>
              <p className="text-xs text-gray-500">Sophie Bernard - il y a 3 jours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
