import React, { useState } from 'react'
import { X, GraduationCap, Clock, Calendar, Users, Save, FileText, Tag } from 'lucide-react'

const CATEGORIES = ['Marketing', 'Finance', 'Management', 'Digital']

export default function TrainingFormModal({ training, onClose, onSave }) {
  const isEdit = !!training
  const [form, setForm] = useState({
    title: training?.title || '',
    category: training?.category || 'Marketing',
    description: training?.description || '',
    duration: training?.duration || '',
    endDate: training?.endDate || '',
    capacity: training?.capacity ?? 15,
    enrolled: training?.enrolled ?? 0,
  })

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  const setNum = (field) => (e) => setForm((prev) => ({ ...prev, [field]: Number(e.target.value) }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...training, ...form, id: training?.id || Date.now() })
    onClose()
  }

  const pct = Math.min(100, Math.round((form.enrolled / form.capacity) * 100)) || 0
  const barColor = form.enrolled >= form.capacity ? 'bg-red-400' : pct >= 75 ? 'bg-orange-400' : 'bg-purple-400'

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-purple-500 px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEdit ? 'Modifier la formation' : 'Créer une formation'}
              </h2>
              <p className="text-sm text-white/80">
                {isEdit ? training.title : 'Nouvelle formation dans le catalogue'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1"><FileText size={13} /> Titre *</span>
            </label>
            <input
              required
              type="text"
              placeholder="Ex : Marketing Digital 2026"
              value={form.title}
              onChange={set('title')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1"><Tag size={13} /> Catégorie *</span>
            </label>
            <select
              value={form.category}
              onChange={set('category')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Décrivez le contenu et les objectifs de la formation…"
              value={form.description}
              onChange={set('description')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Durée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><Clock size={13} /> Durée</span>
              </label>
              <input
                type="text"
                placeholder="Ex : 3 jours"
                value={form.duration}
                onChange={set('duration')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Date limite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><Calendar size={13} /> Date limite</span>
              </label>
              <input
                type="text"
                placeholder="Ex : 15 Mai 2026"
                value={form.endDate}
                onChange={set('endDate')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Inscrits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><Users size={13} /> Inscrits</span>
              </label>
              <input
                type="number"
                min={0}
                max={form.capacity}
                value={form.enrolled}
                onChange={setNum('enrolled')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {/* Capacité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1"><Users size={13} /> Capacité max</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.capacity}
                onChange={setNum('capacity')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Aperçu jauge */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2 text-xs text-gray-500">
              <span>Aperçu jauge d'inscrits</span>
              <span className="font-semibold text-gray-700">{form.enrolled} / {form.capacity} — {pct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Save size={16} />
              {isEdit ? 'Enregistrer' : 'Créer la formation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
