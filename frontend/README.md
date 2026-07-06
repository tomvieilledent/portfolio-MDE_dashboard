# MDE Dashboard — Frontend React

Frontend React de la "Maison de l'Économie" : dashboard, entreprises, trombinoscope,
formations/ateliers, veille économique, agenda, messagerie interne temps réel et
gestion (admin/staff). Branché sur l'API backend Flask (voir `../CLAUDE.md`).

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx         # Conteneur principal, navigation par onglets (activeTab)
│   │   ├── Header.jsx            # En-tête, profil, notifications
│   │   ├── TabNavigation.jsx     # Navigation par onglets (selon le rôle)
│   │   ├── Messagerie.jsx        # Chat interne temps réel (Socket.IO)
│   │   ├── NotificationsBell.jsx # Invitations & notifications
│   │   ├── modals/                # Formulaires modaux (entreprise, formation, session, compte...)
│   │   └── pages/                 # Une page par onglet (Dashboard, Companies, Users, Trainings, News, Gestion, MonEntreprise, LandingPage...)
│   ├── context/AuthContext.jsx   # Session JWT, rôle dérivé (admin / patron / salarié)
│   ├── lib/api.js                # Client fetch centralisé vers l'API REST
│   ├── lib/socket.js             # Client socket.io (auth JWT)
│   ├── App.jsx                   # Point d'entrée React
│   ├── main.jsx                  # Bootstrap React DOM
│   └── index.css                 # Styles Tailwind
├── index.html                    # HTML de base
├── vite.config.js                # Configuration Vite
├── tailwind.config.js            # Configuration Tailwind CSS
└── package.json                  # Dépendances
```

La navigation est basée sur un état (`activeTab` dans `Dashboard.jsx`), pas sur
`react-router` — pas de routing par URL.

## 🚀 Démarrage rapide

Le backend Flask doit tourner en parallèle (voir `../CLAUDE.md`, `python -m backend.api.run`, port 8000).

### 1. Installer les dépendances

```bash
npm install
```

### 2. Lancer le serveur de développement

```bash
npm run dev
```

Le dashboard est servi sur `http://localhost:3000`.

### 3. Builder pour la production

```bash
npm run build
```

Les fichiers compilés sont générés dans `dist/` (ignoré par git).

## 🔗 API

Toutes les données viennent de l'API REST + Socket.IO du backend via `src/lib/api.js`
et `src/lib/socket.js` (URL configurable via `VITE_API_URL`, voir `.env.example`).
L'authentification est gérée par `AuthContext` (JWT stocké côté client, rôle dérivé
de `is_super_admin` + rattachement entreprise).

## 🎨 Personnalisation

Édite `tailwind.config.js` pour modifier le vert primaire :

```js
colors: {
  primary: {
    light: '#7ec843',
    DEFAULT: '#5da020',
    dark: '#4a7a1a',
  },
}
```

## 🛠 Technologies

- **React 18** — UI
- **Vite** — build tool
- **Tailwind CSS** — styles utilitaires
- **socket.io-client** — chat temps réel
- **Lucide React** — icônes
