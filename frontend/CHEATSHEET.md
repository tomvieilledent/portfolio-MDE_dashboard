# 🎯 Cheat Sheet — MDE Frontend

## ⚡ Commandes Essentielles

```bash
# Démarrer le serveur de dev
cd frontend && npm run dev

# Build pour production
npm run build

# Voir la version produit localement
npm run preview

# Installer un nouveau package
npm install mon-package

# Mettre à jour un package
npm update mon-package@latest
```

---

## 📁 Où modifier quoi

| Besoin | Fichier | Action |
|--------|---------|--------|
| Changer couleurs | `tailwind.config.js` | Modifie ligne ~18 |
| Ajouter onglet | `Dashboard.jsx` | Ajoute un tab et un case |
| Modifier Entreprises | `Companies.jsx` | Modifie useState ligne ~10 |
| Modifier Users | `Users.jsx` | Modifie useState ligne ~8 |
| Modifier Formations | `Trainings.jsx` | Modifie useState ligne ~6 |
| Modifier News | `News.jsx` | Modifie useState ligne ~6 |
| Changer header | `Header.jsx` | Modifie JSX ligne ~7 |
| Ajouter classe CSS | `src/index.css` | Ajoute `.ma-classe { @apply ... }` |

---

## 🎨 Tailwind — Classes courantes

```jsx
// ✅ Utilisation rapide
<div className="p-4 mb-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900">Titre</h2>
  <p className="text-sm text-gray-600 mt-2">Sous-titre</p>
  <button className="btn-primary">Bouton</button>
</div>

// Spacing (p = padding, m = margin, gap = écart flex)
p-4              // padding 1rem
m-2              // margin 0.5rem
mb-6             // margin-bottom 1.5rem
mt-3             // margin-top 0.75rem
gap-2            // écart entre enfants

// Colors
text-gray-900    // Texte gris très foncé
bg-primary-light // Fond vert clair
bg-white         // Fond blanc
border-gray-200  // Bordure grise

// Typography
text-2xl         // Font-size 1.5rem
font-bold        // Poids 700
text-center      // Align center
truncate         // Texte coupé avec ...

// Layout
flex items-center gap-2           // Flexbox horizontal centré
grid grid-cols-2 gap-4            // Grid 2 colonnes
md:grid-cols-3                    // 3 colonnes sur tablette+
w-full                            // Largeur 100%
h-12                              // Hauteur 3rem

// States & Effects
hover:shadow-lg                   // Ombre au survol
hover:bg-primary                  // Couleur au survol
transition-colors                 // Animation douce couleurs
opacity-50                        // Semi-transparent
disabled:opacity-50               // Bouton désactivé

// Border & Rounded
rounded                           // Coins arrondis petits
rounded-lg                        // Coins arrondis moyens
rounded-full                      // Cercle/capsule
border border-gray-300            // Bordure
border-t border-gray-200          // Bordure haut seulement
```

---

## 💻 React Essentials

```jsx
// ✅ Importer
import React, { useState, useEffect } from 'react'
import { Plus, Edit2 } from 'lucide-react'

// ✅ Composant de base
export default function MonComposant() {
  return <div>Coucou</div>
}

// ✅ Avec état (state)
const [count, setCount] = useState(0)

// Utiliser l'état
<button onClick={() => setCount(count + 1)}>
  Clics : {count}
</button>

// ✅ Boucle (map)
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}

// ✅ Condition (ternaire)
{isLoading ? <div>Chargement...</div> : <div>Contenu</div>}

// ✅ Effet (fetch, timer, etc.)
useEffect(() => {
  console.log('Composant monté')
  // Fetch, subscribe, etc.
  return () => console.log('Composant démonté')
}, []) // [] = une fois au montage
```

---

## 🎯 Bonnes pratiques

### ✅ À FAIRE

```jsx
// ✅ Extraire les données
const companies = [
  { id: 1, name: 'Acme' },
  { id: 2, name: 'Tech Inc' },
]

// ✅ Utiliser key dans les listes
{companies.map(c => <div key={c.id}>{c.name}</div>)}

// ✅ Composants réutilisables
function CompanyCard({ company }) {
  return <div className="card">{company.name}</div>
}

// ✅ Props bien typées (futur TypeScript)
/**
 * @param {string} label - Texte du bouton
 * @param {function} onClick - Callback au clic
 */
function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>
}

// ✅ Noms clairs
const [isLoading, setIsLoading] = useState(false)
const handleSubmit = () => { }
const formatDate = (date) => { }
```

### ❌ À ÉVITER

```jsx
// ❌ État global dans un sous-composant
const [globalData, setGlobalData] = useState([])

// ❌ Pas de key dans les listes (causes bugs)
{companies.map(c => <div>{c.name}</div>)}

// ❌ Noms génériques
const [data, setData] = useState([])
const handleClick = () => { }

// ❌ Logique complexe dans le JSX
{users.map(u => u.active && u.company.id === selectedId ? <div>...</div> : null)}
```

---

## 🔍 Déboguer

```jsx
// Console.log
console.log('Value:', myVar)

// Debugger (pause)
debugger;

// Inspection React DevTools
// Dans le navigateur : F12 → React tab → Inspecte composants
```

---

## 📦 Importer des librairies

```jsx
// ✅ Icônes (déjà installé)
import { Plus, Edit2, Mail, MapPin } from 'lucide-react'

// ✅ Futur: state management
// import { create } from 'zustand'

// ✅ Futur: validation
// import { z } from 'zod'

// Installer: npm install zod
```

---

## 🚀 Pattern rapide — Nouvelle page

```jsx
// src/components/pages/MaPage.jsx
import React, { useState } from 'react'

export default function MaPage() {
  const [data, setData] = useState([
    { id: 1, title: 'Item 1' },
    { id: 2, title: 'Item 2' },
  ])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Ma Page</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map(item => (
          <div key={item.id} className="card">
            <h3 className="font-bold">{item.title}</h3>
            <button className="btn-primary mt-4">Action</button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

Puis ajoute dans `Dashboard.jsx` :

```jsx
import MaPage from './pages/MaPage'

const tabs = [
  // ...
  { id: 'mapage', label: 'Ma Page', icon: '⭐' },
]

case 'mapage':
  return <MaPage />
```

---

## 🎨 Couleurs disponibles

```js
// Primary (vert Maison Économie)
primary-light    #7ec843  (boutons, accents)
primary          #5da020  (texte, bordures)
primary-dark     #4a7a1a  (hover)

// Gray (neutres)
gray-50          #f9fafb  (fond très clair)
gray-100         #f3f4f6  (fond clair)
gray-200         #e5e7eb  (bordures)
gray-700         #374151  (texte moyen)
gray-900         #111827  (texte très foncé)

// Utilisation
className="bg-primary-light"       // Fond vert clair
className="text-primary"           // Texte vert
className="border-gray-200"        // Bordure grise
```

---

## ⌨️ Raccourcis VS Code

```
Cmd+Shift+P     Palette de commandes
Cmd+K Cmd+0     Fold all
Cmd+K Cmd+J     Unfold all
Cmd+/           Toggle comment
Cmd+D           Select next occurrence
Cmd+Shift+L     Multi-select all occurrences
```

---

## 📱 Responsive Tips

```jsx
// Mobile-first (défaut = mobile)
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  // 1 colonne par défaut
  // 2 colonnes sur tablets (≥768px)
  // 3 colonnes sur desktop (≥1024px)
</div>

// Breakpoints Tailwind
sm  ≥ 640px
md  ≥ 768px
lg  ≥ 1024px
xl  ≥ 1280px
2xl ≥ 1536px
```

---

## 🔗 Liens utiles

- Tailwind Classes : https://tailwindcss.com/docs/display
- React Hooks : https://react.dev/reference/react/hooks
- Lucide Icons : https://lucide.dev
- MDN Web Docs : https://developer.mozilla.org

---

**Tu as besoin d'aide ? Check les fichiers :**
- `README.md` — Démarrage
- `GUIDE_DEVELOPMENT.md` — Guide complet
- `ARCHITECTURE.md` — Détails techniques
