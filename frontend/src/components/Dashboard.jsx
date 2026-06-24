import React, { useState, useEffect } from 'react'
import Header from './Header'
import TabNavigation from './TabNavigation'
import Companies from './pages/Companies'
import Users from './pages/Users'
import Trainings from './pages/Trainings'
import News from './pages/News'
import DashboardPage from './pages/DashboardPage'
import MonOnglet from './pages/MonOnglet'
import GererEquipe from './pages/GererEquipe'
import MonEntreprise from './pages/MonEntreprise'
import Messagerie from './Messagerie'
import LandingPage from './pages/LandingPage'
import GestionPage from './pages/GestionPage'

const ADMIN_TABS = [
  { id: 'dashboard',  label: 'Accueil' },
  { id: 'companies',  label: 'Entreprises' },
  { id: 'users',      label: 'Trombinoscope' },
  { id: 'trainings',  label: 'Formations' },
  { id: 'news',       label: 'Veille économique' },
  { id: 'gestion',    label: 'Gestion' },
]

const PATRON_TABS = [
  { id: 'dashboard',     label: 'Accueil' },
  { id: 'companies',     label: 'Entreprises' },
  { id: 'users',         label: 'Trombinoscope' },
  { id: 'trainings',     label: 'Formations' },
  { id: 'news',          label: 'Veille économique' },
  { id: 'monentreprise', label: 'Mon entreprise' },
  { id: 'equipe',        label: "Gérer l'équipe" },
]

const SALARIE_TABS = [
  { id: 'dashboard',  label: 'Accueil' },
  { id: 'companies',  label: 'Entreprises' },
  { id: 'users',      label: 'Trombinoscope' },
  { id: 'trainings',  label: 'Formations' },
  { id: 'news',       label: 'Veille économique' },
]

const DEFAULT_PROFILES = {
  admin:   { name: 'Céline Marcilhac', email: 'admin@mde.fr',   phone: '+33 5 65 00 00 00', bio: '', photo: null, businessCard: null },
  patron:  { name: 'Sophie Dubois',    email: 'patron@mde.fr',  phone: '+33 6 12 34 56 78', bio: '', photo: null, businessCard: null },
  salarie: { name: 'Emma Bernard',     email: 'salarie@mde.fr', phone: '+33 6 56 78 90 12', bio: '', photo: null, businessCard: null },
}

function getTabsForRole(role) {
  if (role === 'admin')  return ADMIN_TABS
  if (role === 'patron') return PATRON_TABS
  return SALARIE_TABS
}

export default function DashboardContainer() {
  const [role, setRole] = useState('salarie')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
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

  const handleLogin = (newRole = 'salarie') => {
    setRole(newRole)
    setIsLoggedIn(true)
    setProfile({ ...DEFAULT_PROFILES[newRole], role: newRole })
    setActiveTab('dashboard')
  }

  const handleLogout = () => {
    setRole('salarie')
    setIsLoggedIn(false)
    setProfile(null)
    setActiveTab('dashboard')
  }

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
      case 'dashboard':     return <DashboardPage />
      case 'companies':     return <Companies isAdmin={role === 'admin'} />
      case 'monentreprise': return <MonEntreprise />
      case 'users':         return <Users onContact={handleContact} role={role} profile={profile} />
      case 'trainings':     return <Trainings isAdmin={role === 'admin'} profile={profile} />
      case 'news':          return <News />
      case 'gestion':       return <GestionPage />
      case 'equipe':        return <GererEquipe />
      case 'mononglet':     return <MonOnglet />
      default:              return <DashboardPage />
    }
  }

  if (!isLoggedIn) {
    return (
      <LandingPage
        onLoginSuccess={(role, name) => {
          handleLogin(role, name)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        role={role}
        isLoggedIn={isLoggedIn}
        profile={profile}
        onProfileSave={setProfile}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenMessaging={() => { setMessagingContact(null); setMessagingOpen(true); setUnreadCount(0) }}
        unreadCount={unreadCount}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((d) => !d)}
      />
      <TabNavigation tabs={getTabsForRole(role)} activeTab={activeTab} setActiveTab={setActiveTab} />
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
