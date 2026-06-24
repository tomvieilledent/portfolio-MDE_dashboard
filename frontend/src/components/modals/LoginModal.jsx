import React, { useState } from 'react'
import { X, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import RegisterModal from './RegisterModal'
import ForgotPasswordModal from './ForgotPasswordModal'

export default function LoginModal({ onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [error, setError] = useState('')

  const ACCOUNTS = {
    'admin@mde.fr':   { password: 'admin123',  role: 'admin',   name: 'Admin MDE'       },
    'patron@mde.fr':  { password: 'patron123', role: 'patron',  name: 'Sophie Dubois'   },
    'salarie@mde.fr': { password: 'salarie123',role: 'salarie', name: 'Emma Bernard'    },
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const account = ACCOUNTS[email.toLowerCase().trim()]
    if (!account || account.password !== password) {
      setError('Email ou mot de passe incorrect')
      return
    }
    setError('')
    onLoginSuccess ? onLoginSuccess(account.role, account.name) : onClose()
  }

  if (showRegister) {
    return <RegisterModal onClose={onClose} onBackToLogin={() => setShowRegister(false)} />
  }

  if (showForgot) {
    return <ForgotPasswordModal onClose={onClose} onBack={() => setShowForgot(false)} />
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header vert */}
        <div className="bg-primary-light px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <LogIn size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Connexion</h2>
              <p className="text-sm text-white/80">Accédez à votre espace professionnel</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5">
            <X size={20} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="votre.email@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 accent-primary-light rounded"
                />
                Se souvenir de moi
              </label>
              <button type="button" onClick={() => setShowForgot(true)} className="text-sm text-primary-light hover:underline font-medium">
                Mot de passe oublié ?
              </button>
            </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-primary-light hover:bg-primary text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <LogIn size={18} />
            Se connecter
          </button>

          {/* Comptes démo */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600 mb-1.5">Comptes de démonstration :</p>
            <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">admin@mde.fr</span> / <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">admin123</span> — Super Admin</p>
            <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">patron@mde.fr</span> / <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">patron123</span> — Patron</p>
            <p><span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">salarie@mde.fr</span> / <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200">salarie123</span> — Salarié</p>
          </div>

          <div className="text-center pt-1">
            <p className="text-sm text-gray-500 mb-2">Nouveau sur la plateforme ?</p>
            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="w-full border-2 border-primary-light text-primary-light hover:bg-primary-light hover:text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              Créer un compte
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
