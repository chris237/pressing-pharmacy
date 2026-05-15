╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║             🚀 GUIDE DE DÉPLOIEMENT COMPLET & MULTI-PLATEFORME          ║
║                                                                           ║
║         Pressing & Pharmacy - Application Production-Ready               ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

📋 TABLE DES MATIÈRES

1. Déploiement Local (Docker)
2. Déploiement Heroku (Gratuit/Payant)
3. Déploiement Render.com (Recommandé)
4. Déploiement AWS (Complet)
5. Déploiement DigitalOcean (Abordable)
6. Déploiement VPS (Contrôle total)
7. Configuration Production
8. Monitoring & Maintenance
9. Troubleshooting

═════════════════════════════════════════════════════════════════════════════

## 1️⃣ DÉPLOIEMENT LOCAL AVEC DOCKER

### Prérequis
- Docker installé (docker.com)
- Docker Compose installé
- Git installé

### Étapes

1. Cloner le projet:
```bash
git clone <repo-url>
cd pressing-pharmacy-app
```

2. Créer le fichier .env:
```bash
cp .env.example .env
# Remplir les variables
```

3. Démarrer les services:
```bash
docker-compose up
```

4. Initialiser la DB:
```bash
docker-compose exec app npm run init-db
```

5. Accéder à l'app:
```
http://localhost:3000
```

### Commandes utiles:
```bash
docker-compose logs -f app           # Voir les logs
docker-compose down                  # Arrêter
docker-compose restart               # Redémarrer
docker-compose ps                    # Status des services
docker-compose exec app bash         # Accéder au container
```

═════════════════════════════════════════════════════════════════════════════

## 2️⃣ DÉPLOIEMENT HEROKU (Gratuit/Payant)

### Prérequis
- Compte Heroku (heroku.com)
- Heroku CLI installé
- Git installé
- Dépôt GitHub (recommandé)

### Étapes

1. Installer Heroku CLI:
```bash
# Windows: Download installer
# Mac: brew tap heroku/brew && brew install heroku
# Linux: curl https://cli-assets.heroku.com/install.sh | sh
```

2. Authentification:
```bash
heroku login
```

3. Créer l'app:
```bash
heroku create pressing-pharmacy-app
# Ou pour un app existant:
heroku git:remote -a pressing-pharmacy-app
```

4. Ajouter buildpack:
```bash
heroku buildpacks:set heroku/nodejs
```

5. Définir variables d'environnement:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
heroku config:set TWILIO_ACCOUNT_SID=your_sid
heroku config:set TWILIO_AUTH_TOKEN=your_token
heroku config:set TWILIO_WHATSAPP_NUMBER=+14155238886
heroku config:set EMAIL_USER=your@email.com
heroku config:set EMAIL_PASSWORD=your_password

# Ou batch upload depuis .env:
# heroku config:push -f .env
```

6. Créer Procfile:
```
web: node server.js
release: npm run migrate
```

7. Déployer:
```bash
git push heroku main
# Ou depuis GitHub:
# Enable automatic deployments depuis Heroku dashboard
```

8. Voir les logs:
```bash
heroku logs --tail
```

9. Accéder:
```
https://pressing-pharmacy-app.herokuapp.com
```

### Options avancées:
```bash
# Ajouter une base de données PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Ajouter Redis
heroku addons:create heroku-redis:premium-0

# Voir les addons
heroku addons

# Maintenance
heroku maintenance:on
heroku maintenance:off
```

### Limitations Heroku Gratuit:
- ⚠️ L'app se met en veille après 30 min d'inactivité
- ⚠️ Max 5 apps gratuits
- ⚠️ Pas de PostgreSQL gratuit (utilisez SQLite)

═════════════════════════════════════════════════════════════════════════════

## 3️⃣ DÉPLOIEMENT RENDER.COM (Recommandé ⭐)

### Avantages
✅ Gratuit (sans limitation de temps)
✅ Pas de mise en veille
✅ Déploiement automatique depuis GitHub
✅ Très simple
✅ Bon support

### Étapes

1. Créer compte Render:
- Aller sur render.com
- Sign up avec GitHub
- Autoriser Render

2. Pousser sur GitHub:
```bash
git remote add origin https://github.com/your-repo
git branch -M main
git push -u origin main
```

3. Créer Web Service:
- Aller sur Render dashboard
- Cliquer "New +"
- Sélectionner "Web Service"
- Connecter votre repo GitHub
- Sélectionner le repo

4. Configurer:
- Name: pressing-pharmacy
- Region: Frankfurt (closer to Africa)
- Runtime: Node
- Build Command: npm install
- Start Command: npm start

5. Ajouter variables d'environnement:
- Settings → Environment
- Ajouter toutes les variables du .env

6. Déployer:
- Cliquer "Create Web Service"
- Attendre quelques minutes

7. Voir le lien:
```
https://pressing-pharmacy.onrender.com
```

### Déploiements futurs:
- Automatique à chaque push sur main
- Ou manual depuis dashboard

═════════════════════════════════════════════════════════════════════════════

## 4️⃣ DÉPLOIEMENT AWS (Complet & Scalable)

### Options

A. ELASTIC BEANSTALK (Simple)
B. ECS + FARGATE (Docker)
C. EC2 + Nginx (Contrôle total)

### A. ELASTIC BEANSTALK

1. Installer AWS CLI:
```bash
aws configure
# Entrer Access Key ID
# Entrer Secret Access Key
```

2. Initialiser EB:
```bash
eb init -p "Node.js 18 running on 64bit Amazon Linux 2" pressing-pharmacy
eb create pressing-env
```

3. Déployer:
```bash
eb deploy
```

4. Voir les logs:
```bash
eb logs
```

5. Accéder:
```
https://pressing-env.elasticbeanstalk.com
```

### B. ECS + FARGATE

1. Créer ECR repository:
```bash
aws ecr create-repository --repository-name pressing-pharmacy
```

2. Pusher l'image Docker:
```bash
docker build -t pressing-pharmacy .
docker tag pressing-pharmacy:latest \
  <account-id>.dkr.ecr.<region>.amazonaws.com/pressing-pharmacy:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/pressing-pharmacy:latest
```

3. Créer ECS Cluster & Service (via AWS Console)

4. Accéder à l'app

### C. EC2 + NGINX

1. Créer instance EC2:
- AMI: Ubuntu 22.04
- Type: t3.micro ou t3.small
- Security Group: Ouvrir ports 80, 443, 22

2. Se connecter:
```bash
ssh -i key.pem ubuntu@instance-ip
```

3. Installer Node:
```bash
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. Cloner et démarrer:
```bash
git clone <repo>
cd pressing-pharmacy-app
npm install
npm start
```

5. Configurer Nginx:
```bash
sudo apt-get install -y nginx

# Créer /etc/nginx/sites-available/default
upstream app {
  server localhost:3000;
}

server {
  listen 80;
  server_name your-domain.com;
  
  location / {
    proxy_pass http://app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}

# Redémarrer Nginx
sudo systemctl restart nginx
```

6. Configurer SSL (Let's Encrypt):
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

═════════════════════════════════════════════════════════════════════════════

## 5️⃣ DÉPLOIEMENT DIGITALOCEAN (Abordable)

### Étapes

1. Créer Droplet:
- Aller sur DigitalOcean
- Créer Droplet (Ubuntu 22.04, $6/month)

2. Se connecter (SSH):
```bash
ssh root@droplet-ip
```

3. Installer dépendances:
```bash
apt-get update && apt-get upgrade
apt-get install -y nodejs npm nginx git curl

# Ou utiliser Docker:
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

4. Cloner et configurer:
```bash
cd /var/www
git clone <repo> pressing-app
cd pressing-app
npm install
```

5. Utiliser PM2 pour gérer le processus:
```bash
npm install -g pm2
pm2 start server.js --name "pressing"
pm2 startup
pm2 save
```

6. Configurer Nginx (voir étapes AWS EC2)

7. Obtenir le domaine:
- Acheter domaine (namecheap, godaddy, etc.)
- Pointer vers IP du Droplet
- Configurer DNS DigitalOcean

═════════════════════════════════════════════════════════════════════════════

## 6️⃣ DÉPLOIEMENT VPS (Hébérgement Cameroun)

### Fournisseurs (Cameroun):
- Xecure (xecure.cm)
- Hostinger (hostinger.cm)
- Ovh.cm

### Étapes générales:
1. Louer VPS Linux
2. Installer Node, Nginx, SSL
3. Cloner l'app
4. Configurer PM2 + Nginx
5. Configurer domaine

═════════════════════════════════════════════════════════════════════════════

## 7️⃣ CONFIGURATION PRODUCTION

### Fichier .env pour production:
```env
# Application
NODE_ENV=production
PORT=3000

# JWT
JWT_SECRET=your-very-secure-random-key-here-min-32-chars
JWT_EXPIRY=7d

# Database
DATABASE_PATH=/data/app.db

# WhatsApp
TWILIO_ACCOUNT_SID=AC_YOUR_SID
TWILIO_AUTH_TOKEN=YOUR_TOKEN
TWILIO_WHATSAPP_NUMBER=+14155238886

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your_app_password

# Push Notifications
VAPID_PUBLIC_KEY=your_public_key
VAPID_PRIVATE_KEY=your_private_key
VAPID_SUBJECT=mailto:admin@example.com

# Redis (optionnel)
REDIS_URL=redis://redis:6379

# Sentry (optionnel)
SENTRY_DSN=https://...

# Domaine
DOMAIN=your-domain.com
CORS_ORIGIN=https://your-domain.com

# SSL
SSL_CERT=/etc/ssl/certs/your-domain.crt
SSL_KEY=/etc/ssl/private/your-domain.key
```

### Security checklist:
- [ ] Changer JWT_SECRET
- [ ] Configurer HTTPS/SSL
- [ ] Définir CORS correctement
- [ ] Ajouter rate limiting
- [ ] Configurer helmet.js
- [ ] Ajouter 2FA
- [ ] Configurer backups automatiques
- [ ] Ajouter monitoring
- [ ] Configurer logs
- [ ] Tester reset password

═════════════════════════════════════════════════════════════════════════════

## 8️⃣ MONITORING & MAINTENANCE

### Monitoring gratuit:
```bash
# Sentry (error tracking)
npm install @sentry/node

# New Relic (performance)
npm install newrelic

# Datadog (all-in-one)
# Coût: $15/month
```

### Logs:
```bash
# Avec Docker:
docker-compose logs -f app > logs/app.log

# Avec PM2:
pm2 logs > logs/pm2.log

# Avec Syslog:
tail -f /var/log/syslog | grep app
```

### Backups:
```bash
# Backup quotidien
0 2 * * * cd /app && tar czf backups/db-$(date +\%Y\%m\%d).tar.gz data/app.db

# Upload vers S3
aws s3 cp backups/db-*.tar.gz s3://my-bucket/backups/
```

═════════════════════════════════════════════════════════════════════════════

## 9️⃣ TROUBLESHOOTING

### ❌ "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Port already in use"
```bash
lsof -i :3000
kill -9 <PID>

# Ou utiliser port différent:
PORT=3001 npm start
```

### ❌ "Database locked"
```bash
# Redémarrer app
pm2 restart app

# Ou avec Docker:
docker-compose restart app
```

### ❌ "Out of memory"
```bash
# Augmenter les limites
node --max-old-space-size=4096 server.js
```

### ❌ "WhatsApp ne fonctionne pas"
```bash
# Vérifier credentials Twilio
curl -X GET https://api.twilio.com/2010-04-01/Accounts/YOUR_SID \
  -u YOUR_SID:YOUR_TOKEN

# Vérifier le numéro WhatsApp
# Utiliser compte sandbox Twilio d'abord
```

═════════════════════════════════════════════════════════════════════════════

## 🎯 RÉSUMÉ DÉPLOIEMENT PAR CAS D'USAGE

### Cas 1: Développement local
→ Docker Compose

### Cas 2: Test gratuit rapide
→ Render.com (recommandé)

### Cas 3: Production petite équipe
→ DigitalOcean ($6-12/month)

### Cas 4: Production moyenne
→ AWS Elastic Beanstalk + RDS

### Cas 5: Production grande échelle
→ AWS ECS/Kubernetes + ALB + RDS + S3

### Cas 6: Cameroun (local)
→ Xecure/Ovh VPS + Nginx + PM2

═════════════════════════════════════════════════════════════════════════════

## ✅ CHECKLIST FINAL DÉPLOIEMENT

- [ ] Code testé localement
- [ ] Variables d'environnement configurées
- [ ] Database initialisée
- [ ] HTTPS/SSL configuré
- [ ] Backups en place
- [ ] Monitoring activé
- [ ] Email configuré
- [ ] WhatsApp testé
- [ ] Domaine configuré
- [ ] Health checks en place
- [ ] Logs activés
- [ ] Alertes configurées
- [ ] Documentation mise à jour
- [ ] Équipe informée

═════════════════════════════════════════════════════════════════════════════

**VOTRE APP EST PRÊTE POUR LA PRODUCTION!** 🚀

Besoin d'aide? Voir README.md ou DEPLOYMENT.md

