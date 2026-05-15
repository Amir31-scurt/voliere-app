# 🐦 Volière App — Frontend

Interface web moderne pour la gestion d'un colombier (pigeons, couples, cages, reproductions et sorties).

## 🛠️ Stack technique

| Outil | Rôle |
|-------|------|
| **React 18** + **Vite** | Framework & bundler |
| **Redux Toolkit** + **RTK Query** | State management & appels API |
| **Framer Motion** | Animations & transitions |
| **Tailwind CSS** | Styles utilitaires |
| **React Hook Form** | Gestion des formulaires |
| **Lucide React** | Icônes |
| **React Hot Toast** | Notifications |
| **Socket.IO Client** | Temps réel (mises à jour des cages) |
| **date-fns** | Manipulation des dates |

---

## 📁 Structure du projet

```
client/
├── public/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── auth/            # Login, PrivateRoute
│   │   ├── cages/           # CageCard, CageGrid, CageDetailPanel, CageForm…
│   │   ├── common/          # Button, Modal, ConfirmDialog, Loader…
│   │   ├── couples/         # CoupleCard, CoupleDetailModal, CoupleList…
│   │   ├── pigeons/         # PigeonCard, PigeonForm, PigeonDetailModal…
│   │   ├── reproductions/   # ReproductionForm, ReproductionList, ReproductionUpdateModal…
│   │   └── sorties/         # SortieForm, SortieList
│   ├── context/
│   │   └── SocketContext.jsx  # Connexion Socket.IO globale
│   ├── hooks/               # Hooks personnalisés
│   ├── pages/               # Pages de l'application
│   │   ├── LoginPage.jsx
│   │   ├── PigeonsPage.jsx
│   │   ├── CouplesPage.jsx
│   │   ├── VolierePage.jsx
│   │   ├── ReproductionsPage.jsx
│   │   └── SortiesPage.jsx
│   ├── store/
│   │   ├── api/             # RTK Query endpoints
│   │   │   ├── baseApi.js
│   │   │   ├── pigeonApi.js
│   │   │   ├── coupleApi.js
│   │   │   ├── cageApi.js
│   │   │   ├── reproductionApi.js
│   │   │   └── sortieApi.js
│   │   └── store.js
│   ├── utils/
│   │   ├── constants.js     # VOLIERES, constantes globales
│   │   └── helpers.js       # formatDate, formatAge, getSexeLabel…
│   ├── App.jsx              # Routage principal
│   ├── main.jsx             # Point d'entrée
│   └── index.css            # Design system (tokens, composants CSS)
├── .env                     # Variables d'environnement (non committé)
├── .env.example             # Template des variables
├── index.html
├── package.json
└── vite.config.js
```

---

## ⚡ Démarrage rapide

### Prérequis
- Node.js ≥ 18
- Le serveur backend doit être démarré (voir `../server/README.md`)

### Installation

```bash
cd client
npm install
```

### Variables d'environnement

Créez un fichier `.env` à partir du template :

```bash
cp .env.example .env
```

Contenu minimal `.env` :

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Lancement en développement

```bash
npm run dev
```

L'application sera disponible sur **http://localhost:3000**

### Build production

```bash
npm run build
npm run preview
```

---

## 🎨 Design System

Le design system complet est défini dans `src/index.css` :

| Token | Description |
|-------|-------------|
| `.btn`, `.btn-primary`, `.btn-danger`… | Boutons |
| `.badge`, `.badge-pigeon`, `.badge-couple`… | Badges de statut |
| `.input`, `.label` | Formulaires |
| `.section-title` | Titres de sections |
| `.panel-scroll` | Scroll dans les panneaux latéraux |
| `.timeline-item` | Items d'historique |

---

## 🔌 API & State management

Les appels API sont gérés via **RTK Query** avec cache automatique et invalidation :

```js
// Exemple d'utilisation dans un composant
import { useGetPigeonsQuery, useDeletePigeonMutation } from '../../store/api/pigeonApi';

const { data, isLoading } = useGetPigeonsQuery({ statut: 'actif' });
const [deletePigeon] = useDeletePigeonMutation();
```

### Tags RTK Query

| Tag | Invalidé par |
|-----|-------------|
| `Pigeon` | CRUD pigeon, sortie, clôture reproduction |
| `Couple` | CRUD couple, séparation, affectation cage |
| `Cage` | CRUD cage, affecter, libérer |
| `Reproduction` | Création, mise à jour |

---

## 🔄 Temps réel (Socket.IO)

Les mises à jour de cages sont reçues en temps réel via `SocketContext` :

```js
// Événements reçus
socket.on('cage:updated', ({ cageId, statut }) => { /* ... */ });
```

---

## 🧩 Fonctionnalités

### 🐦 Pigeons
- CRUD complet (ajouter, modifier, consulter, supprimer)
- Soft delete intelligent (archivage si descendants)
- Arbre généalogique (père / mère affichés)
- Filtres par statut et sexe

### 💕 Couples
- Créer un couple (sélection mâle + femelle disponibles)
- Consulter la liste des couples actifs
- Rompre un couple
- Voir l'historique de reproductions

### 🏠 Volière (Cages)
- Vue grille ou liste
- Cliquer sur une cage libre → affecter pigeon ou couple
- Cliquer sur une cage occupée → voir détail + libérer
- Modifier et supprimer une cage
- Historique complet des événements par cage

### 🥚 Reproductions
- Enregistrer une ponte (couple, date, nombre d'œufs)
- Calendrier automatique (éclosion prévue +18j, envol +30j)
- Enregistrer l'éclosion (date réelle, nombre d'éclos)
- Clôturer l'élevage : saisir bague + nom + sexe par pigeonneau
- Création automatique des pigeonneaux en base avec généalogie et race calculée

### 📤 Sorties
- Vente (date, prix, acheteur)
- Décès (date, cause probable)
- Perte (date, circonstance)
- Libération automatique de la cage et séparation du couple

---

## 🚀 Déploiement

```bash
npm run build
# Déployer le dossier dist/ sur Netlify, Vercel, ou un serveur nginx
```

> ⚠️ Pensez à configurer les variables d'environnement de production sur votre hébergeur.
