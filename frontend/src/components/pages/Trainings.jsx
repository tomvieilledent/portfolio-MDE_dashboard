import React, { useState } from 'react'
import { Plus, BookOpen, Users, Calendar } from 'lucide-react'

export default function Trainings() {
  const [trainings] = useState([
    {
      id: 1,
      title: 'Project Management',
      description: 'Gestion de projets agiles et méthodologies',
      company: 'Tech Innovators',
      duration: '5 jours',
      enrolledCount: 12,
      maxParticipants: 20,
    },
    {
      id: 2,
      title: 'Digital Marketing Basics',
      description: 'Fondamentaux du marketing digital',
      company: 'Digital Solutions',
      duration: '3 jours',
      enrolledCount: 8,
      maxParticipants: 15,
    },
    {
      id: 3,
      title: 'Renewable Energy Overview',
      description: 'Introduction aux énergies renouvelables',
      company: 'Green Energy Co.',
      duration: '2 jours',
      enrolledCount: 5,
      maxParticipants: 10,
    },
    {
      id: 4,
      title: 'Design Thinking Workshop',
      description: 'Atelier de design thinking et créativité',
      company: 'Creative Studio',
      duration: '1 jour',
      enrolledCount: 6,
      maxParticipants: 8,
    },
  ])

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Formations</h2>
          <p className="text-sm text-gray-600 mt-1">Catalogue de formations disponibles</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Ajouter une formation
        </button>
      </div>

      {/* Trainings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trainings.map((training) => (
          <div key={training.id} className="card">
            {/* Header */}
            <div className="mb-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{training.title}</h3>
                  <p className="text-sm text-gray-600">{training.company}</p>
                </div>
                <BookOpen className="text-primary-light" size={24} />
              </div>
              <p className="text-sm text-gray-700 mt-2">{training.description}</p>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4 text-sm text-gray-700 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Durée</span>
                <span className="font-medium">{training.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Participants</span>
                <span className="font-medium">
                  {training.enrolledCount} / {training.maxParticipants}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-light h-2 rounded-full"
                  style={{
                    width: `${(training.enrolledCount / training.maxParticipants) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button className="flex-1 btn-primary">S'inscrire</button>
              <button className="flex-1 btn-secondary">Détails</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
