import React, { useState } from 'react'
import { X, Mail, KeyRound, ArrowLeft, CheckCircle2, Send, Lock, Loader2 } from 'lucide-react'
import { api } from '../../lib/api'

export default function ForgotPasswordModal({ onClose, onBack }) {
  // Étapes : 'request' (saisie email) -> 'reset' (nouveau mot de passe) -> 'done'
  const [step, setStep] = useState('request')
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const requestReset = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = await api.forgotPassword(email.trim())
      // DEV : le backend renvoie le token (faute de service email).
      if (data.reset_token) {
        setResetToken(data.reset_token)
        setStep('reset')
      } else {
        // Compte inexistant : message générique, on n'en dit pas plus.
        setError("Aucun compte associé à cet email (ou réinitialisation indisponible).")
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const submitNewPassword = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setSubmitting(true)
    try {
      await api.resetPassword(resetToken, password)
      setStep('done')
    } catch (err) {
      setError(err.message || 'Échec de la réinitialisation')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-primary-light px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <KeyRound size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Mot de passe oublié</h2>
              <p className="text-sm text-white/80">
                {step === 'reset' ? 'Choisissez un nouveau mot de passe' : 'Réinitialisation'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5">
            <X size={20} />
          </button>
        </div>

        {/* Étape 1 : email */}
        {step === 'request' && (
          <form onSubmit={requestReset} className="px-6 py-6 space-y-5">
            <p className="text-sm text-gray-600">
              Saisissez l'adresse email associée à votre compte pour réinitialiser votre mot de passe.
            </p>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" required autoFocus placeholder="votre.email@exemple.fr"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                />
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-primary-light hover:bg-primary text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {submitting ? 'Envoi…' : 'Continuer'}
            </button>
            <button type="button" onClick={onBack}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
              <ArrowLeft size={15} /> Retour à la connexion
            </button>
          </form>
        )}

        {/* Étape 2 : nouveau mot de passe */}
        {step === 'reset' && (
          <form onSubmit={submitNewPassword} className="px-6 py-6 space-y-5">
            <p className="text-sm text-gray-600">Choisissez un nouveau mot de passe pour <strong>{email}</strong>.</p>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg">{error}</p>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password" required minLength={8} autoFocus placeholder="Au moins 8 caractères"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmer</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password" required minLength={8} placeholder="••••••••"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                />
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full bg-primary-light hover:bg-primary text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              {submitting ? 'Mise à jour…' : 'Réinitialiser le mot de passe'}
            </button>
          </form>
        )}

        {/* Étape 3 : confirmation */}
        {step === 'done' && (
          <div className="px-6 py-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={36} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Mot de passe réinitialisé !</h3>
              <p className="text-sm text-gray-500 mt-1">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
            </div>
            <button onClick={onBack}
              className="w-full border-2 border-primary-light text-primary-light hover:bg-primary-light hover:text-white font-semibold py-2.5 rounded-xl transition-colors text-sm mt-2">
              Retour à la connexion
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
