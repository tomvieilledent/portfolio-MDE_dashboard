import { useState } from 'react';
import { Newspaper, TrendingUp, AlertCircle, Calendar, ExternalLink, Search, Bookmark } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  source: string;
  category: 'economie' | 'innovation' | 'reglementation' | 'marche';
  date: string;
  excerpt: string;
  url: string;
  importance: 'high' | 'medium' | 'low';
}

export function EconomicWatch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const articles: Article[] = [
    {
      id: 1,
      title: 'Nouvelles subventions pour les startups en 2026',
      source: 'Les Échos',
      category: 'economie',
      date: '7 Mai 2026',
      excerpt: 'Le gouvernement annonce un nouveau plan de financement de 500M€ pour soutenir l\'innovation dans les PME et startups françaises.',
      url: '#',
      importance: 'high'
    },
    {
      id: 2,
      title: 'Intelligence Artificielle : nouvelles réglementations européennes',
      source: 'La Tribune',
      category: 'reglementation',
      date: '6 Mai 2026',
      excerpt: 'L\'UE finalise son cadre réglementaire pour l\'IA. Les entreprises ont 18 mois pour se mettre en conformité.',
      url: '#',
      importance: 'high'
    },
    {
      id: 3,
      title: 'Le marché des énergies renouvelables en forte croissance',
      source: 'Le Figaro',
      category: 'marche',
      date: '5 Mai 2026',
      excerpt: 'Les investissements dans les énergies vertes ont augmenté de 35% en 2025, ouvrant de nouvelles opportunités.',
      url: '#',
      importance: 'medium'
    },
    {
      id: 4,
      title: 'Innovation : la France dans le top 10 mondial',
      source: 'BFM Business',
      category: 'innovation',
      date: '4 Mai 2026',
      excerpt: 'La France grimpe à la 8ème place du classement mondial de l\'innovation grâce à ses pépinières d\'entreprises.',
      url: '#',
      importance: 'medium'
    },
    {
      id: 5,
      title: 'Réforme fiscale pour les TPE : ce qui change en 2026',
      source: 'Le Monde',
      category: 'reglementation',
      date: '3 Mai 2026',
      excerpt: 'Nouvelles mesures fiscales avantageuses pour les très petites entreprises. Détails et calendrier d\'application.',
      url: '#',
      importance: 'high'
    },
    {
      id: 6,
      title: 'Digitalisation : 80% des PME ont franchi le cap',
      source: 'Les Échos',
      category: 'innovation',
      date: '2 Mai 2026',
      excerpt: 'Une étude révèle que la majorité des PME françaises ont adopté des outils digitaux pour leur gestion.',
      url: '#',
      importance: 'low'
    }
  ];

  const categories = [
    { id: 'all', label: 'Tout', color: 'gray' },
    { id: 'economie', label: 'Économie', color: 'blue' },
    { id: 'innovation', label: 'Innovation', color: 'purple' },
    { id: 'reglementation', label: 'Réglementation', color: 'orange' },
    { id: 'marche', label: 'Marché', color: 'green' }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
          <AlertCircle size={12} />
          Prioritaire
        </span>;
      case 'medium':
        return <span className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
          Important
        </span>;
      case 'low':
        return <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
          Info
        </span>;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'economie': return 'bg-blue-100 text-blue-700';
      case 'innovation': return 'bg-purple-100 text-purple-700';
      case 'reglementation': return 'bg-orange-100 text-orange-700';
      case 'marche': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Veille Économique</h2>
        <p className="text-gray-600">Actualités et tendances pour les entrepreneurs</p>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher dans les actualités..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-3">
            <Newspaper size={32} />
            <div>
              <p className="text-2xl font-bold">{articles.length}</p>
              <p className="text-sm opacity-90">Articles cette semaine</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-3">
            <TrendingUp size={32} />
            <div>
              <p className="text-2xl font-bold">+12%</p>
              <p className="text-sm opacity-90">Tendance innovation</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-3">
            <AlertCircle size={32} />
            <div>
              <p className="text-2xl font-bold">{articles.filter(a => a.importance === 'high').length}</p>
              <p className="text-sm opacity-90">Articles prioritaires</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="space-y-4">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => (
            <div key={article.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-xl shadow-md">
                    <Newspaper className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800 flex-1">{article.title}</h3>
                      {getImportanceBadge(article.importance)}
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                        {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">{article.source}</span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar size={14} />
                        {article.date}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{article.excerpt}</p>
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-md transition-all duration-200 text-sm font-medium">
                        <ExternalLink size={16} />
                        Lire l'article
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium">
                        <Bookmark size={16} />
                        Sauvegarder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Search size={64} className="mb-4" />
            <p className="text-lg">Aucun article trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
