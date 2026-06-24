import React, { useState } from 'react'
import { Search, ExternalLink, Bookmark, BarChart2, TrendingUp, Rss } from 'lucide-react'

const FILTERS = ['Tout', 'Économie', 'Innovation', 'Réglementation', 'Marché']

const categoryColors = {
  Économie: 'bg-green-100 text-green-700',
  Innovation: 'bg-blue-100 text-blue-700',
  Réglementation: 'bg-purple-100 text-purple-700',
  Marché: 'bg-orange-100 text-orange-700',
}

const newsItems = [
  {
    id: 1,
    title: 'Nouvelles subventions pour les startups en 2026',
    source: 'Les Échos',
    date: '21 mai 2026',
    category: 'Économie',
    excerpt:
      'Le gouvernement annonce un nouveau dispositif de financement de 500M€ pour soutenir l\'innovation dans les PME et startups françaises.',
    pinned: true,
  },
  {
    id: 2,
    title: 'Intelligence Artificielle : nouvelles réglementations européennes',
    source: 'La Tribune',
    date: '8 mai 2026',
    category: 'Réglementation',
    excerpt:
      "L'UE finalise son cadre réglementaire sur l'IA. Les entreprises ont 18 mois pour se mettre en conformité.",
    pinned: true,
  },
  {
    id: 3,
    title: 'Transition verte : les PME en première ligne',
    source: 'Maddyness',
    date: '3 mai 2026',
    category: 'Innovation',
    excerpt:
      'Les petites et moyennes entreprises sont de plus en plus sollicitées pour adopter des pratiques éco-responsables.',
    pinned: false,
  },
  {
    id: 4,
    title: 'Marché du travail : les tendances 2026',
    source: 'Capital',
    date: '28 avril 2026',
    category: 'Marché',
    excerpt:
      'Analyses des grandes évolutions du marché de l\'emploi en France : télétravail, IA et nouvelles compétences recherchées.',
    pinned: false,
  },
]

export default function News() {
  const [activeFilter, setActiveFilter] = useState('Tout')
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = newsItems.filter((item) => {
    const matchesFilter = activeFilter === 'Tout' || item.category === activeFilter
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Veille Économique</h2>
        <p className="text-sm text-gray-500 mt-1">Actualités et tendances pour les entrepreneurs</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher des actus..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-white"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-primary-light rounded-xl p-4 text-white flex items-center gap-3">
          <BarChart2 size={28} className="opacity-80" />
          <div>
            <p className="text-2xl font-bold leading-none">6</p>
            <p className="text-xs opacity-80 mt-1">Articles disponibles</p>
          </div>
        </div>
        <div className="bg-orange-400 rounded-xl p-4 text-white flex items-center gap-3">
          <TrendingUp size={28} className="opacity-80" />
          <div>
            <p className="text-2xl font-bold leading-none">+12%</p>
            <p className="text-xs opacity-80 mt-1">Tendance Innovation</p>
          </div>
        </div>
        <div className="bg-indigo-500 rounded-xl p-4 text-white flex items-center gap-3">
          <Rss size={28} className="opacity-80" />
          <div>
            <p className="text-2xl font-bold leading-none">8</p>
            <p className="text-xs opacity-80 mt-1">Sources suivies</p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === f
                ? 'bg-primary-light text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-light hover:text-primary-light'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* News items */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    categoryColors[item.category] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {item.category}
                </span>
                <span className="text-xs text-gray-400">{item.source} · {item.date}</span>
              </div>
              {item.pinned && (
                <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
                  Épinglée
                </span>
              )}
            </div>

            <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{item.excerpt}</p>

            <div className="flex gap-3">
              <button className="flex items-center gap-1.5 px-4 py-2 bg-primary-light hover:bg-primary text-white text-sm font-medium rounded-lg transition-colors">
                <ExternalLink size={14} />
                Lire l'article
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-gray-300 text-gray-600 text-sm font-medium rounded-lg transition-colors">
                <Bookmark size={14} />
                Sauvegarder
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">Aucun article ne correspond à votre recherche</p>
          </div>
        )}
      </div>
    </div>
  )
}
