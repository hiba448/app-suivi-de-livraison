# 🚚 Application de Suivi de Livraison en Temps Réel

Un système de suivi de livraison en temps réel qui surveille les expéditions et les livreurs grâce à MongoDB Change Streams et WebSocket (Socket.IO).

> ⚠️ **Note importante — Simulation** : La position du livreur est entièrement **simulée** via un marqueur déplaçable sur la carte. Aucune géolocalisation réelle du navigateur n'est utilisée. Ce projet est un prototype de démonstration réalisé dans le cadre d'un projet académique à l'**ENSIAS — Université Mohammed V de Rabat**.

---

## 📋 Présentation

**Location Tracker** est une application full-stack permettant le suivi en temps réel des livraisons et des livreurs. Elle offre des mises à jour de position en direct, la gestion du statut des expéditions et le suivi des livraisons à travers une interface web interactive et une API backend robuste.

### Fonctionnalités principales

- **Suivi de position en temps réel** : surveillez la position des livreurs simulés grâce aux WebSockets
- **Gestion des livraisons** : créez et gérez des expéditions avec suivi de statut (en attente, en transit, livré)
- **Gestion des livreurs** : gérez les livreurs avec historique de position et statut
- **Mises à jour instantanées** : diffusion immédiate à tous les clients connectés via MongoDB Change Streams
- **Authentification JWT** : sécurisation des endpoints API par tokens
- **Support CORS** : partage de ressources entre origines pour la communication frontend
- **Interface responsive** : tableau de bord interactif développé avec React et TypeScript

---

## 🛠️ Stack technologique

### Backend
- **Node.js** avec TypeScript
- **Express.js** — framework API REST
- **MongoDB** (4.1) — base de données avec support Change Streams
- **Socket.IO** — communication bidirectionnelle en temps réel
- **JWT** — tokens d'authentification
- **bcryptjs** — hachage des mots de passe
- **Morgan** — journalisation des requêtes HTTP

### Frontend
- **React** — framework UI
- **TypeScript** — typage statique
- **Vite** — outil de build et serveur de développement
- **Socket.IO Client** — communication temps réel

---

## 📁 Structure du projet

```
app_suivi_de_livraison/
├── src/
│   ├── server.ts              # Configuration du serveur Express et Socket.IO
│   ├── app.ts                 # Configuration de l'application Express
│   ├── dbClient.ts            # Connexion MongoDB
│   ├── socketHandler.ts       # Gestionnaires d'événements Socket.IO
│   ├── createIndex.ts         # Création des index en base de données
│   ├── seed.ts                # Initialisation des données
│   ├── config.ts              # Paramètres de configuration
│   ├── constants.ts           # Constantes de l'application
│   ├── controller/            # Gestionnaires de requêtes
│   │   ├── user.ts
│   │   ├── shipment.ts
│   │   └── ping.ts
│   ├── services/              # Logique métier
│   │   ├── users/
│   │   ├── shipments/
│   │   └── deliveryAssociates/
│   ├── models/                # Modèles de données
│   │   ├── User.ts
│   │   ├── Shipment.ts
│   │   └── DeliveryAssociate.ts
│   ├── types/                 # Interfaces TypeScript
│   │   ├── IUser.ts
│   │   ├── IShipment.ts
│   │   ├── IDeliveryAssociate.ts
│   │   ├── AppRequest.ts
│   │   └── AppResponse.ts
│   ├── watchers/              # Observateurs MongoDB Change Streams
│   │   ├── shipment.ts
│   │   └── deliveryAssociates.ts
│   └── routes/                # Définition des routes API
├── frontend/                  # Application React frontend
├── package.json
├── tsconfig.json
└── yarn.lock
```

---

## ⚙️ Installation et exécution

### Prérequis

- **Node.js** (v18 ou supérieur)
- **MongoDB** (v4.1+) avec Change Streams activés (**Replica Set obligatoire**)
- **yarn** ou npm

> ⚠️ MongoDB doit être lancé en mode Replica Set pour activer les Change Streams :
> ```bash
> mongod --replSet rs0
> ```
> Puis dans le shell MongoDB : `rs.initiate()`

### Installation du backend

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/hiba448/app_suivi_de_livraison.git
   cd app_suivi_de_livraison
   ```

2. **Installer les dépendances**
   ```bash
   yarn install
   ```

3. **Configurer les variables d'environnement**

   Créer un fichier `.env` à la racine du projet :
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/location-tracker
   JWT_SECRET=votre_clé_secrète_jwt
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Lancer le serveur en développement**
   ```bash
   yarn dev
   ```
   Le serveur démarre sur `http://localhost:5000`

5. **Build pour la production**
   ```bash
   yarn build
   yarn start
   ```

### Installation du frontend

```bash
cd frontend
yarn install
yarn dev
```
Le frontend est accessible sur `http://localhost:3000`

---

## 📜 Scripts disponibles

### Backend

| Commande | Description |
|---|---|
| `yarn dev` | Démarre le serveur en développement avec rechargement automatique |
| `yarn build` | Compile TypeScript en JavaScript |
| `yarn start` | Lance le build de production compilé |
| `yarn watch-ts` | Surveille les fichiers TypeScript pour recompilation |

### Frontend

| Commande | Description |
|---|---|
| `yarn dev` | Démarre le serveur de développement Vite |
| `yarn build` | Build pour la production |
| `yarn preview` | Prévisualise le build de production |

---

## 🔌 Endpoints API

### Authentification
- `POST /api/auth/register` — Inscription d'un nouvel utilisateur
- `POST /api/auth/login` — Connexion utilisateur

### Utilisateurs
- `GET /api/users/:id` — Récupérer un utilisateur par ID
- `POST /api/users` — Créer un nouvel utilisateur

### Livraisons (Shipments)
- `GET /api/shipments` — Récupérer toutes les livraisons
- `GET /api/shipments/:id` — Récupérer une livraison par ID
- `POST /api/shipments` — Créer une nouvelle livraison
- `PUT /api/shipments/:id/status` — Mettre à jour le statut d'une livraison

### Livreurs (Delivery Associates)
- `GET /api/delivery-associates` — Récupérer tous les livreurs
- `POST /api/delivery-associates` — Créer un nouveau livreur
- `PUT /api/delivery-associates/:id/location` — Mettre à jour la position d'un livreur

### Vérification du serveur
- `GET /ping` — Vérification de l'état du serveur

---

## 🔄 Événements WebSocket

### Client → Serveur
- `UPDATE_DA_LOCATION` — Mise à jour de la position du livreur (simulée)
- `SUBSCRIBE_TO_SHIPMENT` — Abonnement aux mises à jour d'une livraison
- `SUBSCRIBE_TO_DA` — Abonnement aux mises à jour d'un livreur
- `LEAVE_ROOM` — Quitter une room d'abonnement

### Serveur → Client
- Événements déclenchés par les MongoDB Change Streams sur les collections `shipments` et `deliveryAssociates`

---

## 🗄️ Schéma de la base de données

### Collection `users`
```json
{
  "_id": "ObjectId",
  "email": "adam@example.com",
  "password": "(haché avec bcryptjs)",
  "name": "Adam",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Collection `shipments`
```json
{
  "_id": "ObjectId",
  "shipmentNumber": "String (unique)",
  "pickupLocation": { "type": "Point", "coordinates": [longitude, latitude] },
  "dropoffLocation": { "type": "Point", "coordinates": [longitude, latitude] },
  "status": "pending | in-transit | delivered",
  "deliveryAssociateId": "ObjectId",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Collection `deliveryAssociates`
```json
{
  "_id": "ObjectId",
  "email": "john@example.com",
  "name": "John",
  "location": { "type": "Point", "coordinates": [longitude, latitude] },
  "status": "active | inactive",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

> ⚠️ Le format GeoJSON impose l'ordre **[longitude, latitude]**. Les coordonnées sont mises à jour manuellement via le simulateur livreur.

---

## ⚡ Fonctionnement du temps réel

L'application utilise MongoDB Change Streams pour surveiller les modifications en base et émettre des mises à jour en temps réel :

1. **Observateur Shipments** — surveille les changements de statut des livraisons
2. **Observateur DeliveryAssociates** — surveille les mises à jour de position des livreurs

Ces observateurs émettent des événements vers des **rooms Socket.IO** identifiées par l'ID de la livraison ou du livreur, permettant à chaque client de ne recevoir que les informations qui le concernent.

```
MongoDB Change Stream détecte une écriture
        ↓
Backend émet un événement Socket.IO
        ↓
Room (shipmentId) → seul le client abonné reçoit la mise à jour
```

---

## 🔐 Authentification

L'application utilise JWT (JSON Web Tokens) pour sécuriser les endpoints :
- Un token est délivré lors d'une connexion réussie
- À inclure dans chaque requête protégée : `Authorization: Bearer <token>`
- Les tokens expirent après une durée configurable

---

## 📨 Format des réponses API

**Réponse en cas d'erreur :**
```json
{
  "data": [],
  "isError": true,
  "errMsg": "Message d'erreur"
}
```

**Réponse en cas de succès :**
```json
{
  "data": { },
  "isError": false,
  "errMsg": null
}
```

---

## 🌍 Variables d'environnement

| Variable | Description | Valeur par défaut |
|---|---|---|
| `NODE_ENV` | Mode d'environnement | `development` |
| `PORT` | Port du serveur | `5000` |
| `MONGODB_URI` | Chaîne de connexion MongoDB | `mongodb://localhost:27017/location-tracker` |
| `JWT_SECRET` | Clé secrète JWT | *(obligatoire)* |
| `CORS_ORIGIN` | Origines CORS autorisées | `*` |

---

## 🐛 Résolution des problèmes courants

### Problèmes de connexion MongoDB
- Vérifier que MongoDB est lancé et accessible à l'URI configurée
- Les Change Streams nécessitent un Replica Set MongoDB (même mono-nœud)

### Problèmes de connexion Socket.IO
- Vérifier que la configuration CORS correspond à l'origine de votre frontend
- S'assurer que le protocole WebSocket est autorisé sur votre réseau

### Erreurs de compilation TypeScript
- Nettoyer le dossier `dist` : `rm -rf dist`
- Réinstaller les dépendances : `yarn install`

---

## 🧪 Scénario de test

Pour tester l'application, ouvrir deux fenêtres de navigateur côte à côte :

1. Ouvrir le **simulateur livreur** et identifier le livreur
2. Ouvrir l'**interface utilisateur** et se connecter
3. Créer une nouvelle livraison (sélectionner départ et arrivée sur la carte)
4. Observer la notification reçue dans le simulateur
5. **Accepter** la livraison dans le simulateur
6. **Déplacer** le marqueur camion sur la carte du simulateur
7. Observer le déplacement en temps réel sur l'interface utilisateur
8. Modifier le statut et observer la mise à jour automatique côté client

---

## 🔭 Perspectives d'amélioration

- Intégration de la géolocalisation réelle du navigateur (GPS) pour remplacer la simulation
- Calcul et affichage de l'itinéraire optimal sur la carte
- Tableau de bord administrateur et historique des livraisons
- Déploiement en production (Docker, cloud)
- Tests unitaires et d'intégration

---

## 👩‍💻 Auteurs

- **Hiba L'Hichou**
- **Aicha Bitar**
- **Ghita Eddial**

**Encadrant :** M. Zakarie Abbad

**Établissement :** ENSIAS — Université Mohammed V de Rabat

**Année universitaire :** 2025 – 2026

---

## 📄 Licence

MIT — voir `package.json` pour plus de détails.