# Structure du Projet

```
pressing-app/
│
├── server.js                 # Serveur principal Express
├── database.js              # Initialisation SQLite
├── whatsapp-service.js      # Service WhatsApp (optionnel)
├── package.json             # Dépendances npm
│
├── public/
│   └── index.html          # Application web frontend
│
├── app.db                   # Base de données (créée automatiquement)
│
├── .env                     # Variables d'environnement (À CONFIGURER)
├── .env.example             # Exemple de configuration
│
├── README.md                # Guide principal
├── DEPLOYMENT.md            # Guide de déploiement
├── Dockerfile               # Configuration Docker (optionnel)
├── docker-compose.yml       # Orchestration Docker (optionnel)
├── start.sh                 # Script de démarrage
│
└── backups/                 # Dossier pour sauvegardes
    └── (créé automatiquement)
```

---

# Docker Setup (Optionnel)

Pour déployer facilement sans installer Node.js:

## Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers
COPY package*.json ./
RUN npm install

COPY . .

# Créer le dossier public si nécessaire
RUN mkdir -p public

EXPOSE 3000

CMD ["npm", "start"]
```

## docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: pressing-pharmacy
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - ENABLE_WHATSAPP=${ENABLE_WHATSAPP}
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - TWILIO_WHATSAPP_NUMBER=${TWILIO_WHATSAPP_NUMBER}
    volumes:
      - ./app.db:/app/app.db
      - ./backups:/app/backups
    restart: unless-stopped
```

## Utilisation Docker

```bash
# Construire l'image
docker-compose build

# Démarrer l'application
docker-compose up

# En arrière-plan
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Sauvegarder la base de données
docker cp pressing-pharmacy:/app/app.db ./app.db
```

---

# Variables d'Environnement

```env
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DATABASE_PATH=./app.db

# WhatsApp (Twilio)
ENABLE_WHATSAPP=false
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

# Métier
BUSINESS_NAME=Pressing & Pharmacy
BUSINESS_PHONE=+237XXXXXXXXX
BUSINESS_EMAIL=contact@example.com
CURRENCY=FCFA

# Debug
DEBUG_MODE=true
```

---

# Routes API

## Clients
- `GET /api/clients` - Lister tous les clients
- `POST /api/clients` - Créer un client
- `GET /api/clients/:id` - Détails d'un client

## Pressing
- `GET /api/pressing` - Lister services
- `POST /api/pressing` - Créer service
- `PUT /api/pressing/:id/statut` - Mettre à jour statut

## Médicaments
- `GET /api/medicaments` - Lister médicaments
- `POST /api/medicaments` - Ajouter médicament
- `PUT /api/medicaments/:id/stock` - Mettre à jour stock
- `GET /api/ventes-medicaments` - Lister ventes
- `POST /api/ventes-medicaments` - Créer vente

## Services Infirmiers
- `GET /api/services-infirmiers` - Lister services
- `POST /api/services-infirmiers` - Programmer service

## Statistiques
- `GET /api/dashboard` - Statistiques et KPIs

---

# Export Excel/CSV

Pour exporter les données (à implémenter):

```javascript
// Ajouter à server.js
const Excel = require('exceljs');

app.get('/api/export/pressing', async (req, res) => {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Pressing');
  
  // Ajouter colonnes
  worksheet.columns = [
    { header: 'Client', key: 'client', width: 20 },
    { header: 'Service', key: 'service', width: 15 },
    { header: 'Montant', key: 'montant', width: 12 },
    { header: 'Statut', key: 'statut', width: 12 },
    { header: 'Date', key: 'date', width: 15 }
  ];
  
  // Récupérer et ajouter les données
  const services = await getPressingServices();
  services.forEach(s => {
    worksheet.addRow(s);
  });
  
  // Envoyer le fichier
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="pressing.xlsx"');
  
  await workbook.xlsx.write(res);
  res.end();
});
```

---

# Améliorations Futures

## Court Terme
- [ ] Export Excel
- [ ] Aperçu des reçus avant impression
- [ ] Recherche avancée
- [ ] Filtres par date
- [ ] Multi-utilisateurs

## Moyen Terme
- [ ] Application mobile native (React Native)
- [ ] Paiement mobile (Orange Money, MTN)
- [ ] SMS automatiques
- [ ] Email marketing
- [ ] Reporting avancé

## Long Terme
- [ ] IA pour prédiction de stock
- [ ] Intégration CRM
- [ ] Synchronisation multi-succursales
- [ ] API partenaire
- [ ] Marketplace intégrée

---

# Performance Optimization

```javascript
// Ajouter caching
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

// Index les colonnes fréquemment recherchées
db.run(`CREATE INDEX IF NOT EXISTS idx_client_id ON pressing_services(client_id)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_date ON pressing_services(date_creation)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_statut ON pressing_services(statut)`);

// Pagination
app.get('/api/pressing?page=1&limit=50', (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 50;
  const offset = (page - 1) * limit;
  
  db.all(
    `SELECT * FROM pressing_services LIMIT ? OFFSET ?`,
    [limit, offset],
    (err, rows) => { ... }
  );
});
```

---

# Sécurité

## À Faire

```javascript
// 1. Valider les entrées
const { body, validationResult } = require('express-validator');

app.post('/api/clients',
  body('nom').trim().notEmpty(),
  body('telephone').trim().isMobilePhone('fr-FR'),
  body('email').isEmail(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Continuer...
  }
);

// 2. Hash les données sensibles
const bcrypt = require('bcrypt');
const hashed = await bcrypt.hash(password, 10);

// 3. Authentification JWT (si multi-utilisateurs)
const jwt = require('jsonwebtoken');

// 4. HTTPS obligatoire en production
// Configurer via Nginx/Apache

// 5. CSRF protection
const csrf = require('csurf');
app.use(csrf());

// 6. Rate limiting
const rateLimit = require('express-rate-limit');
```

---

# Troubleshooting Courants

### "Erreur connexion WhatsApp"
- Vérifier les credentials Twilio
- S'assurer que le compte Twilio est actif
- Vérifier la connexion internet
- Consulter les logs Twilio

### "Port 3000 déjà utilisé"
```bash
lsof -i :3000
kill -9 <PID>
PORT=3001 npm start
```

### "Erreur base de données"
```bash
# Vérifier l'intégrité
npm install sqlite-cli
sqlite3 app.db "PRAGMA integrity_check;"

# Récupérer la sauvegarde
cp app.db.backup app.db
```

### "Application lente"
- Ajouter des index
- Implémenter la pagination
- Utiliser le caching
- Analyser les requêtes lentes

---

# Commandes Utiles

```bash
# Installer les dépendances
npm install

# Démarrer le serveur
npm start

# Développement avec rechargement auto
npm run dev

# Analyser les dépendances
npm list

# Mettre à jour les dépendances
npm update

# Auditer la sécurité
npm audit

# Démarrer avec PM2
pm2 start server.js --name "pressing"
pm2 status
pm2 logs

# Tester l'API
curl http://localhost:3000/api/clients

# Voir les processus écoutant le port 3000
lsof -i :3000

# Effacer le cache npm
npm cache clean --force
```

---

**Application Complète et Prête à Déployer! 🎉**
