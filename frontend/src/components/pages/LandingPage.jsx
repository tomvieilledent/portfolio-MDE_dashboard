import React, { useState } from 'react'
import { LogIn, Mail, Lightbulb, TrendingUp, Key } from 'lucide-react'
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

export default function LandingPage({ onLoginSuccess }) {
  const [loginOpen, setLoginOpen] = useState(false)

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
                <div
                  key={s.title}
                  className={`rounded-2xl border backdrop-blur-sm p-5 flex flex-col gap-3 ${s.color}`}
                >
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
          <a
            href="mailto:contact@mde-rodez.fr"
            className="flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-white/60 text-white font-semibold text-sm hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            <Mail size={17} />
            Contact
          </a>
          <button
            onClick={() => setLoginOpen(true)}
            className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary-light hover:bg-primary text-white font-semibold text-sm transition-colors shadow-lg shadow-primary-light/30"
          >
            <LogIn size={17} />
            Connexion
          </button>
        </div>
      </div>

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
