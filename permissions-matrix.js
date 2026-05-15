// permissions-matrix.js - Matrice complète des droits d'accès

/**
 * SYSTÈME DE PERMISSIONS GRANULAIRE
 * 
 * Chaque utilisateur a:
 * 1. Un RÔLE (admin, vendeur, client)
 * 2. Des SERVICES autorisés (pressing, pharmacy, infirmier)
 * 3. Des PERMISSIONS par module
 */

const PERMISSIONS_MATRIX = {
  // ===== ADMIN (Accès complet) =====
  admin: {
    role: 'admin',
    nom_complet: 'Administrateur',
    services_autorise: ['pressing', 'pharmacy', 'infirmier'], // Tous les services
    permissions: {
      // Gestion utilisateurs
      users: {
        create: true,      // Créer utilisateurs
        read: true,        // Lire tous utilisateurs
        update: true,      // Modifier utilisateurs
        delete: true,      // Supprimer utilisateurs
        assign_role: true, // Attribuer rôles
        assign_services: true // Attribuer services
      },
      // Gestion clients
      clients: {
        create: true,
        read: true,
        update: true,
        delete: true,
        read_all: true     // Lire tous les clients
      },
      // Services Pressing
      pressing: {
        create: true,
        read: true,
        update: true,
        delete: true,
        change_status: true
      },
      // Services Médicaments
      pharmacy: {
        create: true,
        read: true,
        update: true,
        delete: true,
        manage_stock: true,
        manage_ventes: true
      },
      // Services Infirmiers
      infirmier: {
        create: true,
        read: true,
        update: true,
        delete: true
      },
      // Rapports
      reports: {
        journalier: true,
        mensuel: true,
        par_produit: true,
        par_client: true,
        par_vendeur: true,
        stock: true,
        performance: true,
        personnalise: true,
        export: true,
        auto_schedule: true
      },
      // Audit
      audit: {
        read: true,
        export: true
      },
      // Configuration
      config: {
        system: true,
        backup: true,
        restore: true
      }
    },
    notes: 'Accès complet au système'
  },

  // ===== VENDEUR (Accès modéré) =====
  vendeur: {
    role: 'vendeur',
    nom_complet: 'Vendeur/Caissier',
    services_autorise: ['pressing', 'pharmacy'], // Peut vendre pressing ET pharmacy
    permissions: {
      // Gestion clients (lecture seulement)
      clients: {
        create: false,
        read: true,        // Lire clients pour vendre
        update: false,
        delete: false,
        read_all: true     // Lire TOUS les clients
      },
      // Services Pressing
      pressing: {
        create: true,      // Créer service pressing
        read: true,
        update: true,      // Modifier ses propres services
        delete: false,
        change_status: true // Mettre à jour statut
      },
      // Services Médicaments
      pharmacy: {
        create: true,      // Créer vente
        read: true,
        update: true,      // Modifier vente
        delete: false,
        manage_stock: true, // Lire stock
        manage_ventes: true // Gérer ventes
      },
      // Services Infirmiers
      infirmier: {
        create: false,
        read: true,
        update: false,
        delete: false
      },
      // Rapports (seulement ses données)
      reports: {
        journalier: false,
        mensuel: false,
        par_produit: true,   // Voir stats produits
        par_client: false,   // Pas ses clients
        par_vendeur: true,   // SES propres stats
        stock: true,         // Voir stock
        performance: false,
        personnalise: true,  // Ses rapports personnalisés
        export: true
      },
      // Audit (lecture seulement)
      audit: {
        read: false
      }
    },
    notes: 'Accès aux ventes et rapports personnels'
  },

  // ===== CLIENT - PRESSING ONLY =====
  client_pressing: {
    role: 'client',
    nom_complet: 'Client Pressing',
    services_autorise: ['pressing'], // SEULEMENT pressing
    permissions: {
      // Gestion clients
      clients: {
        create: false,
        read: true,        // Lire SES données seulement
        update: true,      // Modifier SES données
        delete: false,
        read_all: false,   // PAS accès autres clients
        read_own_only: true
      },
      // Services Pressing
      pressing: {
        create: false,      // Pas créer service
        read: true,        // Voir SES services
        update: false,
        delete: false,
        change_status: false,
        view_own_only: true
      },
      // Services Médicaments
      pharmacy: {
        create: false,
        read: false,       // PAS d'accès pharmacy
        update: false,
        delete: false,
        manage_stock: false,
        manage_ventes: false
      },
      // Services Infirmiers
      infirmier: {
        create: false,
        read: false,
        update: false,
        delete: false
      },
      // Rapports (seulement ses services)
      reports: {
        journalier: false,
        mensuel: false,
        par_produit: false,
        par_client: true,   // SES propres stats
        par_vendeur: false,
        stock: false,
        performance: false,
        personnalise: false,
        export: false
      }
    },
    notes: 'Accès pressing uniquement'
  },

  // ===== CLIENT - PHARMACY ONLY =====
  client_pharmacy: {
    role: 'client',
    nom_complet: 'Client Pharmacy',
    services_autorise: ['pharmacy'], // SEULEMENT pharmacy
    permissions: {
      // Gestion clients
      clients: {
        create: false,
        read: true,        // Lire SES données seulement
        update: true,      // Modifier SES données
        delete: false,
        read_all: false,   // PAS accès autres clients
        read_own_only: true
      },
      // Services Pressing
      pressing: {
        create: false,
        read: false,       // PAS d'accès pressing
        update: false,
        delete: false
      },
      // Services Médicaments
      pharmacy: {
        create: false,
        read: true,        // Voir SES achats
        update: false,
        delete: false,
        manage_stock: false,
        manage_ventes: false,
        view_own_only: true
      },
      // Services Infirmiers
      infirmier: {
        create: false,
        read: false,
        update: false,
        delete: false
      },
      // Rapports (seulement ses achats)
      reports: {
        journalier: false,
        mensuel: false,
        par_produit: false,
        par_client: true,   // SES propres stats
        par_vendeur: false,
        stock: false,
        performance: false,
        personnalise: false,
        export: false
      }
    },
    notes: 'Accès pharmacy uniquement'
  },

  // ===== CLIENT - PRESSING + PHARMACY =====
  client_hybrid: {
    role: 'client',
    nom_complet: 'Client Pressing + Pharmacy',
    services_autorise: ['pressing', 'pharmacy'], // LES DEUX services
    permissions: {
      // Gestion clients
      clients: {
        create: false,
        read: true,        // Lire SES données seulement
        update: true,      // Modifier SES données
        delete: false,
        read_all: false,
        read_own_only: true
      },
      // Services Pressing
      pressing: {
        create: false,
        read: true,        // Voir SES services pressing
        update: false,
        delete: false,
        view_own_only: true
      },
      // Services Médicaments
      pharmacy: {
        create: false,
        read: true,        // Voir SES achats pharmacy
        update: false,
        delete: false,
        manage_ventes: false,
        view_own_only: true
      },
      // Services Infirmiers
      infirmier: {
        create: false,
        read: false,
        update: false,
        delete: false
      },
      // Rapports (combiné)
      reports: {
        journalier: false,
        mensuel: false,
        par_produit: false,
        par_client: true,   // SES stats (pressing + pharmacy)
        par_vendeur: false,
        stock: false,
        performance: false,
        personnalise: false,
        export: false
      }
    },
    notes: 'Accès pressing ET pharmacy'
  }
};

/**
 * TABLEAU RÉCAPITULATIF DES PERMISSIONS
 */
const PERMISSIONS_SUMMARY = `
╔════════════════════════════════════════════════════════════════════════════╗
║                    MATRICE DES DROITS D'ACCÈS                             ║
╚════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│ 👑 ADMIN - Accès Complet                                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Services: [pressing, pharmacy, infirmier]                                   │
│ Utilisateurs:    ✅ Créer, Lire, Modifier, Supprimer, Assigner rôles       │
│ Clients:         ✅ TOUS - Créer, Lire, Modifier, Supprimer               │
│ Pressing:        ✅ TOUS - Créer, Lire, Modifier, Supprimer, Changer statut│
│ Pharmacy:        ✅ TOUS - Créer, Lire, Modifier, Supprimer, Stock, Ventes │
│ Infirmier:       ✅ TOUS - Créer, Lire, Modifier, Supprimer                │
│ Rapports:        ✅ TOUS (7 types) - Générer, Filtrer, Exporter            │
│ Audit:           ✅ Voir logs, Exporter                                    │
│ Config:          ✅ Système, Backup, Restore                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 💼 VENDEUR - Accès Modéré (Ventes & Rapports Personnels)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Services: [pressing, pharmacy]                                              │
│ Utilisateurs:    ❌ Pas d'accès                                            │
│ Clients:         ✅ Lire TOUS (pour vendre), Pas créer/modifier           │
│ Pressing:        ✅ Créer, Lire, Modifier SES services, Changer statut    │
│ Pharmacy:        ✅ Créer ventes, Lire, Modifier, Gérer stock & ventes    │
│ Infirmier:       ✅ Lire uniquement                                        │
│ Rapports:        ✅ Par produit, Par vendeur (SES stats), Stock, Personnalé│
│ Audit:           ❌ Pas d'accès                                            │
│ Config:          ❌ Pas d'accès                                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 👤 CLIENT PRESSING - Accès Limité (Pressing Seulement)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ Services: [pressing]                                                        │
│ Utilisateurs:    ❌ Pas d'accès                                            │
│ Clients:         ✅ Lire & Modifier SES DONNÉES seulement                 │
│ Pressing:        ✅ Lire SES services pressing                             │
│ Pharmacy:        ❌ AUCUN accès                                            │
│ Infirmier:       ❌ AUCUN accès                                            │
│ Rapports:        ✅ Par client (SES stats pressing)                        │
│ Audit:           ❌ Pas d'accès                                            │
│ Config:          ❌ Pas d'accès                                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 👤 CLIENT PHARMACY - Accès Limité (Pharmacy Seulement)                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ Services: [pharmacy]                                                        │
│ Utilisateurs:    ❌ Pas d'accès                                            │
│ Clients:         ✅ Lire & Modifier SES DONNÉES seulement                 │
│ Pressing:        ❌ AUCUN accès                                            │
│ Pharmacy:        ✅ Lire SES achats pharmacy                               │
│ Infirmier:       ❌ AUCUN accès                                            │
│ Rapports:        ✅ Par client (SES stats pharmacy)                        │
│ Audit:           ❌ Pas d'accès                                            │
│ Config:          ❌ Pas d'accès                                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ 👤 CLIENT PRESSING + PHARMACY - Accès Modéré (Les Deux Services)            │
├─────────────────────────────────────────────────────────────────────────────┤
│ Services: [pressing, pharmacy]                                              │
│ Utilisateurs:    ❌ Pas d'accès                                            │
│ Clients:         ✅ Lire & Modifier SES DONNÉES seulement                 │
│ Pressing:        ✅ Lire SES services pressing                             │
│ Pharmacy:        ✅ Lire SES achats pharmacy                               │
│ Infirmier:       ❌ AUCUN accès                                            │
│ Rapports:        ✅ Par client (SES stats combinées pressing + pharmacy)   │
│ Audit:           ❌ Pas d'accès                                            │
│ Config:          ❌ Pas d'accès                                            │
└─────────────────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════════════╗
║                        LÉGENDE                                            ║
╠════════════════════════════════════════════════════════════════════════════╣
║ ✅ = Autorisé                                                             ║
║ ❌ = Interdit                                                             ║
║ [services] = Services que l'utilisateur peut accéder                      ║
║ SES = Données de cet utilisateur uniquement                               ║
║ TOUS = Accès à toutes les données du système                             ║
╚════════════════════════════════════════════════════════════════════════════╝
`;

module.exports = {
  PERMISSIONS_MATRIX,
  PERMISSIONS_SUMMARY,
  
  // Fonction pour vérifier permission
  hasPermission: function(userRole, userServices, module, action) {
    const perms = PERMISSIONS_MATRIX[userRole];
    if (!perms) return false;
    
    const modulePerms = perms.permissions[module];
    if (!modulePerms) return false;
    
    return modulePerms[action] === true;
  },

  // Fonction pour vérifier accès service
  hasServiceAccess: function(userServices, requiredService) {
    return userServices && userServices.split(',').includes(requiredService);
  },

  // Fonction pour vérifier lecture données propres seulement
  canReadOwnDataOnly: function(userRole) {
    const perms = PERMISSIONS_MATRIX[userRole];
    return perms && perms.permissions.clients && perms.permissions.clients.read_own_only;
  }
};
