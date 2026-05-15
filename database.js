const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'app.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur connexion DB:', err);
  } else {
    console.log('✅ Base de données connectée');
    initializeDatabase();
  }
});

const initializeDatabase = () => {
  db.serialize(() => {
    // Table Clients
    db.run(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        nom TEXT NOT NULL,
        telephone TEXT NOT NULL,
        whatsapp TEXT,
        email TEXT,
        adresse TEXT,
        type TEXT NOT NULL,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
        actif BOOLEAN DEFAULT 1
      )
    `);

    // Table Services Pressing
    db.run(`
      CREATE TABLE IF NOT EXISTS pressing_services (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        description TEXT,
        nombre_vetements INTEGER,
        type_service TEXT NOT NULL,
        statut TEXT DEFAULT 'collecte',
        prix_total DECIMAL(10,2),
        date_collecte DATETIME,
        date_livraison_estimee DATETIME,
        date_livraison_reelle DATETIME,
        notes TEXT,
        whatsapp_envoye BOOLEAN DEFAULT 0,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(client_id) REFERENCES clients(id)
      )
    `);

    // Table Détails Services Pressing
    db.run(`
      CREATE TABLE IF NOT EXISTS pressing_details (
        id TEXT PRIMARY KEY,
        service_id TEXT NOT NULL,
        article TEXT NOT NULL,
        type_service TEXT NOT NULL,
        cout_unitaire DECIMAL(10,2),
        quantite INTEGER DEFAULT 1,
        sous_total DECIMAL(10,2),
        FOREIGN KEY(service_id) REFERENCES pressing_services(id)
      )
    `);

    // Table Stock Médicaments
    db.run(`
      CREATE TABLE IF NOT EXISTS medicaments (
        id TEXT PRIMARY KEY,
        nom TEXT NOT NULL,
        description TEXT,
        categorie TEXT,
        dosage TEXT,
        quantite_stock INTEGER DEFAULT 0,
        quantite_min INTEGER DEFAULT 10,
        prix_achat DECIMAL(10,2),
        prix_vente DECIMAL(10,2),
        date_expiration DATE,
        fournisseur TEXT,
        actif BOOLEAN DEFAULT 1,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Ventes Médicaments
    db.run(`
      CREATE TABLE IF NOT EXISTS ventes_medicaments (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        date_vente DATETIME DEFAULT CURRENT_TIMESTAMP,
        montant_total DECIMAL(10,2),
        paiement_statut TEXT DEFAULT 'payé',
        notes TEXT,
        whatsapp_envoye BOOLEAN DEFAULT 0,
        FOREIGN KEY(client_id) REFERENCES clients(id)
      )
    `);

    // Table Détails Ventes Médicaments
    db.run(`
      CREATE TABLE IF NOT EXISTS ventes_medicaments_details (
        id TEXT PRIMARY KEY,
        vente_id TEXT NOT NULL,
        medicament_id TEXT NOT NULL,
        quantite INTEGER,
        prix_unitaire DECIMAL(10,2),
        sous_total DECIMAL(10,2),
        FOREIGN KEY(vente_id) REFERENCES ventes_medicaments(id),
        FOREIGN KEY(medicament_id) REFERENCES medicaments(id)
      )
    `);

    // Table Services Infirmiers
    db.run(`
      CREATE TABLE IF NOT EXISTS services_infirmiers (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        type_service TEXT NOT NULL,
        description TEXT,
        prix DECIMAL(10,2),
        statut TEXT DEFAULT 'programmé',
        date_service DATETIME,
        notes TEXT,
        whatsapp_envoye BOOLEAN DEFAULT 0,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(client_id) REFERENCES clients(id)
      )
    `);

    // Table Messages WhatsApp
    db.run(`
      CREATE TABLE IF NOT EXISTS messages_whatsapp (
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        type TEXT NOT NULL,
        contenu TEXT,
        statut TEXT DEFAULT 'envoyé',
        date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
        reference_id TEXT,
        FOREIGN KEY(client_id) REFERENCES clients(id)
      )
    `);

    console.log('✅ Tables créées avec succès');
  });
};

module.exports = db;
