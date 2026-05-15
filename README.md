# 📱 Application de Gestion Pressing & Médicaments

Une application web complète pour gérer votre pressing, vente de médicaments et services infirmiers avec suivi des clients et intégration WhatsApp.

## 🚀 Caractéristiques

✅ **Gestion Pressing**
- Collecte, lavage et livraison de vêtements
- Suivi des coûts par article
- Statuts en temps réel
- Génération de reçus

✅ **Gestion Médicaments**
- Inventaire complet avec alertes de rupture
- Ventes avec reçus
- Suivi des prix et stock
- Historique des transactions

✅ **Services Infirmiers**
- Programmation de rendez-vous
- Suivi des clients
- Gestion des tarifs

✅ **Communications**
- Intégration WhatsApp (optionnel)
- Envoi de notifications aux clients
- Messages de confirmation

✅ **Rapports**
- Statistiques en temps réel
- Revenus par service
- Alertes stock
- Export de données

---

## 📋 Prérequis

- **Node.js** v14 ou supérieur (télécharger de nodejs.org)
- **NPM** (inclus avec Node.js)
- Un navigateur web moderne
- Connexion internet (pour WhatsApp optionnel)

---

## 🛠️ Installation Rapide

### Étape 1: Cloner ou télécharger les fichiers

```bash
cd /chemin/vers/votre/dossier
# Placer tous les fichiers de l'app ici
```

### Étape 2: Installer les dépendances

```bash
npm install
```

Cela va installer:
- Express (serveur web)
- SQLite (base de données)
- Twilio (optionnel, pour WhatsApp)
- Et autres dépendances

### Étape 3: Configuration

1. Copiez le fichier `.env` et remplissez-le:
```bash
cp .env.example .env
# Ouvrez .env et modifiez les valeurs
```

2. (Optionnel) Pour WhatsApp, créez un compte Twilio:
   - Allez sur twilio.com
   - Inscrivez-vous (gratuit au départ)
   - Récupérez vos identifiants
   - Collez-les dans le fichier `.env`

### Étape 4: Démarrer l'application

**Mode développement** (avec redémarrage auto):
```bash
npm run dev
```

**Mode production**:
```bash
npm start
```

L'application sera accessible à:
👉 **http://localhost:3000**

---

## 📱 Utilisation de l'Application

### 1️⃣ Tableau de Bord
- Vue d'ensemble de vos revenus
- Nombre de clients
- Alertes de rupture de stock
- Activités récentes

### 2️⃣ Gestion Clients
```
✅ Ajouter un client (nom, téléphone, type)
✅ Voir la liste complète
✅ Envoyer des messages WhatsApp
✅ Filtrer par type de service
```

### 3️⃣ Pressing
```
1. Cliquer sur "Pressing" → "Nouveau Service"
2. Sélectionner le client
3. Choisir le type (Lavage, Repassage, etc.)
4. Entrer le nombre de vêtements et le prix
5. Valider → Reçu généré automatiquement
6. Envoyer notification WhatsApp au client
7. Mettre à jour le statut (Collecte → Lavage → Prêt → Livré)
```

### 4️⃣ Médicaments
```
AJOUTER UN MÉDICAMENT:
1. Cliquer sur "Médicaments" → "Ajouter Médicament"
2. Remplir: Nom, Dosage, Catégorie, Stock, Prix Vente
3. Valider

VENDRE UN MÉDICAMENT:
1. Cliquer sur "Vendre Médicament"
2. Sélectionner Client + Médicament + Quantité
3. Valider → Stock réduit automatiquement
4. Reçu et message WhatsApp envoyé

RUPTURES DE STOCK:
- L'app vous alerte si stock < seuil minimum
- Visible dans le Dashboard et section "Rapports"
```

### 5️⃣ Services Infirmiers
```
1. Cliquer sur "Soins" → "Programmer Service"
2. Choisir client + type (Injection, Pansement, etc.)
3. Entrer date/heure et prix
4. Valider → Rendez-vous confirmé
5. Message envoyé au client
```

### 6️⃣ Rapports
```
📊 Voir les revenus par service
💾 Exporter en CSV/Excel
📈 Analyser les tendances
⚠️ Gérer les ruptures de stock
```

---

## 💬 Intégration WhatsApp

### Option 1: Automatique (Twilio)
Si vous avez configuré Twilio dans `.env`:

1. Les messages sont envoyés automatiquement au client
2. Format inclut: Description, Montant, Référence, Date

### Option 2: Manuel (Gratuit)
Sans Twilio:

1. L'app génère le message
2. Cliquez sur le bouton "💬 WhatsApp"
3. Copiez le message proposé
4. Ouvrez WhatsApp Web ou mobile
5. Collez et envoyez

### Format des Messages

**Pressing:**
```
👔 Votre service de pressing est prêt!
Montant: 5,000 FCFA
Référence: ABC123
Merci! 🙏
```

**Médicament:**
```
💊 Votre commande est prête!
Montant: 2,500 FCFA
Merci de votre achat! 🙏
```

**Service Infirmier:**
```
🩺 Votre rendez-vous est confirmé
Date: 2024-12-15 à 14:00
Lieu: [Votre adresse]
```

---

## 📊 Structure de la Base de Données

```
CLIENTS
├── id (unique)
├── nom
├── telephone
├── whatsapp
├── email
├── type (Pressing/Médicaments/Soins/Tous)
└── date_création

PRESSING_SERVICES
├── id
├── client_id
├── type_service
├── nombre_vetements
├── prix_total
├── statut (collecte → lavage → prêt → livré)
├── date_collecte
└── whatsapp_envoye

MEDICAMENTS
├── id
├── nom
├── dosage
├── categorie
├── quantite_stock
├── quantite_min (alerte)
├── prix_vente
└── date_expiration

VENTES_MEDICAMENTS
├── id
├── client_id
├── montant_total
├── date_vente
├── paiement_statut
└── whatsapp_envoye

SERVICES_INFIRMIERS
├── id
├── client_id
├── type_service
├── date_service
├── prix
└── statut
```

---

## 🔧 Commandes Utiles

```bash
# Démarrer l'app
npm start

# Démarrage avec rechargement auto (développement)
npm run dev

# Réinitialiser la base de données
rm app.db
npm start

# Accéder à la console Node.js
node
> const db = require('./database');
```

---

## 📱 Utilisation Mobile

L'application est **100% responsive**:

✅ Fonctionne sur téléphone
✅ Fonctionne sur tablette
✅ Interface tactile optimisée
✅ Peut être sauvegardée en raccourci sur l'écran d'accueil

### Installation sur Téléphone (comme PWA)

**Android:**
1. Ouvrir l'app dans Chrome
2. Menu (⋮) → "Installer l'app"
3. Confirmer

**iPhone:**
1. Ouvrir dans Safari
2. Bouton Partage (↑)
3. "Sur l'écran d'accueil"
4. Ajouter

---

## 🌐 Déploiement en Ligne

Pour rendre l'app accessible partout:

### Option 1: Heroku (Gratuit)

```bash
# Installer Heroku CLI
npm install -g heroku

# Authentification
heroku login

# Créer l'app
heroku create mon-pressing

# Déployer
git push heroku main

# Voir les logs
heroku logs --tail
```

### Option 2: Render.com

1. Créer un compte sur render.com
2. Connecter votre repo GitHub
3. Configurer les variables d'environnement
4. Déployer automatique

### Option 3: AWS, Netlify, DigitalOcean
(Voir documentation respective)

---

## 🐛 Résolution de Problèmes

### ❌ "Port 3000 déjà utilisé"
```bash
# Changer le port
PORT=3001 npm start

# Ou tuer le processus
lsof -ti:3000 | xargs kill -9
```

### ❌ "Module not found"
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

### ❌ "Database error"
```bash
# Supprimer la base de données corrompue
rm app.db

# La recréer
npm start
```

### ❌ WhatsApp ne fonctionne pas
- Vérifier que `ENABLE_WHATSAPP=true` dans `.env`
- Vérifier les identifiants Twilio
- Vérifier la connexion internet

---

## 📞 Support & Améliorations Futures

### Fonctionnalités à Venir

🚧 Paiement mobile (Orange Money, MTN)
🚧 Rappels de rendez-vous automatiques
🚧 Application native Android/iOS
🚧 API REST complète
🚧 Statistiques avancées
🚧 Multilingue (Français/Anglais/Pidgin)

### Améliorations Apportées

✅ Interface responsive mobile-first
✅ Système de notifications
✅ Gestion d'erreurs robuste
✅ Design moderne et intuitif
✅ Recherche et filtres
✅ Aperçu des reçus avant impression

---

## 📄 Licence

Cette application est développée pour un usage personnel/commercial.

---

## 🎯 Prochaines Étapes

1. **Tester l'application** avec quelques clients
2. **Ajouter des médicaments** à votre inventaire
3. **Configurer WhatsApp** (optionnel mais recommandé)
4. **Exporter les données** régulièrement
5. **Déployer en ligne** si vous voulez y accéder partout

---

## 👨‍💻 Développeur

Créé avec ❤️ pour simplifier votre gestion métier.

**Contact & Questions:** Contactez votre développeur

---

## 📋 Checklist de Configuration Finale

- [ ] Node.js installé
- [ ] npm install réussi
- [ ] Fichier .env configuré
- [ ] Base de données créée
- [ ] Serveur démarre sans erreurs
- [ ] Interface accessible sur http://localhost:3000
- [ ] Ajouter un client de test
- [ ] Créer un service de test
- [ ] Tester l'envoi WhatsApp (optionnel)
- [ ] Tester l'impression de reçu

**Félicitations! 🎉 Votre application est prête à l'emploi!**

---

## 📞 Besoin d'Aide?

📧 Email: support@example.com
💬 WhatsApp: +237XXXXXXXXX
📱 Visitez: http://localhost:3000

**Bon courage avec votre application!** 🚀
