import React from 'react'
import { User, LogOut } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">®</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Maison de l'Économie</h1>
            <p className="text-xs text-gray-500">Pépinière d'entreprises</p>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">Administrateur</p>
          </div>
          <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-white font-bold">
            AU
          </div>
        </div>
      </div>
    </header>
  )
}
