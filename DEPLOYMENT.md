# 🚀 Guide de Déploiement & Intégration Avancée

## 1️⃣ Intégration WhatsApp avec Twilio

### Étape 1: Créer un compte Twilio

1. Allez sur [twilio.com](https://www.twilio.com)
2. Cliquez sur "Sign Up" (gratuit)
3. Remplissez le formulaire
4. Vérifiez votre email
5. Connectez-vous

### Étape 2: Configurer WhatsApp

1. Allez dans **Messaging → WhatsApp → Sandbox**
2. Vous verrez un numéro WhatsApp Twilio
3. Envoyez un message test au numéro Twilio
4. Copiez votre **Account SID** et **Auth Token**
5. Copier le **WhatsApp Number** fourni

### Étape 3: Configurer l'App

Dans le fichier `.env`, mettez:

```env
ENABLE_WHATSAPP=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### Étape 4: Tester

```bash
# Redémarrer l'app
npm start

# Tester l'envoi d'un message
curl -X POST http://localhost:3000/api/test-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+237XXXXXXXXX", "message": "Test"}'
```

### Avantages de Twilio

✅ Messages automatiques
✅ Templating de messages
✅ Webhook pour réponses
✅ Historique des messages
✅ Gratuit pour démarrer (petit volume)

### Coûts Twilio

- Envoi SMS/WhatsApp: ~0.01 USD par message
- Compte gratuit: 50 crédits de test

---

## 2️⃣ Déploiement Heroku (Recommandé pour débutants)

### Étape 1: Installer Heroku CLI

**Windows:**
- Télécharger: https://devcenter.heroku.com/articles/heroku-cli
- Installer et redémarrer l'ordinateur

**Mac/Linux:**
```bash
brew tap heroku/brew && brew install heroku
```

### Étape 2: Authentification

```bash
heroku login
# Cela ouvrira un navigateur, connectez-vous
```

### Étape 3: Préparer le projet

```bash
# Initialiser un repo Git
git init
git add .
git commit -m "Initial commit"
```

### Étape 4: Créer l'app sur Heroku

```bash
heroku create pressing-pharmacy-app
# Remplacez par un nom unique
```

### Étape 5: Ajouter les variables d'environnement

```bash
# Via la ligne de commande
heroku config:set PORT=3000
heroku config:set ENABLE_WHATSAPP=true
heroku config:set TWILIO_ACCOUNT_SID=ACxxx...
heroku config:set TWILIO_AUTH_TOKEN=your_token
heroku config:set TWILIO_WHATSAPP_NUMBER=+14155238886

# Ou via le dashboard Heroku (plus facile):
# 1. Allez sur dashboard.heroku.com
# 2. Sélectionnez votre app
# 3. Settings → Config Vars
# 4. Ajoutez les variables
```

### Étape 6: Déployer

```bash
# Pousser vers Heroku
git push heroku main

# Ou si vous utilisez master au lieu de main
git push heroku master

# Voir les logs
heroku logs --tail

# Ouvrir l'app
heroku open
```

### Étape 7: Domaine personnalisé (Optionnel)

```bash
heroku domains:add press.example.com
# Suivre les instructions pour configurer le DNS
```

### Avantages Heroku

✅ Hosting gratuit (avec limitations)
✅ Déploiement facile depuis Git
✅ Support SSL automatique
✅ Logs en temps réel
✅ Variables d'environnement intégrées

### Limitations Heroku Gratuit

⚠️ L'app se met en veille après 30min d'inactivité
⚠️ Limite de 5 apps gratuites
⚠️ Pas de données persistantes (SQLite)

**Solution:** Utiliser PostgreSQL (add-on gratuit petit volume)

---

## 3️⃣ Déploiement Render.com (Plus performant)

### Étape 1: Créer un compte

1. Allez sur [render.com](https://render.com)
2. Cliquez "Sign Up"
3. Authentifiez-vous avec GitHub

### Étape 2: Pousser sur GitHub

```bash
git remote add origin https://github.com/votreusername/pressing-app.git
git branch -M main
git push -u origin main
```

### Étape 3: Créer le Web Service sur Render

1. Dashboard → New+ → Web Service
2. Connecter votre repo GitHub
3. Configurer:
   - **Name:** pressing-pharmacy
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Étape 4: Ajouter les variables d'environnement

1. Settings → Environment
2. Ajouter vos variables (comme Heroku)

### Avantages Render

✅ Infrastructure moderne
✅ Pas de mise en veille
✅ Meilleure performance
✅ Support SQLite natif
✅ Déploiement automatique depuis GitHub

---

## 4️⃣ Déploiement AWS (Pour volume élevé)

### Étape 1: Créer un compte AWS

1. Allez sur [aws.amazon.com](https://aws.amazon.com)
2. Créez un compte gratuit
3. Complétez la vérification

### Étape 2: Utiliser Amplify

```bash
# Installer Amplify CLI
npm install -g @aws-amplify/cli

# Initialiser
amplify init

# Déployer
amplify publish
```

### Alternative: EC2 + Ubuntu

```bash
# Créer une instance EC2 (Ubuntu 22.04)
# Se connecter en SSH

# Installer Node
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Cloner le projet
git clone https://github.com/votreusername/pressing-app.git
cd pressing-app

# Installer et démarrer
npm install
npm start

# Configurer Nginx comme reverse proxy
sudo apt-get install -y nginx
# Configurer les fichiers de config Nginx...
```

---

## 5️⃣ Configuration SSL/HTTPS (Important!)

### Avec Certbot (Let's Encrypt - Gratuit)

```bash
# Installer Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Générer certificat
sudo certbot certonly --standalone -d votredomaine.com

# Renouvellement automatique
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Configuration Nginx

```nginx
# /etc/nginx/sites-available/default

server {
    listen 80;
    server_name votredomaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name votredomaine.com;

    ssl_certificate /etc/letsencrypt/live/votredomaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votredomaine.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 6️⃣ Sauvegarde de la Base de Données

### Sauvegarde manuelle

```bash
# Copier la base de données
cp app.db app.db.backup.$(date +%Y%m%d_%H%M%S)

# Restaurer une sauvegarde
cp app.db.backup.20240115_143022 app.db
```

### Sauvegarde automatique (Cron)

```bash
# Éditer les tâches cron
crontab -e

# Ajouter cette ligne (sauvegarde quotidienne à 2h du matin)
0 2 * * * cp /home/user/pressing-app/app.db /home/user/pressing-app/backups/app.db.$(date +\%Y\%m\%d)

# Ajouter cette ligne (nettoyage des anciennes sauvegardes après 30 jours)
0 3 * * * find /home/user/pressing-app/backups -name "app.db.*" -mtime +30 -delete
```

### Télécharger les sauvegardes

```bash
# Depuis votre machine locale
scp user@votreserveur:/path/to/app.db.backup ./app.db.backup

# Ou créer un cloud backup
rclone sync /home/user/pressing-app/backups google-drive:pressing-backups
```

---

## 7️⃣ Monitoring & Logging

### Logs en temps réel

```bash
# Avec Heroku
heroku logs --tail

# Avec Render
# Dashboard → Logs

# Avec PM2 (si sur VPS)
pm2 logs pressing-app
```

### Monitoring Performance

```bash
# Installer PM2 (Node Process Manager)
npm install -g pm2

# Démarrer avec PM2
pm2 start server.js --name "pressing-app"

# Voir le statut
pm2 status

# Monitoring dashboard
pm2 monit
```

### Alertes

```bash
# Installer New Relic (monitoring gratuit)
npm install newrelic

# Dans server.js (première ligne)
require('newrelic');
```

---

## 8️⃣ Optimisations pour Production

### Compression des données

```bash
npm install compression
```

### Ajouter à server.js
```javascript
const compression = require('compression');
app.use(compression());
```

### Rate Limiting

```bash
npm install express-rate-limit
```

### Ajout au serveur
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### Helmet.js (Sécurité)

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## 9️⃣ Résolution de Problèmes de Déploiement

### ❌ "Cannot find module 'sqlite3'"

```bash
npm rebuild sqlite3
```

### ❌ "Port already in use"

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou utiliser un port différent
PORT=3001 npm start
```

### ❌ "CORS errors"

Dans server.js, vérifier:
```javascript
app.use(cors({
  origin: '*', // À restreindre en production
  credentials: true
}));
```

### ❌ "WhatsApp ne fonctionne pas"

1. Vérifier les credentials Twilio
2. Vérifier que le compte est actif
3. Regarder les logs Twilio
4. Tester avec un numéro de sandbox d'abord

### ❌ "Application crash"

```bash
# Voir les logs détaillés
heroku logs --tail --app mon-app

# Ou avec PM2
pm2 logs

# Vérifier la syntaxe Node
node -c server.js
```

---

## 🔟 Checklist Final de Production

- [ ] SSL/HTTPS configuré
- [ ] Variables d'environnement sécurisées
- [ ] Base de données sauvegardée
- [ ] WhatsApp testé en production
- [ ] Monitoring configuré
- [ ] Rate limiting activé
- [ ] Logs centralisés
- [ ] Backup automatique en place
- [ ] Domain configuré
- [ ] Email de notification configuré

---

## 📞 Support Déploiement

**Heroku Support:** heroku.com/help
**Render Support:** render.com/docs
**Twilio Support:** twilio.com/help
**AWS Support:** aws.amazon.com/support

---

**Votre application est maintenant prête pour la production! 🎉**
