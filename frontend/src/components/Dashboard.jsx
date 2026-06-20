import React, { useState, useEffect } from 'react'
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
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'companies', label: 'Entreprises' },
  { id: 'users', label: 'Trombinoscope' },
  { id: 'trainings', label: 'Formations' },
  { id: 'news', label: 'Veille économique' },
]

const USER_TABS = [
  { id: 'news', label: 'Veille économique' },
  { id: 'companies', label: 'Entreprises' },
  { id: 'users', label: 'Trombinoscope' },
  { id: 'trainings', label: 'Formations' },
]

export default function DashboardContainer() {
  const [role, setRole] = useState('user')
  const [activeTab, setActiveTab] = useState('news')
  const [messagingOpen, setMessagingOpen] = useState(false)
  const [messagingContact, setMessagingContact] = useState(null)
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  )
  const [unreadCount, setUnreadCount] = useState(2)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  const handleLogin = () => {
    setRole('admin')
    setActiveTab('dashboard')
  }

  const handleLogout = () => {
    setRole('user')
    setActiveTab('news')
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
        role={role}
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
