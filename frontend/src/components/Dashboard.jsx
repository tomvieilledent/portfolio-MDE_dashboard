import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { getSocket } from '../lib/socket'
import Header from './Header'
import TabNavigation from './TabNavigation'
import Companies from './pages/Companies'
import Users from './pages/Users'
import Trainings from './pages/Trainings'
import News from './pages/News'
import DashboardPage from './pages/DashboardPage'
import MonOnglet from './pages/MonOnglet'
import Messagerie from './Messagerie'

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Accueil' },
  { id: 'companies', label: 'Entreprises' },
  { id: 'users', label: 'Trombinoscope' },
  { id: 'trainings', label: 'Formations' },
  { id: 'news', label: 'Veille économique' },
]

const USER_TABS = [
  { id: 'dashboard', label: 'Accueil' },
  { id: 'companies', label: 'Entreprises' },
  { id: 'users', label: 'Trombinoscope' },
  { id: 'trainings', label: 'Formations' },
  { id: 'news', label: 'Veille économique' },
]

export default function DashboardContainer() {
  const { role, user } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [messagingOpen, setMessagingOpen] = useState(false)
  const [messagingContact, setMessagingContact] = useState(null)
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  )
  const [unreadCount, setUnreadCount] = useState(0)

  // Ref lue dans le listener socket pour éviter une closure périmée.
  const messagingOpenRef = useRef(messagingOpen)
  useEffect(() => { messagingOpenRef.current = messagingOpen }, [messagingOpen])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  // Compteur de messages non lus : valeur initiale via REST.
  useEffect(() => {
    if (!user) { setUnreadCount(0); return }
    let cancelled = false
    api.getUnreadCount()
      .then((d) => { if (!cancelled) setUnreadCount(d.unread || 0) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [user])

  // Incrément live quand un message arrive et que la messagerie est fermée.
  useEffect(() => {
    if (!user) return
    const socket = getSocket()
    if (!socket) return
    const onNew = ({ message }) => {
      if (!message || message.author_id === user.id) return
      if (!messagingOpenRef.current) setUnreadCount((n) => n + 1)
    }
    socket.on('new_message', onNew)
    return () => socket.off('new_message', onNew)
  }, [user])

  const handleLogin = (user) => {
    setActiveTab(user?.is_super_admin ? 'dashboard' : 'news')
  }

  const handleLogout = () => {
    setActiveTab('dashboard')
  }

  const tabs = role === 'admin' ? ADMIN_TABS : USER_TABS

  const handleContact = (contactName) => {
    setMessagingContact(contactName)
    setMessagingOpen(true)
  }

  const handleCloseMessaging = () => {
    setMessagingOpen(false)
    setMessagingContact(null)
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardPage />
      case 'companies': return <Companies />
      case 'users': return <Users onContact={handleContact} />
      case 'trainings': return <Trainings isAdmin={role === 'admin'} />
      case 'news': return <News />
      case 'mononglet': return <MonOnglet />
      default: return <News />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenMessaging={() => { setMessagingContact(null); setMessagingOpen(true); setUnreadCount(0) }}
        unreadCount={unreadCount}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />
      <TabNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderPage()}
      </main>
      {messagingOpen && (
        <Messagerie
          onClose={handleCloseMessaging}
          initialContact={messagingContact}
          onNewMessage={() => setUnreadCount((n) => n + 1)}
        />
      )}
    </div>
  )
}
