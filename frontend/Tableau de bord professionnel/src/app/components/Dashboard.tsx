import { Building2, Users, GraduationCap, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { label: 'Entreprises actives', value: '24', icon: Building2, color: 'from-orange-500 to-orange-600' },
    { label: 'Professionnels', value: '156', icon: Users, color: 'from-teal-500 to-teal-600' },
    { label: 'Formations disponibles', value: '18', icon: GraduationCap, color: 'from-amber-500 to-amber-600' },
    { label: 'Taux de réussite', value: '87%', icon: TrendingUp, color: 'from-cyan-500 to-cyan-600' }
  ];

  const recentActivities = [
    { company: 'Tech Innovators', action: 'Mise à jour de fiche', time: 'Il y a 2h' },
    { company: 'Digital Solutions', action: 'Nouvelle inscription', time: 'Il y a 5h' },
    { company: 'Green Energy Co.', action: 'Formation complétée', time: 'Hier' },
    { company: 'Creative Studio', action: 'Mise à jour de fiche', time: 'Hier' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tableau de bord</h2>
        <p className="text-gray-600">Vue d'ensemble de la pépinière d'entreprises</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 hover:shadow-[0_20px_50px_rgb(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-lg shadow-lg`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activités récentes */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Activités récentes</h3>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-coral-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {activity.company.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{activity.company}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
