import React, { useState } from 'react'
import { X, GraduationCap, Save, FileText, Tag, Link, Loader2 } from 'lucide-react'

const CATEGORIES = ['Marketing', 'Finance', 'Management', 'Digital']

export default function TrainingFormModal({ training, onClose, onSave }) {
  const isEdit = !!training
  const [form, setForm] = useState({
    title: training?.title || '',
    category: training?.category || 'Marketing',
    description: training?.description || '',
    url: training?.url || '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      // La date et la jauge ne se définissent plus ici : elles relèvent de la
      // programmation d'une session (réservée au super admin).
      await onSave({ ...training, ...form, id: training?.id })
      onClose()
    } catch (err) {
      setError(err?.message || "Échec de l'enregistrement")
      setSubmitting(false)
    }
  }

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

          {/* Lien */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <span className="flex items-center gap-1"><Link size={13} /> Lien de la formation</span>
            </label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://www.exemple.com/formation"
                value={form.url}
                onChange={set('url')}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              {form.url && (
                <a
                  href={form.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600 transition-colors"
                  title="Tester le lien"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link size={15} />
                </a>
              )}
            </div>
            {form.url && (
              <p className="mt-1 text-xs text-gray-400 truncate">{form.url}</p>
            )}
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

          <p className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
            Les dates et la jauge d'inscrits se définissent lors de la
            <span className="font-medium text-gray-500"> programmation d'une session</span> (réservée au super admin).
          </p>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

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
              disabled={submitting}
              className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isEdit ? 'Enregistrer' : 'Créer la formation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
