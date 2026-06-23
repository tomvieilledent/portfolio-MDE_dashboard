import React, { useState } from 'react'
import { X, Building2, MapPin, Calendar, Users, Save, Hash, Link } from 'lucide-react'

export default function CompanyModal({ company, onClose, onSave }) {
  const isEdit = !!company
  const [form, setForm] = useState({
    name:      company?.name      || '',
    sector:    company?.sector    || '',
    siren:     company?.siren     || '',
    location:  company?.location  || '',
    joinDate:  company?.joinDate  || '',
    employees: company?.employees || '',
    status:    company?.status    || 'Active',
    url:         company?.url         || '',
    description: company?.description || '',
  })

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave?.({ ...company, ...form, id: company?.id || Date.now() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary-light px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEdit ? 'Modifier la fiche' : 'Ajouter une entreprise'}
              </h2>
              <p className="text-sm text-white/80">
                {isEdit ? company.name : 'Nouvelle entreprise dans la pépinière'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom de l'entreprise *</label>
            <input required type="text" placeholder="Ex : Tech Innovators"
              value={form.name} onChange={set('name')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
          </div>

          {/* SIREN */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1"><Hash size={13} /> Numéro SIREN</span>
            </label>
            <input type="text" placeholder="Ex : 882 345 671" maxLength={11}
              value={form.siren} onChange={set('siren')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-light" />
          </div>

          {/* Secteur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Secteur d'activité *</label>
            <input required type="text" placeholder="Ex : Technologies, Marketing Digital…"
              value={form.sector} onChange={set('sector')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea rows={3} placeholder="Activité, spécialité, points forts…"
              value={form.description} onChange={set('description')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light resize-none" />
          </div>

          {/* Site web */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1"><Link size={13} /> Site web</span>
            </label>
            <input type="url" placeholder="https://www.exemple.com"
              value={form.url} onChange={set('url')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><MapPin size={13} /> Localisation</span>
              </label>
              <input type="text" placeholder="Ville"
                value={form.location} onChange={set('location')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            </div>

            {/* Employés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><Users size={13} /> Employés</span>
              </label>
              <input type="text" placeholder="Ex : 8 employés"
                value={form.employees} onChange={set('employees')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Membre depuis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><Calendar size={13} /> Membre depuis</span>
              </label>
              <input type="text" placeholder="Ex : Membre depuis 2024"
                value={form.joinDate} onChange={set('joinDate')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Statut</label>
              <select value={form.status} onChange={set('status')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light bg-white">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="En attente">En attente</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition-colors text-sm">
              Annuler
            </button>
            <button type="submit"
              className="flex-1 bg-primary-light hover:bg-primary text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
              <Save size={16} />
              {isEdit ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
