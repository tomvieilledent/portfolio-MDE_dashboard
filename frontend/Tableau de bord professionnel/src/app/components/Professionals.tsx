import { useState } from 'react';
import { User, Mail, Phone, Building2, Search } from 'lucide-react';

interface Professional {
  id: number;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
}

export function Professionals() {
  const [searchQuery, setSearchQuery] = useState('');

  const professionals: Professional[] = [
    { id: 1, name: 'Sophie Dubois', role: 'CEO', company: 'Tech Innovators', email: 'sophie@tech-innovators.fr', phone: '06 12 34 56 78' },
    { id: 2, name: 'Marc Laurent', role: 'Directeur Marketing', company: 'Digital Solutions', email: 'marc@digital-sol.fr', phone: '06 23 45 67 89' },
    { id: 3, name: 'Julie Martin', role: 'CTO', company: 'Green Energy Co.', email: 'julie@greenenergy.fr', phone: '06 34 56 78 90' },
    { id: 4, name: 'Pierre Dupont', role: 'Designer', company: 'Creative Studio', email: 'pierre@creative.fr', phone: '06 45 67 89 01' },
    { id: 5, name: 'Emma Bernard', role: 'CFO', company: 'FinTech Partners', email: 'emma@fintech.fr', phone: '06 56 78 90 12' },
    { id: 6, name: 'Thomas Petit', role: 'Chef de projet', company: 'Health & Wellness', email: 'thomas@health.fr', phone: '06 67 89 01 23' }
  ];

  const filteredProfessionals = professionals.filter(pro =>
    pro.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pro.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pro.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Professionnels</h2>
        <p className="text-gray-600">Répertoire des professionnels de la pépinière</p>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, poste ou entreprise..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfessionals.length > 0 ? (
          filteredProfessionals.map((pro) => (
          <div key={pro.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-2xl font-semibold mb-3 shadow-lg">
                {pro.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-lg font-bold text-gray-800">{pro.name}</h3>
              <p className="text-sm text-teal-600 font-medium">{pro.role}</p>
              <p className="text-sm text-gray-500">{pro.company}</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} className="text-teal-500" />
                <span className="truncate">{pro.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} className="text-green-500" />
                <span>{pro.phone}</span>
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:shadow-md transition-all duration-200 font-medium">
              Contacter
            </button>
          </div>
          ))
        ) : (
          <div className="col-span-3 flex flex-col items-center justify-center py-12 text-gray-400">
            <Search size={64} className="mb-4" />
            <p className="text-lg">Aucun professionnel trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
