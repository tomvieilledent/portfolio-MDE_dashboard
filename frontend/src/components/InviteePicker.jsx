import React, { useState } from 'react'
import { Search, Check, Users, UserPlus } from 'lucide-react'

const nameOf = (u) =>
  [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email || 'Utilisateur'

// Sélecteur de destinataires d'invitation : case « inviter tout le monde » +
// liste recherchable à cocher. Contrôlé par le parent.
export default function InviteePicker({ users = [], excludeId = null, selected = [], onChange, all = false, onToggleAll }) {
  const [query, setQuery] = useState('')
  const candidates = users.filter((u) => u.id !== excludeId)
  const filtered = candidates.filter((u) => nameOf(u).toLowerCase().includes(query.toLowerCase()))
  const selectedSet = new Set(selected)

  const toggle = (id) => {
    const next = new Set(selectedSet)
    next.has(id) ? next.delete(id) : next.add(id)
    onChange([...next])
  }

  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
        <UserPlus size={13} className="text-gray-400" /> Inviter
      </label>

      <button type="button" onClick={() => onToggleAll(!all)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium mb-2 transition-colors ${
          all ? 'bg-primary-light border-primary-light text-white' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        }`}>
        <Users size={15} /> Inviter tout le monde
        <span className={`ml-auto w-4 h-4 rounded border flex items-center justify-center ${all ? 'bg-white border-white' : 'border-gray-300'}`}>
          {all && <Check size={12} className="text-primary-light" />}
        </span>
      </button>

      {!all && (
        <>
          <div className="relative mb-2">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Rechercher un destinataire…" value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-gray-50" />
          </div>
          {selected.length > 0 && (
            <p className="text-xs text-gray-500 mb-1">{selected.length} destinataire{selected.length > 1 ? 's' : ''} sélectionné{selected.length > 1 ? 's' : ''}</p>
          )}
          <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-50">
            {filtered.length === 0 && <p className="px-3 py-3 text-xs text-gray-400">Aucun utilisateur</p>}
            {filtered.map((u) => {
              const checked = selectedSet.has(u.id)
              return (
                <button key={u.id} type="button" onClick={() => toggle(u.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-left">
                  <span className="flex-1 text-sm text-gray-800 truncate">{nameOf(u)}</span>
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${checked ? 'bg-primary-light border-primary-light' : 'border-gray-300'}`}>
                    {checked && <Check size={12} className="text-white" />}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
