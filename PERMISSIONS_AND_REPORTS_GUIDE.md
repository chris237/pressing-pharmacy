# 🔐 GUIDE COMPLET: PERMISSIONS & RAPPORTS

## 1️⃣ SYSTÈME DE PERMISSIONS PAR RÔLE & SERVICE

### Vue d'Ensemble

```
Chaque utilisateur = Rôle + Services Autorisés + Permissions
```

```
┌──────────────────────────────────────────────────────┐
│ UTILISATEUR                                          │
├──────────────────────────────────────────────────────┤
│ Nom: Jean Dupont                                     │
│ Email: jean@example.com                              │
│ Rôle: CLIENT                                         │
│ Services Autorisés: [pressing, pharmacy]  ← CLÉS!   │
│ Password: hashed (Bcrypt)                            │
│ Statut: actif                                        │
│ Date Création: 2024-01-15                            │
└──────────────────────────────────────────────────────┘
```

---

### LES 3 RÔLES PRINCIPAUX

#### **1. ADMIN** 👑

```
Permissions: TOUTES
Services: [pressing, pharmacy, infirmier]
Accès: COMPLET

Peut faire:
  ✅ Gérer utilisateurs (créer, modifier, supprimer)
  ✅ Assigner rôles aux utilisateurs
  ✅ Assigner services aux utilisateurs
  ✅ Voir TOUS les clients
  ✅ Voir TOUS les services
  ✅ Modifier tous les statuts
  ✅ Générer TOUS les rapports
  ✅ Voir logs d'audit
  ✅ Configurer le système
  ✅ Faire des backups

Exemple: "Je veux créer un vendeur avec accès à pressing ET pharmacy"
→ POST /api/admin/users
   {
     "nom": "Marie Tante",
     "email": "marie@example.com",
     "password": "...",
     "role": "vendeur",
     "services_autorise": "pressing,pharmacy"
   }
```

---

#### **2. VENDEUR** 💼

```
Permissions: LIMITÉES (ventes & rapports)
Services: [pressing, pharmacy]
Accès: SES VENTES + RAPPORTS PERSO

Peut faire:
  ✅ Créer services pressing
  ✅ Créer ventes pharmacy
  ✅ Modifier ses propres services/ventes
  ✅ Voir TOUS les clients (pour vendre)
  ✅ Consulter le stock
  ✅ Générer rapports personnalisés
  ✅ Voir ses propres stats

Ne peut PAS:
  ❌ Créer/modifier utilisateurs
  ❌ Voir stats d'autres vendeurs
  ❌ Voir logs d'audit
  ❌ Configurer système
  ❌ Supprimer données

Exemple: "Je veux voir mes ventes du mois"
→ GET /api/rapports/vendeur/:vendeurId?date_debut=2024-01-01&date_fin=2024-01-31
```

---

#### **3. CLIENT** 👤

```
Permissions: TRÈS LIMITÉES (données personnelles)
Services: [pressing] OU [pharmacy] OU [pressing, pharmacy]
Accès: SES DONNÉES SEULEMENT

Peut faire:
  ✅ Voir ses propres données
  ✅ Modifier ses propres données
  ✅ Voir ses services pressing (si autorisé)
  ✅ Voir ses achats pharmacy (si autorisé)
  ✅ Consulter son historique personnel
  ✅ Voir statut ses commandes

Ne peut PAS:
  ❌ Voir données autres clients
  ❌ Créer/modifier services
  ❌ Créer/modifier ventes
  ❌ Voir rapports globaux
  ❌ Voir logs d'audit
  ❌ Configurer système

IMPORTANT: Services autorisés = Ce qu'il peut voir!
```

---

### LES TROIS CONFIGURATIONS CLIENT

#### **Configuration A: CLIENT PRESSING ONLY** 👔

```
services_autorise = "pressing"

✅ Peut voir:
   • Ses services pressing (collecte, lavage, livraison)
   • Statut ses commandes pressing

❌ Ne peut pas voir:
   • Pharmacy / Médicaments
   • Services infirmiers
   • Données autres clients

USE CASE: Un client qui utilise SEULEMENT le pressing
```

#### **Configuration B: CLIENT PHARMACY ONLY** 💊

```
services_autorise = "pharmacy"

✅ Peut voir:
   • Ses achats de médicaments
   • Historique pharmacy
   • Ses commandes pharmacy

❌ Ne peut pas voir:
   • Pressing / Services
   • Services infirmiers
   • Données autres clients

USE CASE: Un client qui achète SEULEMENT des médicaments
```

#### **Configuration C: CLIENT PRESSING + PHARMACY** 👔💊

```
services_autorise = "pressing,pharmacy"

✅ Peut voir:
   • Ses services pressing
   • Ses achats pharmacy
   • Historique complet des DEUX services

❌ Ne peut pas voir:
   • Services infirmiers
   • Données autres clients

USE CASE: Un client qui utilise pressing ET achète des médicaments
```

---

## 2️⃣ SYSTÈME DE RAPPORTS COMPLET

### 7 Types de Rapports Principaux

```
┌────────────────────────────────────────────────┐
│          LES 7 TYPES DE RAPPORTS               │
├────────────────────────────────────────────────┤
│ 1. 📅 JOURNALIER                               │
│    Stats d'une journée complète                │
│                                                │
│ 2. 📆 MENSUEL                                  │
│    Détails jour par jour du mois               │
│                                                │
│ 3. 📦 PAR PRODUIT                              │
│    Analyse par type service/produit            │
│                                                │
│ 4. 👤 PAR CLIENT                               │
│    Historique client complet                   │
│                                                │
│ 5. 💼 PAR VENDEUR                              │
│    Performance vendeur                         │
│                                                │
│ 6. 📊 STOCK                                    │
│    Inventaire médicaments                      │
│                                                │
│ 7. 📈 PERFORMANCE                              │
│    Vue d'ensemble globale                      │
└────────────────────────────────────────────────┘
```

---

### RAPPORT 1: JOURNALIER 📅

**Qui peut accéder:** Admin

**URL:**
```
GET /api/rapports/journalier?date=2024-01-15
```

**Retour:**
```json
{
  "date": "2024-01-15",
  "services": {
    "pressing": {
      "nombre": 12,
      "montant": 36000
    },
    "pharmacy": {
      "nombre": 28,
      "montant": 21500
    },
    "infirmier": {
      "nombre": 5,
      "montant": 25000
    }
  },
  "total_montant": 82500,
  "nombre_transactions_total": 45
}
```

**Filtres disponibles:**
- date (obligatoire)
- par_service (grouper par service?)

---

### RAPPORT 2: MENSUEL 📆

**Qui peut accéder:** Admin

**URL:**
```
GET /api/rapports/mensuel?year=2024&month=01
```

**Retour:**
```json
{
  "periode": "2024-01",
  "jours": {
    "2024-01-01": {
      "pressing": { "nombre": 3, "montant": 9000 },
      "pharmacy": { "nombre": 5, "montant": 3500 }
    },
    "2024-01-02": { ... },
    ...
  },
  "total_montant": 250000,
  "total_transactions": 156,
  "jour_meilleur": "2024-01-15",
  "jour_pire": "2024-01-20"
}
```

**Filtres disponibles:**
- year (obligatoire)
- month (obligatoire)
- par_jour (par défaut: true)
- par_semaine (optionnel)

---

### RAPPORT 3: PAR PRODUIT 📦

**Qui peut accéder:** Admin, Vendeur

**URL:**
```
GET /api/rapports/produits?type=pressing&date_debut=2024-01-01&date_fin=2024-01-31
```

**Types disponibles:**
- `pressing` → Par type de service pressing
- `pharmacy` → Par médicament
- `infirmier` → Par type d'intervention

**Retour (exemple Pressing):**
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
      "montant_max": 4000,
      "pourcentage_ventes": 62.8
    },
    {
      "type_service": "Repassage",
      "nombre_services": 20,
      "montant_total": 80000,
      "montant_moyen": 4000,
      "pourcentage_ventes": 37.2
    }
  ],
  "total_montant": 215000
}
```

**Retour (exemple Pharmacy):**
```json
{
  "type": "pharmacy",
  "periode": "2024-01-01 à 2024-01-31",
  "produits": [
    {
      "nom": "Paracétamol 500mg",
      "quantite_vendue": 156,
      "montant_total": 15600,
      "prix_moyen": 100,
      "pourcentage_ventes": 18.4
    },
    {
      "nom": "Ibuprofène 400mg",
      "quantite_vendue": 98,
      "montant_total": 9800,
      "prix_moyen": 100,
      "pourcentage_ventes": 11.6
    }
  ],
  "total_montant": 84800
}
```

**Filtres disponibles:**
- type (obligatoire) ← Clé!
- date_debut
- date_fin
- sous_type (optionnel)
- order_by (montant_desc, montant_asc, quantite_desc, etc.)

---

### RAPPORT 4: PAR CLIENT 👤

**Qui peut accéder:** Admin, Vendeur, Client (ses données)

**URL:**
```
GET /api/rapports/client/client-123
```

**Retour:**
```json
{
  "client": {
    "id": "client-123",
    "nom": "Jean Dupont",
    "telephone": "+237654321098",
    "email": "jean@example.com"
  },
  "services": {
    "pressing": {
      "nombre": 12,
      "montant": 36000
    },
    "pharmacy": {
      "nombre": 8,
      "montant": 12500
    },
    "infirmier": {
      "nombre": 2,
      "montant": 10000
    }
  },
  "total_montant": 58500,
  "date_premiere_achat": "2024-01-01",
  "date_dernier_achat": "2024-01-15",
  "client_value": "régulier"
}
```

**Filtres disponibles:**
- client_id (obligatoire)
- date_debut (optionnel)
- date_fin (optionnel)
- par_service (afficher détails?)

---

### RAPPORT 5: PAR VENDEUR 💼

**Qui peut accéder:** Admin, Vendeur (ses données)

**URL:**
```
GET /api/rapports/vendeur/vendeur-456?date_debut=2024-01-01&date_fin=2024-01-31
```

**Retour:**
```json
{
  "vendeur": {
    "id": "vendeur-456",
    "nom": "Marie Tante",
    "email": "marie@example.com"
  },
  "periode": "2024-01-01 à 2024-01-31",
  "ventes": {
    "nombre": 156,
    "montant": 125000,
    "montant_moyen": 801.28
  },
  "par_service": {
    "pharmacy": {
      "nombre": 100,
      "montant": 85000
    },
    "pressing": {
      "nombre": 56,
      "montant": 40000
    }
  },
  "commissions_possibles": 6250
}
```

**Filtres disponibles:**
- vendeur_id (obligatoire)
- date_debut
- date_fin
- par_jour (optionnel)

---

### RAPPORT 6: STOCK 📊

**Qui peut accéder:** Admin, Vendeur

**URL:**
```
GET /api/rapports/stock?statut=all
```

**Retour:**
```json
{
  "total_medicaments": 45,
  "ruptures": [
    {
      "id": "med-001",
      "nom": "Paracétamol 500mg",
      "quantite_stock": 0,
      "quantite_min": 10,
      "statut": "rupture",
      "urgent": true
    }
  ],
  "critiques": [
    {
      "nom": "Ibuprofène 400mg",
      "quantite_stock": 8,
      "quantite_min": 10,
      "statut": "critique"
    }
  ],
  "ok": [
    {
      "nom": "Aspirin 100mg",
      "quantite_stock": 150,
      "quantite_min": 20,
      "statut": "ok"
    }
  ],
  "valeur_stock_totale": 450000,
  "articles_a_reapprovisionner": [
    "Paracétamol",
    "Ibuprofène",
    "Vitamine C"
  ]
}
```

**Filtres disponibles:**
- statut: `all`, `rupture`, `critique`, `ok`
- categorie (optionnel)
- order_by (quantite_asc, quantite_desc, valeur_desc)

---

### RAPPORT 7: PERFORMANCE 📈

**Qui peut accéder:** Admin

**URL:**
```
GET /api/rapports/performance?date_debut=2024-01-01&date_fin=2024-01-31
```

**Retour:**
```json
{
  "periode": "2024-01-01 à 2024-01-31",
  "total_montant_tous_services": 520000,
  "total_transactions": 456,
  "montant_moyen_transaction": 1140.35,
  "revenues_par_service": {
    "pressing": {
      "nombre": 85,
      "montant": 255000
    },
    "pharmacy": {
      "nombre": 156,
      "montant": 125000
    },
    "infirmier": {
      "nombre": 28,
      "montant": 140000
    }
  },
  "nouveau_clients": 12,
  "clients_perdus": 2,
  "vendeurs_top_3": [
    { "nom": "Marie Tante", "montant": 95000 },
    { "nom": "Jean Paul", "montant": 78000 },
    { "nom": "Fatima Diallo", "montant": 52000 }
  ],
  "produits_top_5": [
    { "nom": "Lavage Simple", "montant": 135000 },
    { "nom": "Paracétamol", "montant": 21500 },
    { "nom": "Repassage", "montant": 80000 },
    { "nom": "Consultation", "montant": 75000 },
    { "nom": "Ibuprofène", "montant": 18500 }
  ],
  "taux_croissance": "+15.3%"
}
```

**Filtres disponibles:**
- date_debut
- date_fin
- comparer_avec (mois_precedent, mois_dernier_an)

---

## 3️⃣ RAPPORT PERSONNALISÉ ⚙️

### Combiner n'importe quels filtres!

**URL:**
```
POST /api/rapports/custom
{
  "type": "pressing",
  "date_debut": "2024-01-01",
  "date_fin": "2024-01-31",
  "service": "Lavage Simple",
  "statut": "livre",
  "par": "jour"
}
```

**Filtres combinables:**
```
Temporels:
  ✓ date_debut
  ✓ date_fin
  ✓ par (jour, semaine, mois)

Services:
  ✓ type (pressing, pharmacy, infirmier)
  ✓ service (Lavage, Repassage, etc.)
  ✓ categorie (Antibiotiques, etc.)

Entités:
  ✓ client_id
  ✓ vendeur_id

Statuts:
  ✓ statut (collecte, lavage, prêt, livré)
  ✓ paiement (payé, non payé)

Montants:
  ✓ prix_min
  ✓ prix_max

Affichage:
  ✓ order_by
  ✓ limit
```

### Exemples Personnalisés

**Exemple 1: Services Pressing Lavage du mois, livrés**
```json
{
  "type": "pressing",
  "service": "Lavage Simple",
  "statut": "livre",
  "date_debut": "2024-01-01",
  "date_fin": "2024-01-31"
}
```

**Exemple 2: Médicaments Antibiotiques vendus par Marie, dernier 7 jours**
```json
{
  "type": "pharmacy",
  "categorie": "Antibiotiques",
  "vendeur_id": "vendeur-456",
  "date_debut": "2024-01-08",
  "date_fin": "2024-01-15"
}
```

**Exemple 3: Clients premium qui ont acheté pressing + pharmacy**
```json
{
  "type": "client",
  "services": ["pressing", "pharmacy"],
  "montant_min": 50000,
  "date_debut": "2023-01-01",
  "date_fin": "2024-01-15"
}
```

---

## 4️⃣ CONTRÔLE D'ACCÈS RAPPORTS

```
┌─────────────────────────────────────────────────┐
│ QUI PEUT ACCÉDER À QUEL RAPPORT?                │
├─────────────────────────────────────────────────┤
│ JOURNALIER        → Admin uniquement             │
│ MENSUEL           → Admin uniquement             │
│ PAR PRODUIT       → Admin + Vendeur              │
│ PAR CLIENT        → Admin + Vendeur + Client     │
│ PAR VENDEUR       → Admin + Vendeur (ses stats) │
│ STOCK             → Admin + Vendeur              │
│ PERFORMANCE       → Admin uniquement             │
│ PERSONNALISÉ      → Admin + Vendeur (limité)    │
└─────────────────────────────────────────────────┘
```

---

## 5️⃣ RÉCAPITULATIF FINAL

```
PERMISSIONS + SERVICES:
├─ ADMIN
│  ├─ Services: [pressing, pharmacy, infirmier]
│  ├─ Permissions: TOUTES
│  └─ Rapports: TOUS (7 types)
│
├─ VENDEUR
│  ├─ Services: [pressing, pharmacy]
│  ├─ Permissions: Ventes & ses rapports
│  └─ Rapports: Par produit, Par vendeur, Stock
│
└─ CLIENT
   ├─ Services: [pressing] OU [pharmacy] OU [pressing, pharmacy]
   ├─ Permissions: Ses données seulement
   └─ Rapports: Par client (SES stats)

TOTALEMENT GRANULAIRE ET FLEXIBLE!
```

---

**C'est clair? Tout est couvert!** ✅
