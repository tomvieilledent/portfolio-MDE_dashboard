import React from 'react'
import { LayoutDashboard, Building2, Users, GraduationCap, TrendingUp } from 'lucide-react'

const ICONS = {
  dashboard: LayoutDashboard,
  companies: Building2,
  users: Users,
  trainings: GraduationCap,
  news: TrendingUp,
}

export default function TabNavigation({ tabs, activeTab, setActiveTab }) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 py-2.5">
        {tabs.map((tab) => {
          const Icon = ICONS[tab.id]
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg font-semibold text-base transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-primary-light text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {Icon && <Icon size={18} />}
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
