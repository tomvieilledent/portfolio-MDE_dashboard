import React, { useState } from 'react'
import { Newspaper, Calendar, ExternalLink } from 'lucide-react'

export default function News() {
  const [newsItems] = useState([
    {
      id: 1,
      title: 'L\'IA transforme les PME françaises',
      source: 'Les Échos',
      date: '25 mai 2026',
      category: 'Technologie',
      excerpt:
        'Nouvelle étude révélant comment les petites entreprises adoptent les solutions IA pour améliorer leur productivité.',
      url: '#',
    },
    {
      id: 2,
      title: 'Transition énergétique : les objectifs 2025',
      source: 'Énergie Plus',
      date: '24 mai 2026',
      category: 'Énergie',
      excerpt:
        'L\'Union européenne annonce les nouveaux objectifs de transition énergétique pour les années à venir.',
      url: '#',
    },
    {
      id: 3,
      title: 'Startup innovantes : les 10 à suivre',
      source: 'Maddyness',
      date: '23 mai 2026',
      category: 'Startup',
      excerpt:
        'Un classement des 10 startups les plus prometteuses selon les investisseurs et les experts du secteur.',
      url: '#',
    },
    {
      id: 4,
      title: 'Marché du travail : quelles tendances ?',
      source: 'Capital',
      date: '22 mai 2026',
      category: 'Emploi',
      excerpt:
        'Analyses des tendances principales du marché de l\'emploi en France et en Europe pour l\'année 2026.',
      url: '#',
    },
  ])

  const categoryColors = {
    Technologie: 'bg-blue-100 text-blue-800',
    Énergie: 'bg-green-100 text-green-800',
    Startup: 'bg-purple-100 text-purple-800',
    Emploi: 'bg-orange-100 text-orange-800',
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Veille économique</h2>
        <p className="text-sm text-gray-600 mt-1">Actualités et tendances économiques</p>
      </div>

      {/* News Items */}
      <div className="space-y-4">
        {newsItems.map((item) => (
          <div key={item.id} className="card hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Newspaper className="text-primary-light" size={24} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title & Category */}
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-bold text-gray-900 text-base leading-tight flex-1">
                    {item.title}
                  </h3>
                  <span
                    className={`badge text-xs whitespace-nowrap ${
                      categoryColors[item.category] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 mb-3">{item.excerpt}</p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-700">{item.source}</span>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {item.date}
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-primary-light" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
