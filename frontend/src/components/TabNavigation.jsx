import React from 'react'

export default function TabNavigation({ tabs, activeTab, setActiveTab }) {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-white bg-primary-light border-b-2 border-primary-light'
                : 'text-gray-700 hover:text-gray-900 border-b-2 border-transparent'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
