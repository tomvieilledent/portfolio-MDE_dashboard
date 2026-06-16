import React, { useState } from 'react'
import Header from './Header'
import TabNavigation from './TabNavigation'
import Companies from './pages/Companies'
import Users from './pages/Users'
import Trainings from './pages/Trainings'
import News from './pages/News'
import Dashboard from './pages/DashboardPage'
import MonOnglet from './pages/MonOnglet'

export default function DashboardContainer() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
    { id: 'companies', label: 'Entreprises', icon: '🏢' },
    { id: 'users', label: 'Trombinoscope', icon: '👥' },
    { id: 'trainings', label: 'Formations', icon: '📚' },
    { id: 'news', label: 'Veille économique', icon: '📰' },
	{ id: 'logs', label: 'Logs', icon: '⭐' },
  ]

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'companies':
        return <Companies />
      case 'users':
        return <Users />
      case 'trainings':
        return <Trainings />
      case 'news':
        return <News />
	  case 'mononglet':
  		return <MonOnglet />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TabNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {renderPage()}
      </main>
    </div>
  )
}
