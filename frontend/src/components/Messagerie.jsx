import React, { useState, useRef } from 'react'
import { X, Search, Send, ArrowLeft, Paperclip, FileText, Image as ImageIcon } from 'lucide-react'

const conversations = [
  {
    id: 1,
    name: 'Sophie Dubois',
    avatar: 'SD',
    color: 'bg-green-600',
    lastMessage: 'Bonjour, pouvez-vous me transmettre les documents pour la réunion ?',
    time: '10 min',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Marc Laurent',
    avatar: 'ML',
    color: 'bg-blue-600',
    lastMessage: 'La réunion est confirmée pour demain à 14h',
    time: '30 min',
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: 'Innovation Hub',
    avatar: 'IH',
    color: 'bg-purple-600',
    lastMessage: 'Nouvelle formation disponible : Marketing Digital',
    time: '2h',
    unread: 0,
    online: false,
  },
  {
    id: 4,
    name: 'Julie Martin',
    avatar: 'JM',
    color: 'bg-orange-500',
    lastMessage: 'Merci pour le compte rendu, très complet !',
    time: 'Hier',
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: 'Pierre Dupont',
    avatar: 'PD',
    color: 'bg-teal-600',
    lastMessage: 'On se voit demain pour le point hebdo ?',
    time: 'Hier',
    unread: 0,
    online: false,
  },
]

const initialMessages = {
  1: [
    { id: 1, from: 'them', text: 'Bonjour, pouvez-vous me transmettre les documents pour la réunion de demain ?', time: '09:45' },
    { id: 2, from: 'me', text: 'Bien sûr, je vous les envoie de suite.', time: '09:47' },
    { id: 3, from: 'them', text: 'Merci beaucoup !', time: '09:48' },
    { id: 4, from: 'them', text: "J'en avais besoin avant ce soir idéalement.", time: '09:49' },
  ],
  2: [
    { id: 1, from: 'them', text: 'Bonjour, la réunion de demain est-elle maintenue ?', time: '14:00' },
    { id: 2, from: 'me', text: 'Oui, tout est confirmé !', time: '14:05' },
    { id: 3, from: 'them', text: 'La réunion est confirmée pour demain à 14h', time: '14:06' },
  ],
  3: [
    { id: 1, from: 'them', text: 'Nouvelle formation disponible : Marketing Digital', time: '11:00' },
    { id: 2, from: 'them', text: 'Les inscriptions sont ouvertes jusqu\'au 30 juin.', time: '11:01' },
  ],
  4: [
    { id: 1, from: 'me', text: 'Voici le compte rendu de la réunion d\'hier.', time: '08:30' },
    { id: 2, from: 'them', text: 'Merci pour le compte rendu, très complet !', time: '09:15' },
  ],
  5: [
    { id: 1, from: 'them', text: 'On se voit demain pour le point hebdo ?', time: '17:45' },
  ],
}

export default function Messagerie({ onClose, initialContact = null }) {
  const getInitialConv = () => {
    if (!initialContact) return null
    const conv = conversations.find((c) =>
      c.name.toLowerCase().includes(initialContact.toLowerCase())
    )
    return conv ? conv.id : null
  }

  const [selectedConv, setSelectedConv] = useState(getInitialConv)
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState(initialMessages)
  const [attachments, setAttachments] = useState([]) // { name, size, type, url }
  const fileInputRef = useRef(null)

  const filteredConvs = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeConv = conversations.find((c) => c.id === selectedConv)
  const activeMessages = messages[selectedConv] || []

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const newAttachments = files.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      url: URL.createObjectURL(f),
    }))
    setAttachments((prev) => [...prev, ...newAttachments])
    e.target.value = ''
  }

  const removeAttachment = (index) => {
    setAttachments((prev) => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  const sendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return
    if (!selectedConv) return
    const msg = {
      id: Date.now(),
      from: 'me',
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    }
    setMessages((prev) => ({ ...prev, [selectedConv]: [...(prev[selectedConv] || []), msg] }))
    setNewMessage('')
    setAttachments([])
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          {selectedConv && (
            <button
              onClick={() => setSelectedConv(null)}
              className="p-1 hover:bg-gray-100 rounded-lg mr-1 md:hidden"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Messagerie interne</h1>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
        >
          <X size={22} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — conversation list */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col flex-shrink-0 ${
            selectedConv ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-gray-50"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConvs.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv.id)}
                className={`w-full flex items-start gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${
                  selectedConv === conv.id ? 'bg-green-50 border-l-4 border-l-primary-light' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm ${conv.color}`}
                  >
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-sm text-gray-900 truncate">{conv.name}</span>
                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="ml-2 flex-shrink-0 w-5 h-5 bg-primary-light rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right panel — message thread */}
        <div
          className={`flex-1 flex flex-col ${
            selectedConv ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedConv && activeConv ? (
            <>
              {/* Conv header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${activeConv.color}`}
                >
                  {activeConv.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{activeConv.name}</p>
                  <p className="text-xs text-gray-500">
                    {activeConv.online ? (
                      <span className="text-green-500">● En ligne</span>
                    ) : (
                      'Hors ligne'
                    )}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
                {activeMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.from === 'them' && (
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2 flex-shrink-0 self-end ${activeConv.color}`}
                      >
                        {activeConv.avatar}
                      </div>
                    )}
                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl text-sm overflow-hidden ${
                        msg.from === 'me'
                          ? 'bg-primary-light text-white rounded-br-sm'
                          : 'bg-white text-gray-900 shadow-sm rounded-bl-sm'
                      }`}
                    >
                      {/* Pièces jointes */}
                      {msg.attachments?.map((att, i) => (
                        att.type.startsWith('image/') ? (
                          <img
                            key={i}
                            src={att.url}
                            alt={att.name}
                            className="max-w-full rounded-xl mb-1 block"
                            style={{ maxHeight: 200, objectFit: 'cover' }}
                          />
                        ) : (
                          <a
                            key={i}
                            href={att.url}
                            download={att.name}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-1 ${
                              msg.from === 'me'
                                ? 'bg-white/20 hover:bg-white/30'
                                : 'bg-gray-100 hover:bg-gray-200'
                            } transition-colors`}
                          >
                            <FileText size={16} className="flex-shrink-0" />
                            <span className="text-xs truncate flex-1">{att.name}</span>
                            <span className="text-xs opacity-60 flex-shrink-0">{formatSize(att.size)}</span>
                          </a>
                        )
                      ))}
                      {msg.text && (
                        <p className="px-4 pt-2.5 pb-1">{msg.text}</p>
                      )}
                      <p className={`text-xs px-4 pb-2.5 ${msg.from === 'me' ? 'text-green-100' : 'text-gray-400'}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <div className="px-6 py-4 border-t border-gray-200 bg-white">
                {/* Prévisualisation pièces jointes */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachments.map((att, i) => (
                      <div key={i} className="relative group">
                        {att.type.startsWith('image/') ? (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                            <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeAttachment(i)}
                              className="absolute top-0.5 right-0.5 w-5 h-5 bg-gray-900/70 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2 pr-7 relative max-w-[180px]">
                            <FileText size={15} className="text-gray-500 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">{att.name}</p>
                              <p className="text-xs text-gray-400">{formatSize(att.size)}</p>
                            </div>
                            <button
                              onClick={() => removeAttachment(i)}
                              className="absolute top-1 right-1.5 text-gray-400 hover:text-gray-700"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {/* Bouton pièce jointe */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-primary-light hover:bg-gray-100 rounded-full transition-colors"
                    title="Joindre un fichier"
                  >
                    <Paperclip size={20} />
                  </button>

                  <input
                    type="text"
                    placeholder="Écrire un message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-light bg-gray-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() && attachments.length === 0}
                    className="w-10 h-10 flex-shrink-0 bg-primary-light hover:bg-primary disabled:opacity-40 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <svg viewBox="0 0 24 24" width="64" height="64" fill="currentColor" className="mb-4 opacity-30">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
              </svg>
              <p className="text-lg font-medium">Sélectionnez une conversation</p>
              <p className="text-sm mt-1">Choisissez un contact pour commencer à échanger</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
