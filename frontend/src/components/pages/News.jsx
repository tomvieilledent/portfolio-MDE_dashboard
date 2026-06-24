import React, { useState, useEffect } from 'react'
import { Search, ExternalLink, Bookmark, Newspaper, Tag, Pin, X } from 'lucide-react'
import { api } from '../../lib/api'

const FILTERS = ['Tout', 'Économie', 'Innovation', 'Réglementation', 'Marché']

const categoryColors = {
  Économie: 'bg-green-100 text-green-700',
  Innovation: 'bg-blue-100 text-blue-700',
  Réglementation: 'bg-purple-100 text-purple-700',
  Marché: 'bg-orange-100 text-orange-700',
}

// Backend news : {id, title, source, summary, url, category, published_at}.
// On comble les champs absents côté UI (excerpt/date/pinned) avec des replis.
function mapNews(n) {
  const d = n.published_at || n.created_at
  return {
    id: n.id,
    title: n.title,
    source: n.source || '',
    date: d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    category: n.category || '',
    excerpt: n.summary || '',
    url: n.url || '',
    pinned: false,
  }
}

export default function News() {
  const [newsItems, setNewsItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('Tout')
  const [searchQuery, setSearchQuery] = useState('')
  const [savedIds, setSavedIds] = useState(new Set())

  useEffect(() => {
    let cancelled = false
    api.getNews()
      .then((res) => {
        if (cancelled) return
        const items = res?.items || res?.news || (Array.isArray(res) ? res : [])
        setNewsItems(items.map(mapNews))
      })
      .catch((err) => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const toggleSave = (id) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const savedArticles = newsItems.filter((item) => savedIds.has(item.id))

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

      {loading && <p className="text-gray-400 py-6 text-center">Chargement des actualités…</p>}
      {error && <p className="text-red-500 py-6 text-center">{error}</p>}

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
      {(() => {
        const uniqueSources = [...new Set(newsItems.map((a) => a.source))].length
        const pinnedCount = newsItems.filter((a) => a.pinned).length
        return (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-primary-light rounded-xl p-4 text-white flex items-center gap-3">
              <Newspaper size={28} className="opacity-80" />
              <div>
                <p className="text-2xl font-bold leading-none">{newsItems.length}</p>
                <p className="text-xs opacity-80 mt-1">Articles disponibles</p>
              </div>
            </div>
            <div className="bg-amber-500 rounded-xl p-4 text-white flex items-center gap-3">
              <Bookmark size={28} className="opacity-80" fill="currentColor" />
              <div>
                <p className="text-2xl font-bold leading-none">{savedIds.size}</p>
                <p className="text-xs opacity-80 mt-1">Articles sauvegardés</p>
              </div>
            </div>
            <div className="bg-indigo-500 rounded-xl p-4 text-white flex items-center gap-3">
              <Tag size={28} className="opacity-80" />
              <div>
                <p className="text-2xl font-bold leading-none">{uniqueSources}</p>
                <p className="text-xs opacity-80 mt-1">Sources couvertes</p>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Saved articles */}
      {savedArticles.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark size={16} className="text-amber-600" fill="currentColor" />
            <h3 className="text-sm font-semibold text-amber-800">
              Articles sauvegardés ({savedArticles.length})
            </h3>
          </div>
          <div className="space-y-2">
            {savedArticles.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2 shadow-sm border border-amber-100"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.source} · {item.date}</p>
                </div>
                <button
                  onClick={() => toggleSave(item.id)}
                  className="flex-shrink-0 p-1 rounded hover:bg-amber-100 text-amber-500 transition-colors"
                  title="Retirer"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
              <a
                href={item.url || '#'}
                target={item.url ? '_blank' : undefined}
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 px-4 py-2 bg-primary-light hover:bg-primary text-white text-sm font-medium rounded-lg transition-colors ${item.url ? '' : 'opacity-50 pointer-events-none'}`}
              >
                <ExternalLink size={14} />
                Lire l'article
              </a>
              <button
                onClick={() => toggleSave(item.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  savedIds.has(item.id)
                    ? 'bg-amber-50 border border-amber-300 text-amber-600 hover:bg-amber-100'
                    : 'border border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {savedIds.has(item.id) ? <Bookmark size={14} fill="currentColor" /> : <Bookmark size={14} />}
                {savedIds.has(item.id) ? 'Sauvegardé' : 'Sauvegarder'}
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
