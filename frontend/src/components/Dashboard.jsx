import React, { useState, useEffect, useMemo } from 'react'
import { useAuth, displayName } from '../context/AuthContext'
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

function getTabsForRole(role) {
  if (role === 'admin')  return ADMIN_TABS
  if (role === 'patron') return PATRON_TABS
  return SALARIE_TABS
}

// Construit l'objet `profile` attendu par le Header / les pages à partir de
// l'utilisateur authentifié. Les champs cosmétiques absents du backend
// (company, bio) sont laissés vides en attendant leur câblage.
function profileFromUser(user, role) {
  if (!user) return null
  return {
    id: user.id,
    name: displayName(user),
    email: user.email,
    phone: user.phone || '',
    company: '',
    isSuperAdmin: !!user.is_super_admin,
    bio: user.bio || '',
    photo: user.profile_picture || null,
    businessCard: user.business_card || null,
    role,
  }
}

export default function DashboardContainer() {
  const { user, role, isAuthenticated, loading, logout } = useAuth()
  const [profileOverride, setProfileOverride] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [messagingOpen, setMessagingOpen] = useState(false)
  const [messagingContact, setMessagingContact] = useState(null)
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  )
  const [unreadCount, setUnreadCount] = useState(0)

  // Profil effectif = données backend + modifications locales non encore
  // persistées (l'édition de profil sera câblée à une étape ultérieure).
  const profile = useMemo(() => {
    const base = profileFromUser(user, role)
    return base ? { ...base, ...(profileOverride || {}) } : null
  }, [user, role, profileOverride])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  // Réinitialise l'onglet et les surcharges de profil à chaque (dé)connexion.
  useEffect(() => {
    setActiveTab('dashboard')
    setProfileOverride(null)
  }, [user?.id])

  const handleLogout = () => { logout() }

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-primary-light border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // La connexion est gérée par le contexte ; on ferme simplement la landing.
    return <LandingPage onLoginSuccess={() => {}} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        role={role}
        isLoggedIn={isAuthenticated}
        profile={profile}
        onProfileSave={setProfileOverride}
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
