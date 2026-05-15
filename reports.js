// reports.js - Système de rapports avancés

const db = require('./database');
const { Parser } = require('json2csv');
const moment = require('moment');

class ReportsEngine {
  // ===== RAPPORT JOURNALIER =====
  static getDailyReport(date) {
    return new Promise((resolve, reject) => {
      const dateStr = date ? moment(date).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');

      db.all(
        `SELECT 
          'pressing' as service,
          COUNT(*) as nombre,
          SUM(prix_total) as montant
        FROM pressing_services
        WHERE DATE(date_creation) = ?
        
        UNION ALL
        
        SELECT 
          'medicaments' as service,
          COUNT(*) as nombre,
          SUM(montant_total) as montant
        FROM ventes_medicaments
        WHERE DATE(date_vente) = ?
        
        UNION ALL
        
        SELECT 
          'services_infirmiers' as service,
          COUNT(*) as nombre,
          SUM(prix) as montant
        FROM services_infirmiers
        WHERE DATE(date_service) = ?`,
        [dateStr, dateStr, dateStr],
        (err, rows) => {
          if (err) return reject(err);

          const report = {
            date: dateStr,
            services: {},
            total_montant: 0
          };

          rows.forEach(row => {
            report.services[row.service] = {
              nombre: row.nombre || 0,
              montant: row.montant || 0
            };
            report.total_montant += row.montant || 0;
          });

          resolve(report);
        }
      );
    });
  }

  // ===== RAPPORT MENSUEL =====
  static getMonthlyReport(year, month) {
    return new Promise((resolve, reject) => {
      const startDate = moment(`${year}-${month}`).startOf('month').format('YYYY-MM-DD');
      const endDate = moment(`${year}-${month}`).endOf('month').format('YYYY-MM-DD');

      db.all(
        `SELECT 
          DATE(date_creation) as jour,
          'pressing' as service,
          COUNT(*) as nombre,
          SUM(prix_total) as montant
        FROM pressing_services
        WHERE date_creation BETWEEN ? AND ?
        GROUP BY DATE(date_creation)
        
        UNION ALL
        
        SELECT 
          DATE(date_vente) as jour,
          'medicaments' as service,
          COUNT(*) as nombre,
          SUM(montant_total) as montant
        FROM ventes_medicaments
        WHERE date_vente BETWEEN ? AND ?
        GROUP BY DATE(date_vente)
        
        UNION ALL
        
        SELECT 
          DATE(date_service) as jour,
          'services_infirmiers' as service,
          COUNT(*) as nombre,
          SUM(prix) as montant
        FROM services_infirmiers
        WHERE date_service BETWEEN ? AND ?
        GROUP BY DATE(date_service)`,
        [startDate, endDate, startDate, endDate, startDate, endDate],
        (err, rows) => {
          if (err) return reject(err);

          const report = {
            periode: `${year}-${month}`,
            jours: {},
            total_montant: 0,
            total_transactions: 0
          };

          rows.forEach(row => {
            if (!report.jours[row.jour]) {
              report.jours[row.jour] = {};
            }
            report.jours[row.jour][row.service] = {
              nombre: row.nombre,
              montant: row.montant
            };
            report.total_montant += row.montant;
            report.total_transactions += row.nombre;
          });

          resolve(report);
        }
      );
    });
  }

  // ===== RAPPORT PAR PRODUIT/SERVICE =====
  static getProductReport(type = 'pressing', startDate, endDate) {
    return new Promise((resolve, reject) => {
      let query, params;

      if (type === 'pressing') {
        query = `
          SELECT 
            type_service,
            COUNT(*) as nombre_services,
            SUM(prix_total) as montant_total,
            AVG(prix_total) as montant_moyen,
            MIN(prix_total) as montant_min,
            MAX(prix_total) as montant_max
          FROM pressing_services
          WHERE date_creation BETWEEN ? AND ?
          GROUP BY type_service
          ORDER BY montant_total DESC
        `;
        params = [startDate || '2020-01-01', endDate || moment().format('YYYY-MM-DD')];
      } else if (type === 'medicaments') {
        query = `
          SELECT 
            m.nom,
            SUM(vmd.quantite) as quantite_vendue,
            SUM(vmd.sous_total) as montant_total,
            AVG(vmd.prix_unitaire) as prix_moyen
          FROM ventes_medicaments_details vmd
          JOIN medicaments m ON vmd.medicament_id = m.id
          JOIN ventes_medicaments vm ON vmd.vente_id = vm.id
          WHERE vm.date_vente BETWEEN ? AND ?
          GROUP BY m.id, m.nom
          ORDER BY montant_total DESC
        `;
        params = [startDate || '2020-01-01', endDate || moment().format('YYYY-MM-DD')];
      } else if (type === 'services_infirmiers') {
        query = `
          SELECT 
            type_service,
            COUNT(*) as nombre_services,
            SUM(prix) as montant_total,
            AVG(prix) as prix_moyen
          FROM services_infirmiers
          WHERE date_service BETWEEN ? AND ?
          GROUP BY type_service
          ORDER BY montant_total DESC
        `;
        params = [startDate || '2020-01-01', endDate || moment().format('YYYY-MM-DD')];
      }

      db.all(query, params, (err, rows) => {
        if (err) return reject(err);

        const report = {
          type,
          periode: `${startDate} à ${endDate}`,
          produits: rows,
          total_montant: rows.reduce((sum, row) => sum + (row.montant_total || 0), 0)
        };

        resolve(report);
      });
    });
  }

  // ===== RAPPORT PAR CLIENT =====
  static getClientReport(clientId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM clients WHERE id = ?', [clientId], (err, client) => {
        if (err) return reject(err);

        db.all(
          `SELECT 
            'pressing' as type,
            COUNT(*) as nombre,
            SUM(prix_total) as montant
          FROM pressing_services
          WHERE client_id = ?
          
          UNION ALL
          
          SELECT 
            'medicaments' as type,
            COUNT(*) as nombre,
            SUM(montant_total) as montant
          FROM ventes_medicaments
          WHERE client_id = ?
          
          UNION ALL
          
          SELECT 
            'services_infirmiers' as type,
            COUNT(*) as nombre,
            SUM(prix) as montant
          FROM services_infirmiers
          WHERE client_id = ?`,
          [clientId, clientId, clientId],
          (err, rows) => {
            if (err) return reject(err);

            const report = {
              client: client,
              services: {},
              total_montant: 0
            };

            rows.forEach(row => {
              report.services[row.type] = {
                nombre: row.nombre,
                montant: row.montant
              };
              report.total_montant += row.montant;
            });

            resolve(report);
          }
        );
      });
    });
  }

  // ===== RAPPORT PAR VENDEUR =====
  static getVendeurReport(vendeurId, startDate, endDate) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ? AND role_id = ?', [vendeurId, 'vendeur'], (err, vendeur) => {
        if (err) return reject(err);
        if (!vendeur) return reject(new Error('Vendeur non trouvé'));

        db.all(
          `SELECT 
            'ventes_medicaments' as type,
            COUNT(*) as nombre,
            SUM(montant_total) as montant
          FROM ventes_medicaments
          WHERE created_by = ? AND date_vente BETWEEN ? AND ?`,
          [vendeurId, startDate, endDate],
          (err, rows) => {
            if (err) return reject(err);

            const report = {
              vendeur: vendeur,
              periode: `${startDate} à ${endDate}`,
              ventes: rows[0] || { nombre: 0, montant: 0 }
            };

            resolve(report);
          }
        );
      });
    });
  }

  // ===== RAPPORT DE STOCK =====
  static getStockReport() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          id,
          nom,
          dosage,
          categorie,
          quantite_stock,
          quantite_min,
          prix_vente,
          CASE 
            WHEN quantite_stock <= quantite_min THEN 'rupture'
            WHEN quantite_stock <= quantite_min * 1.5 THEN 'critique'
            ELSE 'ok'
          END as statut,
          quantite_stock * prix_vente as valeur_stock
        FROM medicaments
        WHERE actif = 1
        ORDER BY quantite_stock ASC`,
        (err, rows) => {
          if (err) return reject(err);

          const report = {
            total_medicaments: rows.length,
            ruptures: rows.filter(r => r.statut === 'rupture'),
            critiques: rows.filter(r => r.statut === 'critique'),
            ok: rows.filter(r => r.statut === 'ok'),
            valeur_stock_totale: rows.reduce((sum, row) => sum + row.valeur_stock, 0),
            details: rows
          };

          resolve(report);
        }
      );
    });
  }

  // ===== RAPPORT DE PERFORMANCE =====
  static getPerformanceReport(startDate, endDate) {
    return new Promise((resolve, reject) => {
      const queries = [
        {
          name: 'pressing',
          query: `SELECT COUNT(*) as nombre, SUM(prix_total) as montant 
                  FROM pressing_services 
                  WHERE date_creation BETWEEN ? AND ?`
        },
        {
          name: 'medicaments',
          query: `SELECT COUNT(*) as nombre, SUM(montant_total) as montant 
                  FROM ventes_medicaments 
                  WHERE date_vente BETWEEN ? AND ?`
        },
        {
          name: 'services_infirmiers',
          query: `SELECT COUNT(*) as nombre, SUM(prix) as montant 
                  FROM services_infirmiers 
                  WHERE date_service BETWEEN ? AND ?`
        },
        {
          name: 'clients',
          query: `SELECT COUNT(*) as nombre FROM clients WHERE date_creation BETWEEN ? AND ?`
        }
      ];

      const report = {
        periode: `${startDate} à ${endDate}`,
        services: {},
        total_montant: 0,
        nouveau_clients: 0
      };

      let completed = 0;

      queries.forEach(q => {
        db.get(q.query, [startDate, endDate], (err, row) => {
          if (q.name === 'clients') {
            report.nouveau_clients = row.nombre;
          } else {
            report.services[q.name] = {
              nombre: row.nombre,
              montant: row.montant
            };
            report.total_montant += row.montant;
          }

          completed++;
          if (completed === queries.length) {
            resolve(report);
          }
        });
      });
    });
  }

  // ===== EXPORTER EN CSV =====
  static exportToCSV(data, filename) {
    try {
      const csv = new Parser().parse(Array.isArray(data) ? data : [data]);
      return csv;
    } catch (err) {
      throw new Error('Erreur export CSV: ' + err.message);
    }
  }

  // ===== RAPPORT PERSONNALISÉ =====
  static getCustomReport(filters) {
    return new Promise((resolve, reject) => {
      const {
        type,
        startDate,
        endDate,
        service,
        clientId,
        vendeurId,
        statut
      } = filters;

      let query = `
        SELECT 
          ps.*,
          c.nom as client_nom,
          c.telephone as client_tel
        FROM pressing_services ps
        JOIN clients c ON ps.client_id = c.id
        WHERE 1=1
      `;
      let params = [];

      if (startDate) {
        query += ` AND ps.date_creation >= ?`;
        params.push(startDate);
      }
      if (endDate) {
        query += ` AND ps.date_creation <= ?`;
        params.push(endDate);
      }
      if (service) {
        query += ` AND ps.type_service = ?`;
        params.push(service);
      }
      if (clientId) {
        query += ` AND ps.client_id = ?`;
        params.push(clientId);
      }
      if (statut) {
        query += ` AND ps.statut = ?`;
        params.push(statut);
      }

      query += ` ORDER BY ps.date_creation DESC`;

      db.all(query, params, (err, rows) => {
        if (err) return reject(err);

        const report = {
          filters,
          nombre_resultats: rows.length,
          total_montant: rows.reduce((sum, row) => sum + (row.prix_total || 0), 0),
          donnees: rows
        };

        resolve(report);
      });
    });
  }

  // ===== STATISTIQUES GÉNÉRALES =====
  static getOverallStats() {
    return new Promise((resolve, reject) => {
      const stats = {
        clients: 0,
        services_pressing: 0,
        revenus_pressing: 0,
        ventes_medicaments: 0,
        revenus_medicaments: 0,
        services_infirmiers: 0,
        revenus_services: 0,
        medicaments_rupture: 0
      };

      let completed = 0;
      const queries = [
        { key: 'clients', query: 'SELECT COUNT(*) as count FROM clients WHERE actif = 1' },
        { key: 'services_pressing', query: 'SELECT COUNT(*) as count FROM pressing_services' },
        { key: 'revenus_pressing', query: 'SELECT SUM(prix_total) as total FROM pressing_services' },
        { key: 'ventes_medicaments', query: 'SELECT COUNT(*) as count FROM ventes_medicaments' },
        { key: 'revenus_medicaments', query: 'SELECT SUM(montant_total) as total FROM ventes_medicaments' },
        { key: 'services_infirmiers', query: 'SELECT COUNT(*) as count FROM services_infirmiers' },
        { key: 'revenus_services', query: 'SELECT SUM(prix) as total FROM services_infirmiers' },
        { key: 'medicaments_rupture', query: 'SELECT COUNT(*) as count FROM medicaments WHERE quantite_stock <= quantite_min' }
      ];

      queries.forEach(q => {
        db.get(q.query, (err, row) => {
          if (q.key.includes('revenus')) {
            stats[q.key] = row.total || 0;
          } else {
            stats[q.key] = row.count || 0;
          }

          completed++;
          if (completed === queries.length) {
            resolve(stats);
          }
        });
      });
    });
  }
}

module.exports = ReportsEngine;
