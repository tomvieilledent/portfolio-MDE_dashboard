import { useState } from 'react';
import { GraduationCap, Clock, Users, Calendar, Search } from 'lucide-react';

interface TrainingCourse {
  id: number;
  title: string;
  category: string;
  duration: string;
  participants: number;
  startDate: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  description: string;
}

export function Training() {
  const [searchQuery, setSearchQuery] = useState('');

  const courses: TrainingCourse[] = [
    {
      id: 1,
      title: 'Marketing Digital 2026',
      category: 'Marketing',
      duration: '3 jours',
      participants: 12,
      startDate: '15 Mai 2026',
      level: 'Intermédiaire',
      description: 'Stratégies marketing digital pour entrepreneurs'
    },
    {
      id: 2,
      title: 'Gestion Financière pour PME',
      category: 'Finance',
      duration: '2 jours',
      participants: 8,
      startDate: '22 Mai 2026',
      level: 'Débutant',
      description: 'Bases de la gestion financière pour petites entreprises'
    },
    {
      id: 3,
      title: 'Leadership et Management',
      category: 'Management',
      duration: '4 jours',
      participants: 15,
      startDate: '5 Juin 2026',
      level: 'Avancé',
      description: 'Développer ses compétences en leadership'
    },
    {
      id: 4,
      title: 'Transformation Digitale',
      category: 'Technologie',
      duration: '3 jours',
      participants: 10,
      startDate: '12 Juin 2026',
      level: 'Intermédiaire',
      description: 'Accompagner la transformation digitale de son entreprise'
    },
    {
      id: 5,
      title: 'Communication d\'Entreprise',
      category: 'Communication',
      duration: '2 jours',
      participants: 14,
      startDate: '19 Juin 2026',
      level: 'Débutant',
      description: 'Techniques de communication efficace en entreprise'
    },
    {
      id: 6,
      title: 'Innovation et Créativité',
      category: 'Innovation',
      duration: '3 jours',
      participants: 9,
      startDate: '26 Juin 2026',
      level: 'Intermédiaire',
      description: 'Stimuler l\'innovation et la créativité en équipe'
    }
  ];

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.level.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant': return 'bg-green-100 text-green-700';
      case 'Intermédiaire': return 'bg-orange-100 text-orange-700';
      case 'Avancé': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Catalogue de Formations</h2>
        <p className="text-gray-600">Formations professionnelles pour entrepreneurs</p>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, catégorie ou niveau..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-green-500 to-teal-600 p-3 rounded-xl">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600">{course.category}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                {course.level}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">{course.description}</p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-amber-500" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} className="text-teal-500" />
                <span>{course.participants} inscrits</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className="text-orange-500" />
                <span>{course.startDate}</span>
              </div>
            </div>

            <button className="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg hover:shadow-md transition-all duration-200 font-medium">
              S'inscrire
            </button>
          </div>
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 text-gray-400">
            <Search size={64} className="mb-4" />
            <p className="text-lg">Aucune formation trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
