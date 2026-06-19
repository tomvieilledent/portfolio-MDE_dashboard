import React, { useState, useEffect, useRef } from 'react'
import { MessageSquare, Moon, Sun } from 'lucide-react'
import LoginModal from './modals/LoginModal'

function playNotifSound() {
  try {
    const audio = new Audio('/notification.mp3')
    audio.volume = 0.5
    audio.play()
  } catch (_) {}
}

export default function Header({ onOpenMessaging, unreadCount = 2, darkMode, onToggleDark }) {
  const [loginOpen, setLoginOpen] = useState(false)
  const prevCount = useRef(unreadCount)

  useEffect(() => {
    if (unreadCount > prevCount.current) playNotifSound()
    prevCount.current = unreadCount
  }, [unreadCount])

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-5">
            <img src="/logo-rodez.png" alt="Rodez Agglomération" className="h-16 w-auto" />
            <div className="w-px h-14 bg-gray-200" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-snug">Maison de l'Économie</h1>
              <p className="text-sm text-gray-500 leading-snug">Pépinière d'entreprises</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Messagerie */}
            <button
              onClick={onOpenMessaging}
              className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-800"
              title="Messagerie interne"
            >
              <MessageSquare size={26} />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-60" />
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold leading-none">
                    {unreadCount}
                  </span>
                </>
              )}
            </button>

            {/* Admin User → login modal */}
            <button
              onClick={() => setLoginOpen(true)}
              className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors"
            >
              <div className="text-right">
                <p className="text-base font-semibold text-gray-900 leading-snug">Céline Marcilhac</p>
                <p className="text-sm text-gray-500 leading-snug">Administrateur</p>
              </div>
              <div className="w-11 h-11 bg-primary-light rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                AU
              </div>
            </button>

            {/* Dark mode toggle — à droite du login */}
            <button
              onClick={onToggleDark}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-800"
              title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          </div>
        </div>
      </header>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </>
  )
}
