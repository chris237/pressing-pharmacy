// reports-matrix.js - Matrice complète des rapports possibles

/**
 * SYSTÈME DE RAPPORTS AVANCÉ
 * 
 * 7 types de rapports + filtres combinables
 * = Millions de combinaisons de rapports possibles
 */

const REPORTS_MATRIX = {
  // ===== 1. RAPPORT JOURNALIER =====
  journalier: {
    nom: '📅 Rapport Journalier',
    description: 'Statistiques détaillées d\'une journée spécifique',
    accessible_par: ['admin'],
    filtres: {
      date: {
        type: 'date',
        requis: true,
        description: 'Date du rapport (défaut: aujourd\'hui)'
      },
      par_service: {
        type: 'boolean',
        default: true,
        description: 'Détails par service (pressing, pharmacy, infirmier)'
      }
    },
    donne: {
      nombre_transactions: 'Nombre total de transactions du jour',
      montant_total: 'Montant total du jour',
      par_service: 'Détails par type de service',
      heure_de_pointe: 'Heure avec plus de transactions',
      client_top: 'Top client de la journée',
      vendeur_top: 'Meilleur vendeur du jour'
    },
    exemple_url: '/api/rapports/journalier?date=2024-01-15'
  },

  // ===== 2. RAPPORT MENSUEL =====
  mensuel: {
    nom: '📆 Rapport Mensuel',
    description: 'Détails complets d\'un mois',
    accessible_par: ['admin'],
    filtres: {
      year: {
        type: 'number',
        requis: true,
        description: 'Année'
      },
      month: {
        type: 'number',
        requis: true,
        description: 'Mois (1-12)'
      },
      par_jour: {
        type: 'boolean',
        default: true,
        description: 'Détails jour par jour'
      },
      par_semaine: {
        type: 'boolean',
        default: false,
        description: 'Résumé hebdomadaire'
      }
    },
    donne: {
      total_mois: 'Total montant du mois',
      total_transactions: 'Nombre transactions du mois',
      jour_meilleur: 'Meilleur jour du mois',
      jour_pire: 'Pire jour du mois',
      moyenne_jour: 'Moyenne par jour',
      tendance: 'Tendance (en hausse, baisse, stable)',
      details_jours: 'Détails complets jour par jour'
    },
    exemple_url: '/api/rapports/mensuel?year=2024&month=01'
  },

  // ===== 3. RAPPORT PAR PRODUIT/SERVICE =====
  par_produit: {
    nom: '📦 Rapport par Produit/Service',
    description: 'Analyse détaillée de chaque type de service/produit',
    accessible_par: ['admin', 'vendeur'],
    filtres: {
      type: {
        type: 'enum',
        values: ['pressing', 'pharmacy', 'infirmier'],
        requis: true,
        description: 'Type de service'
      },
      date_debut: {
        type: 'date',
        default: 'début du mois',
        description: 'Date de début'
      },
      date_fin: {
        type: 'date',
        default: 'aujourd\'hui',
        description: 'Date de fin'
      },
      sous_type: {
        type: 'string',
        optional: true,
        description: 'Sous-type si applicable (ex: "Lavage Simple" pour pressing)'
      },
      order_by: {
        type: 'enum',
        values: ['montant_desc', 'montant_asc', 'quantite_desc', 'quantite_asc', 'prix_moyen'],
        default: 'montant_desc',
        description: 'Tri des résultats'
      }
    },
    donne: {
      nom_produit: 'Nom du produit/service',
      nombre_ventes: 'Nombre de fois vendu',
      montant_total: 'Montant total généré',
      montant_moyen: 'Montant moyen par vente',
      montant_min: 'Montant minimum',
      montant_max: 'Montant maximum',
      pourcentage_ventes: 'Pourcentage du total',
      profit_estimation: 'Profit estimé (si données disponibles)'
    },
    exemple_url: '/api/rapports/produits?type=pressing&date_debut=2024-01-01&date_fin=2024-01-31&order_by=montant_desc'
  },

  // ===== 4. RAPPORT PAR CLIENT =====
  par_client: {
    nom: '👤 Rapport par Client',
    description: 'Historique complet et statistiques d\'un client',
    accessible_par: ['admin', 'vendeur', 'client (ses données)'],
    filtres: {
      client_id: {
        type: 'uuid',
        requis: true,
        description: 'ID du client'
      },
      date_debut: {
        type: 'date',
        optional: true,
        description: 'Depuis'
      },
      date_fin: {
        type: 'date',
        optional: true,
        description: 'Jusqu\'à'
      },
      par_service: {
        type: 'boolean',
        default: true,
        description: 'Détails par service'
      }
    },
    donne: {
      nom_client: 'Nom du client',
      contact: 'Téléphone, email',
      total_achats: 'Montant total des achats',
      nombre_transactions: 'Nombre de transactions',
      par_service: 'Détails par service (pressing, pharmacy, infirmier)',
      service_favori: 'Service le plus utilisé',
      date_premiere_achat: 'Depuis quand client',
      date_dernier_achat: 'Dernier achat',
      frequence: 'Fréquence achats (jour, semaine, mois)',
      client_value: 'Valeur client (VIP, régulier, rare)'
    },
    exemple_url: '/api/rapports/client/client-123'
  },

  // ===== 5. RAPPORT PAR VENDEUR =====
  par_vendeur: {
    nom: '💼 Rapport par Vendeur',
    description: 'Performance et statistiques d\'un vendeur',
    accessible_par: ['admin', 'vendeur (ses données)'],
    filtres: {
      vendeur_id: {
        type: 'uuid',
        requis: true,
        description: 'ID du vendeur'
      },
      date_debut: {
        type: 'date',
        default: 'début du mois',
        description: 'Période de début'
      },
      date_fin: {
        type: 'date',
        default: 'aujourd\'hui',
        description: 'Période de fin'
      },
      par_jour: {
        type: 'boolean',
        default: false,
        description: 'Détails jour par jour'
      }
    },
    donne: {
      nom_vendeur: 'Nom du vendeur',
      total_ventes: 'Montant total vendu',
      nombre_transactions: 'Nombre de ventes',
      montant_moyen: 'Montant moyen par vente',
      commissions_possibles: 'Commissions calculables',
      top_produit: 'Produit le plus vendu',
      par_service: 'Détails par service (pressing/pharmacy)',
      croissance: 'Croissance vs période antérieure'
    },
    exemple_url: '/api/rapports/vendeur/vendeur-456?date_debut=2024-01-01&date_fin=2024-01-31'
  },

  // ===== 6. RAPPORT STOCK =====
  stock: {
    nom: '📊 Rapport Stock',
    description: 'État complet de l\'inventaire des médicaments',
    accessible_par: ['admin', 'vendeur'],
    filtres: {
      statut: {
        type: 'enum',
        values: ['all', 'rupture', 'critique', 'ok'],
        default: 'all',
        description: 'Filtrer par statut'
      },
      categorie: {
        type: 'string',
        optional: true,
        description: 'Catégorie de médicaments'
      },
      order_by: {
        type: 'enum',
        values: ['quantite_asc', 'quantite_desc', 'valeur_desc'],
        default: 'quantite_asc',
        description: 'Tri'
      }
    },
    donne: {
      total_medicaments: 'Nombre de médicaments dans le stock',
      medicaments_rupture: 'Nombre en rupture (stock = 0)',
      medicaments_critique: 'Nombre en stock critique (< seuil min)',
      medicaments_ok: 'Nombre en bon état',
      valeur_stock_total: 'Valeur totale de l\'inventaire',
      reapprovisionnement_urgent: 'Liste des articles urgents',
      alertes: 'Alertes et recommandations'
    },
    exemple_url: '/api/rapports/stock?statut=all'
  },

  // ===== 7. RAPPORT PERFORMANCE =====
  performance: {
    nom: '📈 Rapport Performance',
    description: 'Vue d\'ensemble globale de la performance',
    accessible_par: ['admin'],
    filtres: {
      date_debut: {
        type: 'date',
        default: 'début du mois',
        description: 'Période de début'
      },
      date_fin: {
        type: 'date',
        default: 'aujourd\'hui',
        description: 'Période de fin'
      },
      comparer_avec: {
        type: 'enum',
        values: ['mois_precedent', 'mois_dernier_an', 'periode_custom'],
        optional: true,
        description: 'Comparer avec'
      }
    },
    donne: {
      total_montant_tous_services: 'Revenu total',
      total_transactions: 'Nombre de transactions',
      montant_moyen_transaction: 'Montant moyen',
      revenus_par_service: 'Détails par service (pressing, pharmacy, infirmier)',
      nouveaux_clients: 'Nombre de nouveaux clients',
      clients_perdus: 'Clients qui ne reviennent pas',
      vendeurs_top_3: 'Top 3 vendeurs',
      produits_top_5: 'Top 5 produits',
      taux_croissance: 'Taux de croissance',
      tendance_generale: 'Tendance générale'
    },
    exemple_url: '/api/rapports/performance?date_debut=2024-01-01&date_fin=2024-01-31'
  }
};

/**
 * RAPPORT PERSONNALISÉ
 * Combinaison libre de filtres
 */
const rapport_personnalise = {
  nom: '⚙️ Rapport Personnalisé',
  description: 'Créer un rapport avec filtres personnalisés',
  accessible_par: ['admin', 'vendeur'],
  filtres_disponibles: {
    date_debut: 'Date de début',
    date_fin: 'Date de fin',
    type_service: 'Type de service (pressing/pharmacy/infirmier)',
    client_id: 'Client spécifique',
    vendeur_id: 'Vendeur spécifique',
    statut: 'Statut (collecte/lavage/prêt/livré)',
    prix_min: 'Prix minimum',
    prix_max: 'Prix maximum',
    produit: 'Produit/Service spécifique',
    categorie: 'Catégorie',
    par_jour: 'Grouper par jour',
    par_semaine: 'Grouper par semaine',
    par_mois: 'Grouper par mois'
  },
  exemple: {
    type: 'pressing',
    date_debut: '2024-01-01',
    date_fin: '2024-01-31',
    service: 'Lavage Simple',
    statut: 'livre',
    par_jour: true
  },
  exemple_url: `POST /api/rapports/custom
{
  "type": "pressing",
  "date_debut": "2024-01-01",
  "date_fin": "2024-01-31",
  "service": "Lavage Simple",
  "statut": "livre"
}`
};

/**
 * EXPORTS POSSIBLES
 */
const EXPORT_FORMATS = {
  json: {
    format: 'JSON',
    extension: '.json',
    use_case: 'API, traitement données'
  },
  csv: {
    format: 'CSV',
    extension: '.csv',
    use_case: 'Excel, analyse données'
  },
  pdf: {
    format: 'PDF',
    extension: '.pdf',
    use_case: 'Impression, partage'
  },
  excel: {
    format: 'Excel',
    extension: '.xlsx',
    use_case: 'Analyse détaillée, graphiques'
  }
};

/**
 * MATRICE DE COMBINAISONS POSSIBLES
 */
const REPORT_COMBINATIONS = `
╔════════════════════════════════════════════════════════════════════════════╗
║                  COMBINAISONS DE RAPPORTS POSSIBLES                        ║
╚════════════════════════════════════════════════════════════════════════════╝

EXEMPLE 1: Rapport Journalier
├── Date: 2024-01-15
├── Montrer: Stats par service
└── Résultat: Revenus du 15 janvier par type (pressing, pharmacy, infirmier)

EXEMPLE 2: Rapport Mensuel
├── Mois: 01/2024
├── Détails: Jour par jour
├── Tri: Revenus décroissants
└── Résultat: Top jours du mois

EXEMPLE 3: Rapport Produits - Pressing
├── Type: Pressing
├── Période: 2024-01-01 à 2024-01-31
├── Filtre: Seulement "Lavage Simple"
├── Tri: Par montant
└── Résultat: Stats lavages du mois

EXEMPLE 4: Rapport Produits - Pharmacy
├── Type: Pharmacy
├── Période: Derniers 3 mois
├── Filtre: Antibiotiques uniquement
├── Tri: Par quantité vendue
└── Résultat: Antibiotiques les plus vendus

EXEMPLE 5: Rapport Client
├── Client: Jean Dupont
├── Période: Historique complet
├── Détails: Par service
└── Résultat: Tous les achats de Jean

EXEMPLE 6: Rapport Vendeur
├── Vendeur: Marie Tante
├── Période: 2024
├── Détails: Jour par jour
└── Résultat: Performance annuelle

EXEMPLE 7: Rapport Stock
├── Filtre: Uniquement ruptures
├── Catégorie: Tous
├── Action: Lister pour réapprovisionner
└── Résultat: Médicaments à commander

EXEMPLE 8: Rapport Performance
├── Période: 2024-01
├── Comparer avec: 2023-01
├── Détails: Par service
└── Résultat: Croissance année sur année

EXEMPLE 9: Rapport Personnalisé - Complexe
├── Type: Pressing
├── Période: 2024-01-01 à 2024-01-31
├── Service: Repassage
├── Statut: Livré
├── Client: VIP clients uniquement
├── Montant min: 5000 FCFA
├── Par: Semaine
└── Résultat: Services premium livrés par semaine

EXEMPLE 10: Rapport Personnalisé - Pharmacy
├── Type: Pharmacy
├── Période: Dernier 7 jours
├── Catégorie: Analgésiques
├── Vendeur: Tous
├── Ordre: Top produits
└── Résultat: Analgésiques top vendus cette semaine

╔════════════════════════════════════════════════════════════════════════════╗
║                  FILTRES COMBINABLES (Résumé)                             ║
╚════════════════════════════════════════════════════════════════════════════╝

TEMPORELS:
  ✓ Date exacte
  ✓ Plage de dates (début-fin)
  ✓ Jour spécifique
  ✓ Semaine spécifique
  ✓ Mois spécifique
  ✓ Année entière
  ✓ "Derniers X jours"

PAR SERVICE:
  ✓ Pressing uniquement
  ✓ Pharmacy uniquement
  ✓ Services infirmiers uniquement
  ✓ Combinaisons multiples

PAR TYPE:
  ✓ Type de service (Lavage, Repassage, etc.)
  ✓ Catégorie de produit (Antibiotiques, Vitamines, etc.)
  ✓ Type d'intervention infirmière

PAR ENTITÉ:
  ✓ Client spécifique
  ✓ Vendeur spécifique
  ✓ Groupe de clients (VIP, réguliers, etc.)
  ✓ Groupe de vendeurs

PAR STATUT:
  ✓ Collecte
  ✓ Lavage
  ✓ Prêt
  ✓ Livré
  ✓ Payé/Non payé

PAR MONTANT:
  ✓ Prix minimum
  ✓ Prix maximum
  ✓ Montant exact
  ✓ Fourchette de prix

GROUPEMENT:
  ✓ Par jour
  ✓ Par semaine
  ✓ Par mois
  ✓ Par service
  ✓ Par vendeur
  ✓ Par client
  ✓ Par statut

AFFICHAGE:
  ✓ Montants totaux
  ✓ Moyennes
  ✓ Min/Max
  ✓ Pourcentages
  ✓ Graphiques
  ✓ Tableaux détaillés

EXPORT:
  ✓ JSON (API)
  ✓ CSV (Excel)
  ✓ PDF (Impression)
  ✓ XLSX (Analyse)

╔════════════════════════════════════════════════════════════════════════════╗
║                  NOMBRE DE COMBINAISONS POSSIBLES                         ║
╚════════════════════════════════════════════════════════════════════════════╝

Sans limites théoriques:
• 7 types rapports
• 5+ filtres temporels par type
• 3 types services
• 10+ sous-types par service
• Nombre illimité de clients
• Nombre illimité de vendeurs
• 5+ statuts
• 4+ formats export

= Potentiellement MILLIONS DE COMBINAISONS POSSIBLES

Chaque combinaison = Un rapport unique et personnalisé
`;

module.exports = {
  REPORTS_MATRIX,
  rapport_personnalise,
  EXPORT_FORMATS,
  REPORT_COMBINATIONS
};
