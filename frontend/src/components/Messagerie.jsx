import React, { useState, useRef, useEffect, useMemo } from 'react'
import { X, Search, Send, ArrowLeft } from 'lucide-react'
import { api } from '../lib/api'
import { connectSocket, getSocket } from '../lib/socket'
import { useAuth, displayName, initialsOf } from '../context/AuthContext'

const AVATAR_COLORS = ['bg-green-600', 'bg-blue-600', 'bg-purple-600', 'bg-orange-500', 'bg-teal-600', 'bg-pink-600']
const colorFor = (id) => AVATAR_COLORS[(String(id).charCodeAt(0) || 0) % AVATAR_COLORS.length]

const fmtTime = (iso) => {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

export default function Messagerie({ onClose, initialContact = null, onNewMessage }) {
  const { user } = useAuth()
  const myId = user?.id

  const [users, setUsers] = useState([])          // contacts (autres utilisateurs)
  const [convByUser, setConvByUser] = useState({}) // otherUserId -> conversationId
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [activeConvId, setActiveConvId] = useState(null)
  const [messages, setMessages] = useState([])    // messages du fil actif (bruts backend)
  const [onlineIds, setOnlineIds] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)

  // ── Chargement initial : contacts + conversations existantes ────────────────
  useEffect(() => {
    let cancelled = false
    Promise.all([api.getUsers(), api.getConversations().catch(() => ({ conversations: [] }))])
      .then(([{ users: all }, { conversations }]) => {
        if (cancelled) return
        const others = (all || []).filter((u) => u.id !== myId)
        setUsers(others)
        const map = {}
        for (const c of conversations || []) {
          const otherId = (c.participant_ids || []).find((id) => id !== myId)
          if (otherId) map[otherId] = c.id
        }
        setConvByUser(map)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [myId])

  // ── Connexion socket + écoute des évènements ────────────────────────────────
  useEffect(() => {
    const socket = connectSocket()
    if (!socket) return

    const onNew = ({ message }) => {
      if (!message) return
      const otherId = message.author_id === myId ? message.recipient_id : message.author_id
      // mémorise la conversation nouvellement créée pour ce contact
      if (message.conversation_id && otherId) {
        setConvByUser((prev) => prev[otherId] ? prev : { ...prev, [otherId]: message.conversation_id })
      }
      setSelectedUserId((selUser) => {
        const belongsToActive = otherId === selUser
        if (belongsToActive) {
          setActiveConvId((cur) => cur || message.conversation_id || null)
          setMessages((prev) => prev.some((m) => m.id === message.id) ? prev : [...prev, message])
        }
        // notif si message reçu (pas de moi) et fil non ouvert
        if (message.author_id !== myId && !belongsToActive) onNewMessage?.()
        return selUser
      })
    }
    const onPresence = ({ user_id, online }) => {
      setOnlineIds((prev) => {
        const next = new Set(prev)
        online ? next.add(user_id) : next.delete(user_id)
        return next
      })
    }
    const onOnlineList = ({ user_ids }) => setOnlineIds(new Set(user_ids || []))

    socket.on('new_message', onNew)
    socket.on('presence', onPresence)
    socket.on('online_users', onOnlineList)
    const askOnline = () => socket.emit('who_is_online')
    socket.connected ? askOnline() : socket.on('connect', askOnline)

    return () => {
      socket.off('new_message', onNew)
      socket.off('presence', onPresence)
      socket.off('online_users', onOnlineList)
      socket.off('connect', askOnline)
    }
  }, [myId, onNewMessage])

  // ── Présélection depuis "Contacter" (par nom) ───────────────────────────────
  useEffect(() => {
    if (!initialContact || !users.length || selectedUserId) return
    const needle = initialContact.toLowerCase()
    const match = users.find((u) => displayName(u).toLowerCase().includes(needle) || (u.email || '').toLowerCase().includes(needle))
    if (match) selectUser(match.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContact, users])

  // ── Auto-scroll en bas à chaque nouveau message ─────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const selectUser = async (userId) => {
    setSelectedUserId(userId)
    setMessages([])
    const convId = convByUser[userId] || null
    setActiveConvId(convId)
    if (convId) {
      const socket = getSocket()
      socket?.emit('join_conversation', { conversation_id: convId })
      try {
        const { messages: history } = await api.getConversationMessages(convId)
        setMessages(history || [])
      } catch { /* historique indisponible */ }
    }
  }

  const sendMessage = () => {
    const content = newMessage.trim()
    if (!content || !selectedUserId) return
    const socket = getSocket()
    if (!socket) return
    // On laisse le serveur renvoyer le message (il l'émet aussi à l'auteur),
    // ce qui évite les doublons et garantit le bon id/horodatage.
    socket.emit('send_message', { recipient_id: selectedUserId, content })
    setNewMessage('')
  }

  const filteredUsers = useMemo(
    () => users.filter((u) => displayName(u).toLowerCase().includes(searchQuery.toLowerCase())),
    [users, searchQuery]
  )
  const activeUser = users.find((u) => u.id === selectedUserId)

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900" title="Retour">
            <ArrowLeft size={22} />
          </button>
          <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Messagerie interne</h1>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors">
          <X size={22} />
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — contacts */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col flex-shrink-0 ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un contact..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light bg-gray-50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && <p className="text-center text-gray-400 text-sm py-6">Chargement…</p>}
            {!loading && filteredUsers.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">Aucun contact</p>
            )}
            {filteredUsers.map((u) => {
              const online = onlineIds.has(u.id)
              return (
                <button
                  key={u.id}
                  onClick={() => selectUser(u.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${selectedUserId === u.id ? 'bg-green-50 border-l-4 border-l-primary-light' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    {u.profile_picture ? (
                      <img src={u.profile_picture} alt={displayName(u)} className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm ${colorFor(u.id)}`}>
                        {initialsOf(u)}
                      </div>
                    )}
                    {online && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm text-gray-900 truncate block">{displayName(u)}</span>
                    <p className="text-xs text-gray-500 truncate">{online ? 'En ligne' : (u.email || '')}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right panel — thread */}
        <div className={`flex-1 flex flex-col ${selectedUserId ? 'flex' : 'hidden md:flex'}`}>
          {selectedUserId && activeUser ? (
            <>
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white">
                <button onClick={() => setSelectedUserId(null)} className="p-1 hover:bg-gray-100 rounded-lg md:hidden">
                  <ArrowLeft size={20} />
                </button>
                {activeUser.profile_picture ? (
                  <img src={activeUser.profile_picture} alt={displayName(activeUser)} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${colorFor(activeUser.id)}`}>
                    {initialsOf(activeUser)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{displayName(activeUser)}</p>
                  <p className="text-xs text-gray-500">
                    {onlineIds.has(activeUser.id) ? <span className="text-green-500">● En ligne</span> : 'Hors ligne'}
                  </p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                  <p className="text-center text-gray-400 text-sm mt-8">Aucun message. Démarrez la conversation !</p>
                )}
                {messages.map((msg) => {
                  const mine = msg.author_id === myId
                  return (
                    <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      {!mine && (
                        activeUser.profile_picture ? (
                          <img src={activeUser.profile_picture} alt="" className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0 self-end" />
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs mr-2 flex-shrink-0 self-end ${colorFor(activeUser.id)}`}>
                            {initialsOf(activeUser)}
                          </div>
                        )
                      )}
                      <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-2xl text-sm overflow-hidden ${mine ? 'bg-primary-light text-white rounded-br-sm' : 'bg-white text-gray-900 shadow-sm rounded-bl-sm'}`}>
                        <p className="px-4 pt-2.5 pb-1">{msg.content}</p>
                        <p className={`text-xs px-4 pb-2.5 ${mine ? 'text-green-100' : 'text-gray-400'}`}>{fmtTime(msg.created_at)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-2">
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
                    disabled={!newMessage.trim()}
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
              <p className="text-lg font-medium">Sélectionnez un contact</p>
              <p className="text-sm mt-1">Choisissez un contact pour commencer à échanger</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
