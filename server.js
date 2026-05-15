const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
require('dotenv').config();

const db = require('./database');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// ===== CLIENTS =====
// Ajouter un client
app.post('/api/clients', (req, res) => {
  const { nom, telephone, whatsapp, email, adresse, type } = req.body;
  const id = uuidv4();
  
  db.run(
    `INSERT INTO clients (id, nom, telephone, whatsapp, email, adresse, type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, nom, telephone, whatsapp || telephone, email, adresse, type],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ id, message: 'Client créé avec succès' });
    }
  );
});

// Récupérer tous les clients
app.get('/api/clients', (req, res) => {
  db.all(`SELECT * FROM clients WHERE actif = 1 ORDER BY nom`, (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Récupérer un client
app.get('/api/clients/:id', (req, res) => {
  db.get(`SELECT * FROM clients WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(row);
  });
});

// ===== PRESSING - SERVICES =====
// Ajouter un service pressing
app.post('/api/pressing', (req, res) => {
  const { client_id, description, nombre_vetements, type_service, prix_total, details } = req.body;
  const service_id = uuidv4();
  
  db.run(
    `INSERT INTO pressing_services 
     (id, client_id, description, nombre_vetements, type_service, prix_total, statut)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [service_id, client_id, description, nombre_vetements, type_service, prix_total, 'collecte'],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      // Ajouter les détails
      if (details && details.length > 0) {
        details.forEach(detail => {
          const detail_id = uuidv4();
          db.run(
            `INSERT INTO pressing_details 
             (id, service_id, article, type_service, cout_unitaire, quantite, sous_total)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [detail_id, service_id, detail.article, detail.type_service, 
             detail.cout_unitaire, detail.quantite, detail.sous_total]
          );
        });
      }
      
      res.json({ service_id, message: 'Service pressing créé' });
    }
  );
});

// Récupérer services pressing
app.get('/api/pressing', (req, res) => {
  const { client_id, statut } = req.query;
  let query = `
    SELECT ps.*, c.nom, c.whatsapp FROM pressing_services ps
    JOIN clients c ON ps.client_id = c.id
    WHERE 1=1
  `;
  const params = [];
  
  if (client_id) {
    query += ` AND ps.client_id = ?`;
    params.push(client_id);
  }
  
  if (statut) {
    query += ` AND ps.statut = ?`;
    params.push(statut);
  }
  
  query += ` ORDER BY ps.date_creation DESC`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Mettre à jour statut pressing
app.put('/api/pressing/:id/statut', (req, res) => {
  const { statut } = req.body;
  
  db.run(
    `UPDATE pressing_services SET statut = ? WHERE id = ?`,
    [statut, req.params.id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ message: 'Statut mis à jour' });
    }
  );
});

// ===== MÉDICAMENTS =====
// Ajouter un médicament
app.post('/api/medicaments', (req, res) => {
  const { nom, description, categorie, dosage, quantite_stock, prix_vente, fournisseur } = req.body;
  const id = uuidv4();
  
  db.run(
    `INSERT INTO medicaments 
     (id, nom, description, categorie, dosage, quantite_stock, prix_vente, fournisseur)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, nom, description, categorie, dosage, quantite_stock, prix_vente, fournisseur],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ id, message: 'Médicament créé' });
    }
  );
});

// Récupérer médicaments
app.get('/api/medicaments', (req, res) => {
  db.all(
    `SELECT * FROM medicaments WHERE actif = 1 ORDER BY nom`,
    (err, rows) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// Mettre à jour stock médicament
app.put('/api/medicaments/:id/stock', (req, res) => {
  const { quantite } = req.body;
  
  db.run(
    `UPDATE medicaments SET quantite_stock = quantite_stock + ? WHERE id = ?`,
    [quantite, req.params.id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ message: 'Stock mis à jour' });
    }
  );
});

// ===== VENTES MÉDICAMENTS =====
// Créer une vente
app.post('/api/ventes-medicaments', (req, res) => {
  const { client_id, articles } = req.body;
  const vente_id = uuidv4();
  
  let montant_total = 0;
  articles.forEach(article => {
    montant_total += article.quantite * article.prix_unitaire;
  });
  
  db.run(
    `INSERT INTO ventes_medicaments (id, client_id, montant_total, paiement_statut)
     VALUES (?, ?, ?, ?)`,
    [vente_id, client_id, montant_total, 'payé'],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      
      // Ajouter détails et mettre à jour stock
      articles.forEach(article => {
        const detail_id = uuidv4();
        db.run(
          `INSERT INTO ventes_medicaments_details 
           (id, vente_id, medicament_id, quantite, prix_unitaire, sous_total)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [detail_id, vente_id, article.medicament_id, article.quantite, 
           article.prix_unitaire, article.quantite * article.prix_unitaire]
        );
        
        // Réduire stock
        db.run(
          `UPDATE medicaments SET quantite_stock = quantite_stock - ? WHERE id = ?`,
          [article.quantite, article.medicament_id]
        );
      });
      
      res.json({ vente_id, montant_total, message: 'Vente créée' });
    }
  );
});

// Récupérer ventes
app.get('/api/ventes-medicaments', (req, res) => {
  db.all(
    `SELECT vm.*, c.nom, c.whatsapp FROM ventes_medicaments vm
     JOIN clients c ON vm.client_id = c.id
     ORDER BY vm.date_vente DESC`,
    (err, rows) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// ===== SERVICES INFIRMIERS =====
app.post('/api/services-infirmiers', (req, res) => {
  const { client_id, type_service, description, prix, date_service } = req.body;
  const id = uuidv4();
  
  db.run(
    `INSERT INTO services_infirmiers 
     (id, client_id, type_service, description, prix, date_service, statut)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, client_id, type_service, description, prix, date_service, 'programmé'],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ id, message: 'Service infirmier créé' });
    }
  );
});

// Récupérer services infirmiers
app.get('/api/services-infirmiers', (req, res) => {
  db.all(
    `SELECT si.*, c.nom, c.whatsapp FROM services_infirmiers si
     JOIN clients c ON si.client_id = c.id
     ORDER BY si.date_service`,
    (err, rows) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json(rows);
    }
  );
});

// ===== RAPPORTS & STATISTIQUES =====
app.get('/api/dashboard', (req, res) => {
  const { periode = 'mois' } = req.query;
  
  db.all(
    `SELECT 
      (SELECT COUNT(*) FROM clients WHERE actif = 1) as total_clients,
      (SELECT SUM(prix_total) FROM pressing_services WHERE date_creation >= datetime('now', '-1 month')) as revenus_pressing_mois,
      (SELECT SUM(montant_total) FROM ventes_medicaments WHERE date_vente >= datetime('now', '-1 month')) as revenus_medicaments_mois,
      (SELECT COUNT(*) FROM medicaments WHERE quantite_stock <= quantite_min) as medicaments_rupture
    `,
    (err, row) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json(row[0]);
    }
  );
});

// ===== SERVER =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

module.exports = app;
