# 🚀 START HERE

## 1️⃣ Voir le site maintenant

```
Ouvre ton navigateur → http://localhost:3000
```

**Le serveur tourne déjà !**

Si ce n'est pas le cas :

```bash
cd /Users/nab/portfolio-MDE_dashboard/frontend
npm run dev
```

---

## 2️⃣ Parcourir le dashboard

- Clique sur les 5 onglets du menu (haut)
- Essaie la recherche sur "Entreprises" et "Trombinoscope"
- Vérifiez que les couleurs correspondent à ta maquette Figma
- Teste sur mobile (F12 → Responsive)

---

## 3️⃣ Faire ta première modif

### Ajouter une entreprise

Ouvre : `src/components/pages/Companies.jsx`

Ligne ~10, ajoute ceci dans le tableau :

```jsx
{
  id: 5,
  name: 'Ma Nouvelle Entreprise',
  sector: 'Mon Secteur',
  location: 'Paris',
  joinDate: 'Membre depuis 2026',
  employees: '10 employés',
  status: 'Active',
  icon: '💼',
}
```

Sauve (Cmd+S) → **Le site se met à jour automatiquement** ✨

---

## 4️⃣ Changer les couleurs

Ouvre : `tailwind.config.js`

Ligne ~18, change le vert :

```js
primary: {
  light: '#VOTRE_COULEUR_1',
  DEFAULT: '#VOTRE_COULEUR_2',
  dark: '#VOTRE_COULEUR_3',
}
```

Exemples :

```
Bleu      : light: '#60a5fa', DEFAULT: '#3b82f6', dark: '#1e40af'
Rose      : light: '#f472b6', DEFAULT: '#ec4899', dark: '#be185d'
Orange    : light: '#fb923c', DEFAULT: '#f97316', dark: '#c2410c'
```

Sauve → Couleurs changées partout 🎨

---

## 5️⃣ Ajouter un nouvel onglet

### Étape 1 : Crée le fichier

`src/components/pages/MonOnglet.jsx`

```jsx
export default function MonOnglet() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Mon Onglet</h2>
      <p>Contenu ici</p>
    </div>
  )
}
```

### Étape 2 : Importe dans Dashboard.jsx

Ligne ~3, ajoute :

```jsx
import MonOnglet from './pages/MonOnglet'
```

### Étape 3 : Ajoute le tab

Ligne ~10, ajoute :

```jsx
{ id: 'mononglet', label: 'Mon Onglet', icon: '⭐' },
```

### Étape 4 : Ajoute le case

Ligne ~42 (dans `renderPage()`), ajoute :

```jsx
case 'mononglet':
  return <MonOnglet />
```

Sauve → Nouvel onglet actif ! 🎯

---

## 6️⃣ Questions rapides

### Comment redémarrer le serveur ?

```bash
Ctrl+C (dans le terminal)
npm run dev
```

### Comment arrêter le serveur ?

```bash
Ctrl+C (dans le terminal)
```

### Comment voir le code source du composant ?

F12 → Onglet React (React DevTools)

### Comment faire des tests sur mobile ?

F12 → Clic sur "Toggle device toolbar" (Cmd+Shift+M)

---

## 📚 Lis ensuite (dans cet ordre)

1. ✅ **Ce fichier** (tu l'es en train de faire)
2. 📖 `README.md` — Démarrage 5 min
3. 📖 `GUIDE_DEVELOPMENT.md` — Guide complet 20 min
4. 📖 `CHEATSHEET.md` — Commandes et patterns 10 min

---

## 🎯 Ton objectif pour aujourd'hui

- [ ] Lance le serveur (`npm run dev`)
- [ ] Visite `http://localhost:3000`
- [ ] Clique sur les 5 onglets
- [ ] Ajoute une entreprise (voir section 3️⃣)
- [ ] Change une couleur (voir section 4️⃣)
- [ ] Lis `README.md`

**Fait ? Bravo ! 🎉**

---

## 🚨 SOS

| Problème | Solution |
|----------|----------|
| Rien ne s'affiche | Relance le serveur : Ctrl+C → `npm run dev` |
| Port 3000 occupé | Change le port dans `vite.config.js` ligne 5 |
| Styles cassés | Redémarre le serveur |
| Icône n'apparaît pas | Visite https://lucide.dev pour le bon nom |
| Onglet ne fonctionne pas | Vérifie que tu as ajouté le `case` dans Dashboard.jsx |

---

## ⚡ Commandes essentielles

```bash
# Démarrer
npm run dev

# Build pour production
npm run build

# Voir en prod localement
npm run preview

# Installer un package
npm install nom-du-package
```

---

## 🎓 Prochaines étapes progressives

1. **Aujourd'hui** : Explore, modifie, amuse-toi
2. **Demain** : Lis `GUIDE_DEVELOPMENT.md`
3. **Semaine 1** : Connecte l'API backend (Tom)
4. **Semaine 2** : Ajoute auth JWT + formulaires
5. **Semaine 3** : WebSocket + messagerie temps réel

---

**C'est tout ! À toi de jouer ! 🚀**

Questions ? Lis les autres fichiers ou appelle l'équipe.
