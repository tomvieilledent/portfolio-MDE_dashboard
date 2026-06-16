# Frontend — Guide de développement et modification

## ✅ État du projet

Le frontend React est **prêt à l'emploi** avec :

- ✅ Navigation par onglets (5 sections)
- ✅ Mockups reproduits à partir de la maquette Figma
- ✅ Design responsive (mobile/tablet/desktop)
- ✅ Tailwind CSS avec couleurs Maison de l'Économie
- ✅ Composants modulaires et réutilisables
- ✅ Données de test pour développement rapide

---

## 🎯 Sections implémentées

| Onglet | Fichier | Description |
|--------|---------|-------------|
| 📊 Tableau de bord | `DashboardPage.jsx` | Aperçu avec stats et accès rapide |
| 🏢 Entreprises | `Companies.jsx` | Liste et recherche d'entreprises (reproduit la maquette) |
| 👥 Trombinoscope | `Users.jsx` | Annuaire des collaborateurs |
| 📚 Formations | `Trainings.jsx` | Catalogue de formations avec inscriptions |
| 📰 Veille économique | `News.jsx` | Flux d'actualités par catégorie |

---

## 🚀 Pour démarrer

```bash
cd frontend
npm install      # Une fois seulement
npm run dev      # Lance le serveur sur http://localhost:3000
```

Le site s'ouvrira automatiquement dans ton navigateur.

---

## 🎨 Comment personnaliser

### 1. Changer les couleurs

Édite `tailwind.config.js` (ligne ~13) :

```js
colors: {
  primary: {
    light: '#7ec843',    // Vert clair (boutons, accents)
    DEFAULT: '#5da020',  // Vert principal
    dark: '#4a7a1a',     // Vert foncé (hover)
  },
}
```

### 2. Modifier le contenu (entreprises, utilisateurs, etc.)

Chaque page a des données mockées au début du composant avec `useState` :

**Exemple — Ajouter une entreprise :**

Ouvre `src/components/pages/Companies.jsx` ligne ~10 et ajoute un objet au tableau :

```jsx
{
  id: 5,
  name: 'Ma Nouvelle Entreprise',
  sector: 'Mon secteur',
  location: 'Paris',
  joinDate: 'Membre depuis 2026',
  employees: '10 employés',
  status: 'Active',
  icon: '💼',
}
```

### 3. Ajouter un nouvel onglet

**Étape 1** : Crée `src/components/pages/MonOnglet.jsx`

```jsx
export default function MonOnglet() {
  return (
    <div>
      <h2 className="text-2xl font-bold">Mon contenu</h2>
      {/* Ton HTML ici */}
    </div>
  )
}
```

**Étape 2** : Importe-le dans `Dashboard.jsx`

```jsx
import MonOnglet from './pages/MonOnglet'
```

**Étape 3** : Ajoute-le à la liste des tabs dans `Dashboard.jsx`

```jsx
const tabs = [
  // ... onglets existants
  { id: 'mononglet', label: 'Mon Onglet', icon: '⭐' },
]
```

**Étape 4** : Ajoute le cas dans la fonction `renderPage()`

```jsx
case 'mononglet':
  return <MonOnglet />
```

---

## 🔌 Connecter à l'API Backend

Une fois le backend prêt, remplace les données mockées par des appels API.

### Exemple : Récupérer les entreprises depuis l'API

Avant (mockées) :

```jsx
const [companies, setCompanies] = useState([
  { id: 1, name: 'Tech Innovators', ... },
  // ...
])
```

Après (API) :

```jsx
const [companies, setCompanies] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  fetch(import.meta.env.VITE_API_URL + '/companies')
    .then(res => res.json())
    .then(data => {
      setCompanies(data)
      setLoading(false)
    })
    .catch(err => {
      setError(err.message)
      setLoading(false)
    })
}, [])

// Dans le JSX, affiche un loader ou une erreur si besoin
if (loading) return <div>Chargement...</div>
if (error) return <div>Erreur : {error}</div>
```

Le fichier `.env.example` contient déjà :

```
VITE_API_URL=http://localhost:5000/api
```

---

## 📚 Structure CSS et classes réutilisables

### Classes Tailwind personnalisées (définies dans `src/index.css`)

```jsx
// Boutons
<button className="btn-primary">Bouton vert</button>
<button className="btn-secondary">Bouton gris</button>

// Cartes
<div className="card">
  Contenu avec fond blanc, ombre et padding
</div>

// Badges
<span className="badge badge-success">✓ Actif</span>
```

### Tailwind Standards à connaître

```jsx
// Spacing
className="p-4"           // Padding
className="mb-6"          // Margin bottom
className="gap-2"         // Gap entre flex items

// Text
className="text-gray-900"  // Couleur
className="font-bold"      // Poids
className="text-sm"        // Taille

// Layout
className="flex items-center"      // Flexbox
className="grid grid-cols-2"       // Grid 2 colonnes
className="md:grid-cols-3"         // 3 colonnes sur écrans moyens

// States
className="hover:shadow-lg"        // Au survol
className="transition-colors"      // Animation douce
```

---

## 🔍 Où faire des modifications courantes

| Besoin | Fichier | Ligne |
|--------|---------|-------|
| Changer le logo/en-tête | `Header.jsx` | ~5 |
| Ajouter une couleur | `tailwind.config.js` | ~13 |
| Modifier entreprises | `Companies.jsx` | ~10 |
| Modifier utilisateurs | `Users.jsx` | ~10 |
| Modifier formations | `Trainings.jsx` | ~8 |
| Modifier actualités | `News.jsx` | ~8 |
| Ajouter un onglet | `Dashboard.jsx` | ~10 et ~40 |

---

## 💡 Conseils de développement

1. **Utilise les DevTools React** : Chrome Extension "React Developer Tools"
2. **Vérouille hot-reload** : Le code se met à jour automatiquement quand tu sauvegardes
3. **Teste d'abord les maquettes** : Assure-toi que les proportions/couleurs correspondent à Figma
4. **Réutilise les composants** : Ne répète pas du JSX, crée des sous-composants
5. **Gère l'état proprement** : Utilise `useState` pour le local, prépare-toi pour Context API/Zustand

---

## 🛠 Si tu rencontres un problème

### npm install ne fonctionne pas

```bash
rm -rf node_modules package-lock.json
npm install
```

### Port 3000 déjà utilisé

Édite `vite.config.js` et change le port :

```js
server: {
  port: 3001,  // Nouveau port
  open: true
}
```

### Styles ne s'appliquent pas

Assure-toi que `index.css` est importé dans `App.jsx` :

```jsx
import './index.css'
```

---

## 📋 Checklist pour évolutions futures

- [ ] Intégrer authentification JWT
- [ ] Ajouter formulaires (React Hook Form)
- [ ] WebSocket pour messaging temps réel
- [ ] Pagination et filtres avancés
- [ ] Dark mode (avec Tailwind)
- [ ] Tests unitaires (Jest + React Testing Library)
- [ ] Gestion d'état centralisée (Zustand ou Context)
- [ ] Déployer sur Vercel/Netlify

---

## 📞 Questions fréquentes

**Q: Comment ajouter une icône ?**
A: Utilise `lucide-react` qui est déjà installé :
```jsx
import { Plus, Edit2, Mail } from 'lucide-react'
<Plus size={20} />
```

**Q: Comment faire une modal/popup ?**
A: Pour maintenant, simule-la avec un état et du CSS. Plus tard, utilise une librairie comme `headlessui`.

**Q: Dois-je utiliser TypeScript ?**
A: Pas obligatoire pour l'MVP, mais recommandé après. Tu peux ajouter `.ts/.tsx` progressivement.

---

Bonne chance et n'hésite pas à expérimenter ! 🚀
