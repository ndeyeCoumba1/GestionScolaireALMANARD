# Al-Manard3s - Système de Gestion Scolaire

Système de gestion scolaire complet avec double portail (Français/Arabe) pour l'école Al-Manard3s.

## 📋 Description

Al-Manard3s est une application web moderne de gestion scolaire qui permet de gérer les élèves, parents, classes, paiements, dépenses, et un module spécialisé pour le Coran avec suivi de la mémorisation.

### Fonctionnalités Principales

- **Gestion des Élèves** : Inscription, modification, consultation des profils
- **Gestion des Parents** : Suivi des parents et leurs informations
- **Gestion des Classes** : Organisation par niveaux et capacités
- **Gestion des Paiements** : Suivi des frais scolaires, impayés, reçus PDF
- **Gestion des Dépenses** : Suivi des dépenses de l'école
- **Module Coran** : 
  - Enregistrement des séances de récitation
  - Suivi de la mémorisation par niveau
  - Historique des séances
  - Statistiques de progression
- **Double Portail** :
  - Portail Français : Administration, finance, inscriptions
  - Portail Arabe (RTL) : Module Coran avec interface arabe

## 🛠️ Stack Technique

### Frontend
- **React 18** - Framework JavaScript
- **TypeScript** - Typage statique
- **Vite** - Build tool et dev server
- **React Router DOM** - Gestion du routing
- **Bootstrap 5** - Framework CSS
- **Recharts** - Graphiques et visualisation
- **Lucide React** - Icônes
- **react-hot-toast** - Notifications
- **Axios** - Client HTTP

### Autres
- **Google Fonts** - Police Amiri pour l'arabe
- **jsPDF** - Génération de reçus PDF

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Étapes d'installation

```bash
# Cloner le repository
git clone <repository-url>
cd gestion-scolaire-front

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Builder pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

## 🚀 Utilisation

### Connexion

L'application dispose d'une page de connexion bilingue avec deux colonnes :

- **Côté Gauche (Français)** : Pour l'accès administratif, financier et inscriptions
  - Redirection vers `/dashboard`
  - Rôles : ADMIN, COMPTABLE, ENSEIGNANT

- **Côté Droit (Arabe)** : Pour l'accès au module Coran
  - Redirection vers `/ar/dashboard`
  - Rôles : ADMIN, ENSEIGNANT
  - Interface RTL avec police Amiri

### Rôles et Permissions

| Rôle | Accès Dashboard FR | Accès Portail AR | Paiements | Dépenses | Élèves | Classes | Coran |
|------|-------------------|------------------|-----------|----------|--------|--------|-------|
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| COMPTABLE | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| ENSEIGNANT | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |

## 🏗️ Architecture

### Structure du Projet

```
src/
├── api/
│   └── axios.ts              # Configuration Axios
├── components/
│   ├── Common/
│   │   └── SkeletonLoader.tsx
│   ├── Coran/
│   │   ├── EleveRecitationRow.tsx
│   │   ├── NiveauBadge.tsx
│   │   ├── SeanceStatsBar.tsx
│   │   └── VersetSelector.tsx
│   └── Layout/
│       ├── ArLayout.tsx     # Layout RTL pour portail arabe
│       ├── Layout.tsx       # Layout français
│       └── Sidebar.tsx      # Sidebar navigation
├── Context/
│   └── AuthContext.tsx      # Gestion authentification
├── pages/
│   ├── ar/                  # Pages portail arabe
│   │   ├── ArDashboardPage.tsx
│   │   ├── SeanceCoranPage.tsx
│   │   ├── HistoriqueCoranPage.tsx
│   │   └── StatistiquesCoranPage.tsx
│   ├── auth/
│   │   └── LoginPage.tsx    # Page de connexion bilingue
│   ├── coran/               # Pages module Coran (FR)
│   │   ├── SeanceCoranPage.tsx
│   │   ├── HistoriqueCoranPage.tsx
│   │   └── StatistiquesCoranPage.tsx
│   ├── Dashboard.tsx
│   ├── eleves/
│   ├── parents/
│   ├── classes/
│   ├── Annees/
│   ├── paiements/
│   ├── depenses/
│   ├── users/
│   └── rapports/
├── services/
│   └── coranService.ts      # API Coran
├── Types/
│   ├── coran.ts             # Types Coran
│   └── index.ts             # Types généraux
├── utils/
│   └── exportUtils.ts       # Utilitaires PDF
├── App.tsx                 # Configuration routing
├── index.css               # Styles globaux
└── main.tsx                # Point d'entrée
```

### Système Double Portail

#### Portail Français (`/`)
- Layout LTR avec sidebar à gauche
- Navigation en français
- Accès : Dashboard, Élèves, Parents, Classes, Années, Paiements, Dépenses, Utilisateurs, Rapports

#### Portail Arabe (`/ar/*`)
- Layout RTL avec sidebar à droite
- Navigation en arabe avec police Amiri
- Accès : لوحة القيادة، جلسة التلاوة، السجل، الإحصائيات
- Routes protégées par `ArProtectedRoute`

#### Gestion du Portail
Le portail est stocké dans `localStorage` sous la clé `portail` :
- `'FR'` pour le portail français
- `'AR'` pour le portail arabe

Les routes sont protégées par :
- `ProtectedRoute` : Vérifie token et portail !== 'AR' pour routes FR
- `ArProtectedRoute` : Vérifie token et portail === 'AR' pour routes AR

## 🔌 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
  - Body: `{ email, password }`
  - Response: `{ token, role, nom, prenom }`

### Élèves
- `GET /api/eleves` - Liste des élèves
- `GET /api/eleves/:id` - Détails d'un élève
- `POST /api/eleves` - Créer un élève
- `PUT /api/eleves/:id` - Modifier un élève
- `DELETE /api/eleves/:id` - Supprimer un élève
- `GET /api/eleves/classe/:classeId` - Élèves par classe

### Parents
- `GET /api/parents` - Liste des parents
- `POST /api/parents` - Créer un parent
- `PUT /api/parents/:id` - Modifier un parent

### Classes
- `GET /api/classes` - Liste des classes
- `POST /api/classes` - Créer une classe
- `PUT /api/classes/:id` - Modifier une classe

### Paiements
- `GET /api/paiements` - Liste des paiements
- `POST /api/paiements` - Créer un paiement
- `PUT /api/paiements/:id` - Modifier un paiement

### Dépenses
- `GET /api/depenses` - Liste des dépenses
- `POST /api/depenses` - Créer une dépense
- `PUT /api/depenses/:id` - Modifier une dépense

### Module Coran
- `GET /api/coran/versets-jour` - Versets du jour
- `POST /api/coran/seance` - Créer une séance
- `GET /api/coran/seances/historique/:classeId` - Historique des séances
- `GET /api/coran/statistiques/classe/:classeId` - Statistiques par classe
- `GET /api/coran/statistiques/eleve/:eleveId` - Statistiques par élève

## 🎨 Styles

### Couleurs
- **Primaire** : `#0A6E3F` (Vert)
- **Secondaire** : `#0f9d58` (Vert clair)
- **Arrière-plan** : `#f4f9f6` (Vert très clair)

### Police Arabe
- **Amiri** (Google Fonts) pour le texte arabe
- Appliquée via la classe `.ar-portal`

### RTL Support
- `dir="rtl"` sur les éléments du portail arabe
- Sidebar positionnée à droite
- Marges et padding adaptés pour RTL

## 📝 Développement

### Scripts Disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build pour production
npm run preview      # Prévisualiser le build
npm run lint         # Linter ESLint
```

### Configuration Environment

Créer un fichier `.env` à la racine :

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Conventions de Code

- **Components** : PascalCase (ex: `EleveForm.tsx`)
- **Fonctions** : camelCase (ex: `handleSubmit`)
- **Constants** : UPPER_SNAKE_CASE (ex: `API_BASE_URL`)
- **Types/Interfaces** : PascalCase (ex: `AuthResponse`)

## 🔐 Sécurité

- JWT token stocké dans localStorage
- Token envoyé dans le header `Authorization: Bearer <token>`
- Routes protégées par `ProtectedRoute` et `ArProtectedRoute`
- Redirection automatique vers `/login` si token invalide

## 🐛 Dépannage

### Problème : Redirection vers le mauvais portail
**Solution** : Vider le localStorage et reconnecter
```javascript
localStorage.clear()
```

### Problème : Interface arabe ne s'affiche pas correctement
**Solution** : Vérifier que la police Amiri est chargée dans `index.css`

### Problème : Erreur 401 sur les routes protégées
**Solution** : Vérifier que le token est valide dans localStorage

## 📄 Licence

Copyright © 2026 Al-Manard3s - Tous droits réservés

## 👥 Équipe

Développé pour l'école Al-Manard3s
