import { useState } from 'react';
import { Building2, MapPin, Calendar, Edit, CheckCircle, XCircle, Search } from 'lucide-react';

interface Company {
  id: number;
  name: string;
  sector: string;
  location: string;
  joinDate: string;
  status: 'active' | 'inactive';
  employees: number;
}

export function Companies() {
  const [searchQuery, setSearchQuery] = useState('');

  const companies: Company[] = [
    { id: 1, name: 'Tech Innovators', sector: 'Technologies', location: 'Paris', joinDate: '2024', status: 'active', employees: 8 },
    { id: 2, name: 'Digital Solutions', sector: 'Marketing Digital', location: 'Lyon', joinDate: '2025', status: 'active', employees: 12 },
    { id: 3, name: 'Green Energy Co.', sector: 'Énergie Renouvelable', location: 'Nantes', joinDate: '2023', status: 'active', employees: 15 },
    { id: 4, name: 'Creative Studio', sector: 'Design & Communication', location: 'Bordeaux', joinDate: '2025', status: 'active', employees: 6 },
    { id: 5, name: 'FinTech Partners', sector: 'Finance', location: 'Toulouse', joinDate: '2022', status: 'inactive', employees: 10 },
    { id: 6, name: 'Health & Wellness', sector: 'Santé', location: 'Marseille', joinDate: '2024', status: 'active', employees: 9 }
  ];

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Entreprises</h2>
          <p className="text-gray-600">Gestion des entreprises de la pépinière</p>
        </div>
        <button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2">
          <Building2 size={20} />
          <span className="font-medium">Ajouter une entreprise</span>
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, secteur ou localisation..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
          <div key={company.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-xl shadow-md">
                  <Building2 className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.sector}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {company.status === 'active' ? (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle size={14} />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                    <XCircle size={14} />
                    Inactive
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-orange-500" />
                <span>{company.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className="text-teal-500" />
                <span>Membre depuis {company.joinDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 size={16} className="text-orange-500" />
                <span>{company.employees} employés</span>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:shadow-md transition-all duration-200">
              <Edit size={16} />
              <span className="font-medium">Modifier la fiche</span>
            </button>
          </div>
          ))
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-12 text-gray-400">
            <Search size={64} className="mb-4" />
            <p className="text-lg">Aucune entreprise trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
}
