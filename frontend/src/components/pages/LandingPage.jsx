import React, { useState } from 'react'
import { LogIn, Mail, Lightbulb, TrendingUp, Key, X, User, Phone, FileText, Send, CheckCircle } from 'lucide-react'
import LoginModal from '../modals/LoginModal'

const SECTIONS = [
  {
    icon: Lightbulb,
    title: 'Incubateur',
    duration: 'Jusqu\'à 24 mois',
    color: 'bg-white/10 border-white/30 text-white',
    iconColor: 'text-primary-light',
    description:
      'Accueille et accompagne les porteurs de projets innovants du concept à la création. Suivi personnalisé, outils méthodologiques, formations, coaching, hébergement en open-space et écosystème entrepreneurial complet.',
    highlight: 'De l\'idée à la création d\'entreprise, étape par étape',
  },
  {
    icon: TrendingUp,
    title: 'Pépinière d\'entreprises',
    duration: '48 mois',
    color: 'bg-white/10 border-white/30 text-white',
    iconColor: 'text-green-300',
    description:
      'Héberge les jeunes entreprises dans leurs deux premières années. Bureaux privatifs ou open-space, accompagnement quotidien, services mutualisés, accès formations et coachs, appui au recrutement.',
    highlight: 'Un tremplin vers un territoire attractif et dynamique',
  },
  {
    icon: Key,
    title: 'Hôtel d\'entreprises',
    duration: 'Jusqu\'à 12 mois',
    color: 'bg-white/10 border-white/30 text-white',
    iconColor: 'text-blue-300',
    description:
      'Réservé aux entreprises en fin de parcours pépinière ou à l\'accueil temporaire d\'entreprises exogènes. Bureaux fonctionnels et privatifs, services mutualisés, hébergement simple sans accompagnement.',
    highlight: 'Location flexible — à la demi-journée, semaine ou mois',
  },
]

function ContactModal({ onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-primary-light px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Mail size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Nous contacter</h2>
              <p className="text-sm text-white/80">Maison de l'Économie · Rodez Agglomération</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors mt-0.5">
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-10 flex flex-col items-center text-center gap-3">
            <CheckCircle size={48} className="text-primary-light" />
            <h3 className="text-lg font-bold text-gray-900">Message envoyé !</h3>
            <p className="text-sm text-gray-500">Nous reviendrons vers vous dans les plus brefs délais.</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-primary-light hover:bg-primary text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                  <User size={12} className="text-gray-400" /> Nom complet
                </label>
                <input
                  required type="text" placeholder="Jean Dupont"
                  value={form.name} onChange={set('name')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                  <Phone size={12} className="text-gray-400" /> Téléphone
                </label>
                <input
                  type="tel" placeholder="+33 6 00 00 00 00"
                  value={form.phone} onChange={set('phone')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <Mail size={12} className="text-gray-400" /> Email
              </label>
              <input
                required type="email" placeholder="votre.email@exemple.fr"
                value={form.email} onChange={set('email')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <FileText size={12} className="text-gray-400" /> Sujet
              </label>
              <select
                required value={form.subject} onChange={set('subject')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light bg-white text-gray-700"
              >
                <option value="">Choisir un sujet…</option>
                <option value="incubateur">Incubateur</option>
                <option value="pepiniere">Pépinière d'entreprises</option>
                <option value="hotel">Hôtel d'entreprises</option>
                <option value="location">Location de bureaux</option>
                <option value="autre">Autre demande</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1.5">
                <FileText size={12} className="text-gray-400" /> Message
              </label>
              <textarea
                required rows={4} placeholder="Décrivez votre projet ou votre demande…"
                value={form.message} onChange={set('message')}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-light resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button" onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary-light hover:bg-primary text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Send size={15} /> Envoyer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function LandingPage({ onLoginSuccess }) {
  const [loginOpen, setLoginOpen]   = useState(false)
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <>
      <div
        className="min-h-screen flex flex-col relative overflow-hidden"
        style={{
          backgroundImage: 'url(/1920.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: '#1a3a2a',
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/75" />

        {/* Header logo */}
        <div className="relative z-10 flex items-center gap-4 px-8 py-6">
          <img src="/logo-rodez.png" alt="Rodez Agglomération" className="h-14 w-auto bg-white rounded-lg px-2 py-1.5 shadow-md" />
          <div className="w-px h-12 bg-white/30" />
          <div>
            <p className="text-white font-bold text-xl leading-tight">Maison de l'Économie</p>
            <p className="text-white/60 text-xs mt-0.5">Pépinière d'entreprises · Rodez Agglomération</p>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-8">

          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg leading-tight">
              Votre tremplin
              <span className="block text-primary-light">vers la réussite</span>
            </h1>
            <p className="text-white/70 mt-4 text-base max-w-xl mx-auto leading-relaxed">
              La Maison de l'Économie accompagne les entrepreneurs à chaque étape de leur développement,
              de l'idée à l'entreprise installée.
            </p>
          </div>

          {/* 3 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-5xl mb-4">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.title} className={`rounded-2xl border backdrop-blur-sm p-5 flex flex-col gap-3 ${s.color}`}>
                  <div className="flex items-center gap-2">
                    <Icon size={20} className={s.iconColor} />
                    <div>
                      <p className="font-bold text-white text-base leading-tight">{s.title}</p>
                      <p className="text-white/50 text-xs">{s.duration}</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed flex-1">{s.description}</p>
                  <p className="text-xs font-semibold text-primary-light border-t border-white/10 pt-3">
                    {s.highlight}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom bubbles */}
        <div className="relative z-10 flex justify-center gap-4 pb-10">
          <button
            onClick={() => setContactOpen(true)}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/60 text-white font-semibold text-sm hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            <Mail size={17} />
            Contact
          </button>
          <button
            onClick={() => setLoginOpen(true)}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary-light hover:bg-primary text-white font-semibold text-sm transition-colors shadow-lg shadow-primary-light/30"
          >
            <LogIn size={17} />
            Connexion
          </button>
        </div>
      </div>

      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} />}

      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onLoginSuccess={(role, name) => {
            setLoginOpen(false)
            onLoginSuccess(role, name)
          }}
        />
      )}
    </>
  )
}
