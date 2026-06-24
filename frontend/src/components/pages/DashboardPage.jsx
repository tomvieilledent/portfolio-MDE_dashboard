import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Clock } from 'lucide-react'

const EVENTS = [
  { date: '2026-06-15', title: 'Réunion équipe MDE', time: '09:00', color: 'bg-purple-500' },
  { date: '2026-06-15', title: 'Point formations Q3', time: '14:30', color: 'bg-orange-400' },
  { date: '2026-06-23', title: 'Atelier digital', time: '10:00', color: 'bg-blue-500' },
  { date: '2026-06-25', title: 'Formation Marketing', time: '09:00', color: 'bg-orange-400' },
  { date: '2026-06-28', title: 'Bilan mensuel', time: '11:00', color: 'bg-green-500' },
  { date: '2026-07-02', title: 'Accueil nouvelles entreprises', time: '09:30', color: 'bg-purple-500' },
  { date: '2026-07-05', title: 'Gestion Financière PME', time: '14:00', color: 'bg-blue-500' },
]

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDateLabel(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`
}

export default function DashboardPage() {
  const today = new Date()
  const todayKey = toKey(today)

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(todayKey)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDayOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const eventsByDate = EVENTS.reduce((acc, ev) => {
    acc[ev.date] = acc[ev.date] || []
    acc[ev.date].push(ev)
    return acc
  }, {})

  const selectedEvents = eventsByDate[selectedDate] || []

  const upcoming = EVENTS
    .filter((ev) => ev.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Accueil</h2>
        <p className="text-sm text-gray-500 mt-1">Votre agenda et prochains événements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Calendrier */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-500" />
            </button>
            <h3 className="text-base font-bold text-gray-900">{MONTHS[month]} {year}</h3>
            <button
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />
              const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const hasEvents = !!eventsByDate[key]
              const isToday = key === todayKey
              const isSelected = key === selectedDate
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`relative mx-auto w-9 h-9 flex flex-col items-center justify-center rounded-full text-sm font-medium transition-colors
                    ${isSelected
                      ? 'bg-primary-light text-white'
                      : isToday
                      ? 'bg-primary-light/10 text-primary-light font-bold'
                      : 'hover:bg-gray-100 text-gray-700'
                    }`}
                >
                  {day}
                  {hasEvents && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-400" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Panneau événements */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Événements du jour sélectionné */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex-1">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays size={16} className="text-primary-light" />
              <h3 className="text-sm font-bold text-gray-900">{formatDateLabel(selectedDate)}</h3>
            </div>
            {selectedEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedEvents.map((ev, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ev.color}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{ev.title}</p>
                      <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Clock size={11} /> {ev.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucun événement ce jour</p>
            )}
          </div>

          {/* Prochains événements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Prochains événements</h3>
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((ev, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ev.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                      <p className="text-xs text-gray-400">{formatDateLabel(ev.date)} · {ev.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Aucun événement à venir</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
