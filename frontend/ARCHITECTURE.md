# Architecture Frontend — MDE Dashboard

## 🏗 Arborescence complète

```
frontend/
│
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx                 # Conteneur principal (gère les onglets)
│   │   ├── Header.jsx                    # En-tête (logo, profil utilisateur)
│   │   ├── TabNavigation.jsx             # Navigation par onglets
│   │   │
│   │   └── pages/
│   │       ├── DashboardPage.jsx         # 🏠 Tableau de bord (stats + accès rapide)
│   │       ├── Companies.jsx             # 🏢 Entreprises (grid, recherche, création)
│   │       ├── Users.jsx                 # 👥 Trombinoscope (annuaire)
│   │       ├── Trainings.jsx             # 📚 Formations (listing + inscriptions)
│   │       └── News.jsx                  # 📰 Veille économique (feed d'articles)
│   │
│   ├── App.jsx                           # Point d'entrée React
│   ├── main.jsx                          # Bootstrap React DOM
│   └── index.css                         # Styles Tailwind + custom @apply
│
├── public/                               # Assets statiques (optionnel)
├── index.html                            # Template HTML
├── vite.config.js                        # Configuration Vite
├── tailwind.config.js                    # Configuration Tailwind (couleurs, breakpoints)
├── postcss.config.js                     # PostCSS (traite Tailwind)
├── package.json                          # Dépendances npm
├── .gitignore                            # Fichiers à ignorer
├── .env.example                          # Variables d'env (template)
│
├── README.md                             # Démarrage rapide
├── GUIDE_DEVELOPMENT.md                  # Ce fichier : guide de développement
└── ARCHITECTURE.md                       # Détails de l'architecture
```

---

## 🔄 Flux de données et état

### Modèle de composants

```
App
 └─ Dashboard (gère activeTab)
     ├─ Header (stateless)
     ├─ TabNavigation (onChange: setActiveTab)
     └─ renderPage() → Affiche l'onglet actif
         ├─ DashboardPage
         ├─ Companies (useState pour companies, search, etc.)
         ├─ Users (useState pour users, search, etc.)
         ├─ Trainings (useState pour trainings, etc.)
         └─ News (useState pour newsItems, etc.)
```

### Gestion d'état (pour l'instant)

**Local state avec `useState`** : Chaque page gère ses propres données.

```jsx
// Dans Companies.jsx
const [companies, setCompanies] = useState([...])
const [searchQuery, setSearchQuery] = useState('')
```

**Futur** : Migrer vers Context API ou Zustand pour état global.

---

## 📦 Composants clés

### 1. **Dashboard.jsx** — Orchestrateur principal

**Responsabilités** :
- Gère l'état de l'onglet actif
- Render des sous-pages selon l'onglet
- Définit la structure globale (Header + TabNav + Content)

**Props** : Aucune
**État** : `activeTab`

```jsx
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  // ...
  return (
    <Header />
    <TabNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    {renderPage()}
  )
}
```

### 2. **Header.jsx** — Haut de page

**Responsabilités** :
- Affiche logo + titre "Maison de l'Économie"
- Affiche profil utilisateur (nom, initiales)

**Props** : Aucune
**État** : Aucun

```jsx
export default function Header() {
  return (
    <header>
      {/* Logo */}
      {/* Profil utilisateur */}
    </header>
  )
}
```

### 3. **TabNavigation.jsx** — Onglets

**Responsabilités** :
- Affiche les 5 onglets
- Surligne l'onglet actif
- Appelle `setActiveTab` au clic

**Props** :
- `tabs` : Array d'objets `{ id, label, icon }`
- `activeTab` : String (id de l'onglet actif)
- `setActiveTab` : Function

```jsx
export default function TabNavigation({ tabs, activeTab, setActiveTab }) {
  return (
    <nav>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={activeTab === tab.id ? 'active' : ''}
        >
          {tab.icon} {tab.label}
        </button>
      ))}
    </nav>
  )
}
```

### 4. **Pages/** — Contenu par onglet

Chaque page (`Companies.jsx`, `Users.jsx`, etc.) est indépendante :

- Gère son propre état (`companies`, `search`, etc.)
- Récupère les données via mockup ou API
- Affiche des listes, cartes, formulaires

Exemple structure :

```jsx
export default function Companies() {
  const [companies, setCompanies] = useState([...])
  const [searchQuery, setSearchQuery] = useState('')
  
  const filteredCompanies = companies.filter(...)
  
  return (
    <div>
      <h2>Entreprises</h2>
      <input onChange={...} placeholder="Rechercher..." />
      <div className="grid">
        {filteredCompanies.map(company => (
          <div key={company.id} className="card">
            {/* Contenu du card */}
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🎨 Système de design

### Couleurs

Définies dans `tailwind.config.js` :

```js
colors: {
  primary: {
    light: '#7ec843',    // Boutons, accents actifs
    DEFAULT: '#5da020',  // Texte primaire, bordures
    dark: '#4a7a1a',     // Hover, états
  },
  gray: {
    50: '#f9fafb',       // Fond très clair
    100: '#f3f4f6',      // Fond secondaire
    // ...
    900: '#111827',      // Texte sombre
  }
}
```

**Utilisation** :

```jsx
className="bg-primary-light"        // Fond vert clair
className="text-primary"            // Texte vert
className="hover:bg-primary"        // Survol
className="bg-gray-50"              // Fond gris clair
className="text-gray-700"           // Texte gris moyen
```

### Classes personnalisées

Définies dans `src/index.css` avec `@apply` :

```css
.btn-primary {
  @apply px-4 py-2 bg-primary-light hover:bg-primary text-white font-semibold rounded transition-colors;
}

.card {
  @apply bg-white rounded-lg shadow-md p-6 border border-gray-100;
}

.badge {
  @apply inline-block px-3 py-1 rounded-full text-sm font-medium;
}
```

**Utilisation** :

```jsx
<button className="btn-primary">Cliquer</button>
<div className="card">Contenu</div>
<span className="badge badge-success">✓ Actif</span>
```

### Icônes

Utilise `lucide-react` (déjà installé) :

```jsx
import { Plus, Edit2, MapPin, Users, Mail } from 'lucide-react'

<Plus size={20} />
<Edit2 size={18} className="text-primary-light" />
```

**Icônes disponibles** : Visite https://lucide.dev pour la liste complète.

---

## 📐 Breakpoints Tailwind

```
Default (mobile)           < 640px
sm (small)                 ≥ 640px
md (medium)                ≥ 768px
lg (large)                 ≥ 1024px
xl (extra-large)           ≥ 1280px
2xl                        ≥ 1536px
```

**Exemple responsive** :

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 colonne par défaut, 2 sur tablets, 3 sur desktop */}
</div>
```

---

## 🔐 Intégration API (Futur)

### Structure préconisée

Crée un dossier `src/api/` :

```
src/
├── api/
│   ├── auth.js           # Endpoints /auth/*
│   ├── companies.js      # Endpoints /companies
│   ├── users.js          # Endpoints /users
│   ├── trainings.js      # Endpoints /trainings
│   ├── messages.js       # Endpoints /messages
│   └── client.js         # Fetch client centralisé avec JWT
├── context/              # Contexte React (auth, user, etc.)
├── hooks/                # Custom hooks (useAuth, useFetch, etc.)
└── ...
```

### Client centralisé avec JWT

```js
// src/api/client.js
const API_URL = import.meta.env.VITE_API_URL

export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('jwt_token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })
  
  if (response.status === 401) {
    // Token expiré, rediriger vers login
    window.location.href = '/login'
  }
  
  return response.json()
}
```

### Utilisation

```js
// src/api/companies.js
import { apiCall } from './client'

export function getCompanies() {
  return apiCall('/companies')
}

export function createCompany(data) {
  return apiCall('/companies', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
```

```jsx
// src/components/pages/Companies.jsx
import { getCompanies } from '../../api/companies'

export default function Companies() {
  const [companies, setCompanies] = useState([])
  
  useEffect(() => {
    getCompanies()
      .then(data => setCompanies(data))
      .catch(err => console.error(err))
  }, [])
  
  // ...
}
```

---

## 🧪 Tests (Optionnel pour MVP)

Quand tu seras prêt, ajoute Jest + React Testing Library :

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest @babel/preset-react @babel/preset-env
```

Exemple test :

```js
// src/components/Header.test.jsx
import { render, screen } from '@testing-library/react'
import Header from './Header'

test('affiche le titre', () => {
  render(<Header />)
  expect(screen.getByText(/Maison de l'Économie/i)).toBeInTheDocument()
})
```

---

## 🚀 Checklist avant production

- [ ] Retirer les données mockées, connecter à l'API
- [ ] Implémenter l'auth JWT et les redirects
- [ ] Tester sur différentes résolutions (mobile, tablet, desktop)
- [ ] Vérifier accessibilité (WCAG 2.1 AA minimum)
- [ ] Ajouter gestion d'erreurs et loading states
- [ ] Performance : lazy load les pages
- [ ] SEO : add meta tags, Open Graph
- [ ] Déployer sur Vercel/Netlify/AWS

---

## 📚 Ressources utiles

- **Tailwind CSS** : https://tailwindcss.com/docs
- **React Docs** : https://react.dev
- **Vite** : https://vitejs.dev/guide/
- **Lucide Icons** : https://lucide.dev
- **Lucide React** : https://github.com/lucide-org/lucide

---

Voilà, tu as une base solide. Commence à développer et n'hésite pas à restructurer selon tes besoins ! 🚀
