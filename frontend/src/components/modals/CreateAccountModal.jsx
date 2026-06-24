import React, { useState } from 'react'
import { X, UserPlus, Mail, User, Building2, Shield } from 'lucide-react'

const COMPANIES = ['Tech Innovators', 'Digital Solutions', 'Green Energy Co.', 'Creative Studio']

export default function CreateAccountModal({ forRole, onClose, onSuccess }) {
  // forRole: 'patron' (admin creates patron) | 'salarie' (patron creates employee)
  const isCreatingPatron = forRole === 'patron'

  const [form, setForm] = useState({ name: '', email: '', company: COMPANIES[0], role: isCreatingPatron ? 'Dirigeant' : 'Employé' })
  const [sent, setSent] = useState(false)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setTimeout(() => {
      onSuccess?.({ ...form, status: 'En attente', id: Date.now() })
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={`px-6 py-5 flex items-start justify-between ${isCreatingPatron ? 'bg-primary-light' : 'bg-purple-500'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <UserPlus size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isCreatingPatron ? 'Créer un compte Patron' : 'Créer un compte Salarié'}
              </h2>
              <p className="text-sm text-white/80">
                {isCreatingPatron ? 'Un email d\'activation sera envoyé' : 'Le salarié recevra un lien d\'activation'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5">
            <X size={20} />
          </button>
        </div>

        {sent ? (
          /* État "email envoyé" */
          <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail size={28} className="text-green-500" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">Email d'activation envoyé !</p>
              <p className="text-sm text-gray-500 mt-1">
                Un lien a été envoyé à <span className="font-medium text-gray-700">{form.email}</span>.<br />
                Le compte sera actif après validation.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            {/* Nom */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <User size={13} className="text-gray-400" /> Nom complet *
              </label>
              <input required type="text" placeholder="Prénom Nom"
                value={form.name} onChange={set('name')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Mail size={13} className="text-gray-400" /> Adresse email *
              </label>
              <input required type="email" placeholder="prenom.nom@entreprise.fr"
                value={form.email} onChange={set('email')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            </div>

            {/* Entreprise */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Building2 size={13} className="text-gray-400" /> Entreprise *
              </label>
              <select value={form.company} onChange={set('company')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light bg-white">
                {COMPANIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Rôle/Poste */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Shield size={13} className="text-gray-400" /> {isCreatingPatron ? 'Rôle' : 'Poste'}
              </label>
              <input type="text"
                placeholder={isCreatingPatron ? 'Ex : Dirigeant, Co-fondateur…' : 'Ex : Développeur, Commercial…'}
                value={form.role} onChange={set('role')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors">
                Annuler
              </button>
              <button type="submit"
                className={`flex-1 text-white font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 ${isCreatingPatron ? 'bg-primary-light hover:bg-primary' : 'bg-purple-500 hover:bg-purple-600'}`}>
                <Mail size={15} /> Envoyer l'invitation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
