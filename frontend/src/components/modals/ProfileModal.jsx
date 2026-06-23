import React, { useState, useRef } from 'react'
import { X, Camera, User, Mail, Phone, FileText, Upload, Trash2, Save, Shield } from 'lucide-react'

const ROLE_LABELS = { admin: 'Super Administrateur', patron: 'Patron', salarie: 'Salarié' }
const ROLE_COLORS = { admin: 'bg-primary-light/10 text-primary-light', patron: 'bg-purple-100 text-purple-600', salarie: 'bg-gray-100 text-gray-600' }

export default function ProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState({
    name:  profile.name  || '',
    email: profile.email || '',
    phone: profile.phone || '',
    bio:   profile.bio   || '',
    photo: profile.photo || null,
  })
  const [files, setFiles] = useState(profile.files || [])
  const [dragOver, setDragOver] = useState(false)

  const photoRef = useRef()
  const fileRef  = useRef()

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  /* ── Photo ── */
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setForm((prev) => ({ ...prev, photo: url }))
  }

  /* ── Fichiers attachés ── */
  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList).map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleFileInput = (e) => addFiles(e.target.files)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...profile, ...form, files })
    onClose()
  }

  const initials = form.name
    ? form.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary-light px-6 py-5 flex items-start justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Mon profil</h2>
              <p className="text-sm text-white/80">Modifier vos informations personnelles</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-6 space-y-5">

            {/* Avatar + rôle */}
            <div className="flex items-center gap-4">
              <div className="relative flex-shrink-0">
                {form.photo ? (
                  <img src={form.photo} alt="avatar" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-md">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => photoRef.current.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition-colors"
                  title="Changer la photo"
                >
                  <Camera size={13} className="text-gray-600" />
                </button>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">{form.name || 'Votre nom'}</p>
                <span className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[profile.role] || 'bg-gray-100 text-gray-600'}`}>
                  <Shield size={10} /> {ROLE_LABELS[profile.role] || profile.role}
                </span>
              </div>
            </div>

            {/* Nom */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <User size={13} className="text-gray-400" /> Nom complet
              </label>
              <input type="text" placeholder="Prénom Nom" value={form.name} onChange={set('name')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Mail size={13} className="text-gray-400" /> Email
              </label>
              <input type="email" placeholder="email@exemple.fr" value={form.email} onChange={set('email')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            </div>

            {/* Téléphone */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <Phone size={13} className="text-gray-400" /> Téléphone
              </label>
              <input type="tel" placeholder="+33 6 00 00 00 00" value={form.phone} onChange={set('phone')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light" />
            </div>

            {/* Bio */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <FileText size={13} className="text-gray-400" /> Bio <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <textarea rows={2} placeholder="Quelques mots sur vous…" value={form.bio} onChange={set('bio')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light resize-none" />
            </div>

            {/* Zone drop fichiers */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                <Upload size={13} className="text-gray-400" /> Documents <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                className={`border-2 border-dashed rounded-xl px-4 py-5 text-center cursor-pointer transition-colors ${
                  dragOver ? 'border-primary-light bg-primary-light/5' : 'border-gray-200 hover:border-primary-light hover:bg-gray-50'
                }`}
              >
                <Upload size={20} className="mx-auto mb-1.5 text-gray-300" />
                <p className="text-sm text-gray-500">Glissez vos fichiers ici ou <span className="text-primary-light font-medium">parcourir</span></p>
                <p className="text-xs text-gray-400 mt-0.5">PDF, images, Word…</p>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileInput} />
              </div>

              {files.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={14} className="text-gray-400 flex-shrink-0" />
                        <a href={f.url} download={f.name} className="truncate text-gray-700 hover:text-primary-light hover:underline">{f.name}</a>
                        <span className="text-xs text-gray-400 flex-shrink-0">{formatSize(f.size)}</span>
                      </div>
                      <button type="button" onClick={() => removeFile(i)}
                        className="ml-2 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors">
              Annuler
            </button>
            <button type="submit"
              className="flex-1 bg-primary-light hover:bg-primary text-white font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              <Save size={15} /> Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
