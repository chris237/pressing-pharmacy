# 🔐 SYSTÈME D'AUTHENTIFICATION, RÔLES ET RAPPORTS

## Vue d'Ensemble

J'ai ajouté un **système complet d'authentification et d'autorisation** avec 3 rôles différents, ainsi qu'un **moteur de rapports avancé** avec multiples types de rapports.

---

## 👥 LES 3 RÔLES D'UTILISATEURS

### 1️⃣ **ADMIN** (Administrateur)
```
Accès complet à tout
├── Gestion utilisateurs
├── Tous les rapports
├── Tous les modules
├── Logs d'audit
└── Configuration système
```

**Permissions:**
- Créer/modifier/supprimer utilisateurs
- Générer tous les types de rapports
- Voir les logs d'audit
- Accès à toutes les données

**Interface:** Dashboard complet avec stats globales

---

### 2️⃣ **VENDEUR** (Vendeur/Caissier)
```
Accès aux ventes et rapports personnels
├── Enregistrer ventes
├── Voir ses ventes
├── Consulter rapports
└── Gestion stock (lecture)
```

**Permissions:**
- Créer ventes/transactions
- Voir ses propres rapports
- Consulter le stock
- Pas d'accès admin

**Interface:** Dashboard vendeur avec ses ventes

---

### 3️⃣ **CLIENT** (Client)
```
Accès à ses services personnels
├── Voir ses commandes
├── Historique personnel
└── Services associés
```

**Permissions:**
- Lire ses propres données
- Voir ses services
- Pas d'accès aux autres clients

**Interface:** Dashboard client personnel

---

## 🔑 SYSTÈME DE PERMISSIONS

Chaque rôle a des permissions granulaires:

```
CLIENTS
├── clients_read
├── clients_create
├── clients_update
└── clients_delete

PRESSING
├── pressing_read
├── pressing_create
└── pressing_update

MÉDICAMENTS
├── medicaments_read
├── medicaments_create
├── medicaments_update
└── ventes_create

SERVICES INFIRMIERS
├── services_read
└── services_create

RAPPORTS
├── rapports_read
└── rapports_export

ADMIN
├── admin_users
├── admin_roles
└── admin_audit
```

---

## 📊 LES 7 TYPES DE RAPPORTS AVANCÉS

### 1. **RAPPORT JOURNALIER** 📅
Statistiques complètes d'une journée

```json
{
  "date": "2024-01-15",
  "services": {
    "pressing": { "nombre": 5, "montant": 15000 },
    "medicaments": { "nombre": 12, "montant": 8500 },
    "services_infirmiers": { "nombre": 2, "montant": 10000 }
  },
  "total_montant": 33500
}
```

**Accessible par:** Admin
**Format:** JSON, CSV

---

### 2. **RAPPORT MENSUEL** 📆
Détails par jour du mois

```json
{
  "periode": "2024-01",
  "jours": {
    "2024-01-01": {
      "pressing": { "nombre": 3, "montant": 9000 },
      "medicaments": { "nombre": 5, "montant": 4000 }
    },
    ...
  },
  "total_montant": 250000,
  "total_transactions": 156
}
```

**Accessible par:** Admin
**Filtres:** Année, Mois

---

### 3. **RAPPORT PAR PRODUIT/SERVICE** 📦
Détails pour chaque type de service/produit

```json
{
  "type": "pressing",
  "periode": "2024-01-01 à 2024-01-31",
  "produits": [
    {
      "type_service": "Lavage Simple",
      "nombre_services": 45,
      "montant_total": 135000,
      "montant_moyen": 3000,
      "montant_min": 2500,
      "montant_max": 4000
    },
    {
      "type_service": "Repassage",
      "nombre_services": 20,
      "montant_total": 80000,
      "montant_moyen": 4000
    }
  ],
  "total_montant": 215000
}
```

**Accessible par:** Admin
**Types:** pressing, medicaments, services_infirmiers
**Filtres:** Date de début, Date de fin

---

### 4. **RAPPORT PAR CLIENT** 👤
Historique complet d'un client

```json
{
  "client": {
    "id": "client-123",
    "nom": "Jean Dupont",
    "telephone": "+237123456789"
  },
  "services": {
    "pressing": { "nombre": 12, "montant": 36000 },
    "medicaments": { "nombre": 5, "montant": 5000 },
    "services_infirmiers": { "nombre": 2, "montant": 10000 }
  },
  "total_montant": 51000
}
```

**Accessible par:** Admin, Vendeur
**Filtre:** Client ID

---

### 5. **RAPPORT PAR VENDEUR** 💼
Performance d'un vendeur

```json
{
  "vendeur": {
    "nom": "Marie Tante",
    "email": "marie@example.com"
  },
  "periode": "2024-01-01 à 2024-01-31",
  "ventes": {
    "nombre": 156,
    "montant": 125000
  }
}
```

**Accessible par:** Admin uniquement
**Filtre:** Vendeur ID, Date début/fin

---

### 6. **RAPPORT STOCK** 📊
État du stock de médicaments

```json
{
  "total_medicaments": 45,
  "ruptures": [
    {
      "nom": "Paracétamol 500mg",
      "quantite_stock": 0,
      "quantite_min": 10,
      "statut": "rupture"
    }
  ],
  "critiques": [...],
  "ok": [...],
  "valeur_stock_totale": 450000,
  "details": [...]
}
```

**Accessible par:** Admin, Vendeur
**Alertes:** Automatiques si rupture

---

### 7. **RAPPORT PERFORMANCE** 📈
Vue d'ensemble de la performance globale

```json
{
  "periode": "2024-01-01 à 2024-01-31",
  "services": {
    "pressing": { "nombre": 85, "montant": 255000 },
    "medicaments": { "nombre": 156, "montant": 125000 },
    "services_infirmiers": { "nombre": 28, "montant": 140000 }
  },
  "total_montant": 520000,
  "nouveau_clients": 12
}
```

**Accessible par:** Admin

---

## 🔗 ROUTES API D'AUTHENTIFICATION

### Authentification

```
POST /api/auth/login
  Body: { email, password }
  Return: { token, user }

POST /api/auth/register
  Body: { nom, email, password, type, services }
  Return: { token, user }

GET /api/auth/me
  Header: Authorization: Bearer {token}
  Return: { user, valid }

POST /api/auth/refresh
  Header: Authorization: Bearer {token}
  Return: { token }
```

### Gestion Utilisateurs (Admin)

```
GET /api/admin/users
  Return: [users]

POST /api/admin/users
  Body: { nom, email, password, role_id, services_autorise }
  Return: { user }

PUT /api/admin/users/:id
  Body: { nom, email, role_id, statut, services_autorise }
  Return: { success }

DELETE /api/admin/users/:id
  Return: { success }
```

### Rapports

```
GET /api/rapports/journalier?date=2024-01-15
GET /api/rapports/mensuel?year=2024&month=01
GET /api/rapports/produits?type=pressing&startDate=...&endDate=...
GET /api/rapports/client/:clientId
GET /api/rapports/vendeur/:vendeurId?startDate=...&endDate=...
GET /api/rapports/stock
GET /api/rapports/performance?startDate=...&endDate=...
POST /api/rapports/custom
  Body: { type, startDate, endDate, service, clientId, statut }
GET /api/rapports/stats
POST /api/rapports/export/csv
  Body: { data, filename }
```

### Audit

```
GET /api/admin/audit-logs?limit=100
  Return: [logs]
```

---

## 🗄️ NOUVELLES TABLES DE BASE DE DONNÉES

```sql
-- Rôles
CREATE TABLE roles (
  id TEXT PRIMARY KEY,
  nom TEXT UNIQUE,
  description TEXT,
  niveau INTEGER
)

-- Utilisateurs
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  nom TEXT,
  email TEXT UNIQUE,
  password TEXT (hashed),
  role_id TEXT,
  phone TEXT,
  services_autorise TEXT,
  statut TEXT,
  dernier_login DATETIME
)

-- Permissions
CREATE TABLE permissions (
  id TEXT PRIMARY KEY,
  nom TEXT UNIQUE,
  description TEXT,
  module TEXT,
  action TEXT
)

-- Role-Permissions (Many-to-Many)
CREATE TABLE role_permissions (
  id TEXT PRIMARY KEY,
  role_id TEXT,
  permission_id TEXT
)

-- Audit Logs
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT,
  module TEXT,
  reference_id TEXT,
  ancienne_valeur TEXT,
  nouvelle_valeur TEXT,
  ip_address TEXT,
  date_action DATETIME
)
```

---

## 🔒 SÉCURITÉ

### Implémenté

✅ **JWT Tokens** - Authentification sécurisée
✅ **Bcrypt** - Mots de passe hashés
✅ **Rate Limiting** - Prévention bruteforce
✅ **Helmet.js** - Headers de sécurité
✅ **CORS** - Contrôle des origines
✅ **Audit Logs** - Traçabilité complète
✅ **Validation** - express-validator
✅ **Permissions** - Contrôle granulaire

### Configuration

```env
JWT_SECRET=your-secret-key-change-this-production
JWT_EXPIRY=7d
```

---

## 💻 EXEMPLE D'UTILISATION

### 1. Inscription Client

```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nom: 'Jean Dupont',
    email: 'jean@example.com',
    password: 'secure123',
    type: 'client',
    services: 'pressing,pharmacy'
  })
});

const { token, user } = await response.json();
localStorage.setItem('token', token);
```

### 2. Connexion

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'jean@example.com',
    password: 'secure123'
  })
});

const { token } = await response.json();
```

### 3. Appel API Authentifiée

```javascript
const response = await fetch('/api/rapports/journalier?date=2024-01-15', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const report = await response.json();
```

### 4. Créer un Rapport Personnalisé (Admin)

```javascript
const response = await fetch('/api/rapports/custom', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    type: 'pressing',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    service: 'Lavage Simple',
    statut: 'livre'
  })
});

const report = await response.json();
```

---

## 🎯 WORKFLOW TYPIQUE

### Admin

```
1. Connectez-vous (admin/password)
2. Allez à Dashboard
3. Consultez les 5 rapports disponibles
4. Cliquez sur "Gestion Utilisateurs"
5. Créez/Modifiez/Supprimez les utilisateurs
6. Regardez les Logs d'Audit
```

### Vendeur

```
1. Connectez-vous (vendeur/password)
2. Allez à "Mon Espace"
3. Enregistrez une vente
4. Consultez vos rapports
5. Vérifiez le stock
```

### Client

```
1. Inscrivez-vous (nouveau compte)
2. Allez à "Mon Compte"
3. Voyez vos services
4. Consultez l'historique
```

---

## 📈 FILTRES RAPPORTS AVANCÉS

Vous pouvez créer des rapports personnalisés avec:

```
✅ Type de service (pressing, médicaments, services)
✅ Date de début et fin
✅ Client spécifique
✅ Statut (collecte, lavage, prêt, livré, etc)
✅ Vendeur spécifique
✅ Produit spécifique
✅ Plage de prix
```

Exemple:
```
GET /api/rapports/custom?
  type=pressing&
  startDate=2024-01-01&
  endDate=2024-01-31&
  service=Lavage Simple&
  statut=livre
```

---

## 🔄 INTÉGRATION DANS SERVER.JS

À ajouter au serveur principal:

```javascript
// Charger les middlewares
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const auth = require('./auth');
const authRoutes = require('./auth-routes');

// Sécurité
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Initialiser auth
auth.initializeDefaultRoles();

// Routes
app.use('/api', authRoutes);

// Middleware sur les autres routes
app.get('/api/pressing', auth.authMiddleware, auth.requireService('pressing'), ...);
```

---

## ✅ FICHIERS AJOUTÉS

```
✓ auth.js              - Système d'authentification
✓ auth-routes.js       - Routes API d'auth et rapports
✓ reports.js           - Moteur de rapports avancé
✓ public/auth.html     - Interface avec login et rôles
✓ database.js          - Modifié pour nouvelles tables
✓ package.json         - Dépendances supplémentaires
```

---

## 🚀 DÉPLOIEMENT

```bash
# Installer les nouvelles dépendances
npm install

# Créer les utilisateurs par défaut (optionnel)
node -e "const auth = require('./auth'); auth.initializeDefaultRoles();"

# Démarrer
npm start

# Ouvrir
http://localhost:3000/public/auth.html
```

---

## 🎓 PROCHAINES ÉTAPES

1. ✅ Créer compte Admin (inscription ou via code)
2. ✅ Créer vendeurs/clients
3. ✅ Générer les rapports
4. ✅ Exporter en CSV
5. ✅ Configurer les alertes stock
6. ✅ Mettre en production

---

**Système complet et prêt à la production! 🎉**
