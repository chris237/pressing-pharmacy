// auth-routes.js - Routes d'authentification

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const auth = require('./auth');
const ReportsEngine = require('./reports');
const db = require('./database');

// ===== AUTHENTIFICATION =====

// INSCRIPTION
router.post('/auth/register',
  body('nom').trim().notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email valide requis'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe min 6 caractères'),
  body('type').isIn(['client', 'vendeur']).withMessage('Type d\'utilisateur invalide'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nom, email, password, type } = req.body;
    const services = req.body.services || '';

    try {
      // Déterminer le rôle (client ou vendeur)
      const roleId = type === 'vendeur' ? 'vendeur' : 'client';

      const user = await auth.createUser({
        nom,
        email,
        password,
        role_id: roleId,
        services_autorise: services
      });

      const token = auth.generateToken(user);

      res.json({
        success: true,
        message: 'Inscription réussie!',
        token,
        user
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// CONNEXION
router.post('/auth/login',
  body('email').isEmail().withMessage('Email valide requis'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const result = await auth.authenticateUser(email, password);
      res.json({
        success: true,
        message: 'Connexion réussie!',
        token: result.token,
        user: result.user
      });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }
);

// VÉRIFIER TOKEN
router.get('/auth/me', auth.authMiddleware, (req, res) => {
  res.json({
    user: req.user,
    valid: true
  });
});

// RAFRAÎCHIR TOKEN
router.post('/auth/refresh', auth.authMiddleware, (req, res) => {
  const newToken = auth.generateToken(req.user);
  res.json({
    token: newToken
  });
});

// ===== GESTION UTILISATEURS (ADMIN) =====

// LISTER UTILISATEURS
router.get('/admin/users', auth.authMiddleware, auth.requireRole('admin'), (req, res) => {
  db.all(
    `SELECT u.id, u.nom, u.email, u.role_id, u.statut, u.dernier_login 
     FROM users u
     ORDER BY u.nom`,
    (err, users) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json(users);
    }
  );
});

// CRÉER UTILISATEUR (ADMIN)
router.post('/admin/users', auth.authMiddleware, auth.requireRole('admin'),
  body('nom').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await auth.createUser(req.body);
      
      // Log audit
      auth.logAuditAction(
        req.user.id,
        'CREATE_USER',
        'users',
        user.id,
        '',
        JSON.stringify(user),
        req.ip
      );

      res.json({ success: true, user });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// MODIFIER UTILISATEUR
router.put('/admin/users/:id', auth.authMiddleware, auth.requireRole('admin'), (req, res) => {
  const { id } = req.params;
  const { nom, email, role_id, statut, services_autorise } = req.body;

  db.run(
    `UPDATE users SET nom = ?, email = ?, role_id = ?, statut = ?, services_autorise = ?
     WHERE id = ?`,
    [nom, email, role_id, statut, services_autorise, id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Log audit
      auth.logAuditAction(
        req.user.id,
        'UPDATE_USER',
        'users',
        id,
        '',
        JSON.stringify(req.body),
        req.ip
      );

      res.json({ success: true, message: 'Utilisateur modifié' });
    }
  );
});

// SUPPRIMER UTILISATEUR
router.delete('/admin/users/:id', auth.authMiddleware, auth.requireRole('admin'), (req, res) => {
  const { id } = req.params;

  db.run(
    'UPDATE users SET statut = ? WHERE id = ?',
    ['inactif', id],
    function(err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      // Log audit
      auth.logAuditAction(
        req.user.id,
        'DELETE_USER',
        'users',
        id,
        'actif',
        'inactif',
        req.ip
      );

      res.json({ success: true, message: 'Utilisateur supprimé' });
    }
  );
});

// ===== RAPPORTS =====

// RAPPORT JOURNALIER
router.get('/rapports/journalier', auth.authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const report = await ReportsEngine.getDailyReport(date);
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// RAPPORT MENSUEL
router.get('/rapports/mensuel', auth.authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) {
      return res.status(400).json({ error: 'Année et mois requis' });
    }
    const report = await ReportsEngine.getMonthlyReport(year, month);
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// RAPPORT PAR PRODUIT
router.get('/rapports/produits', auth.authMiddleware, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const report = await ReportsEngine.getProductReport(
      type || 'pressing',
      startDate,
      endDate
    );
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// RAPPORT PAR CLIENT
router.get('/rapports/client/:clientId', auth.authMiddleware, async (req, res) => {
  try {
    const { clientId } = req.params;
    const report = await ReportsEngine.getClientReport(clientId);
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// RAPPORT PAR VENDEUR
router.get('/rapports/vendeur/:vendeurId', auth.authMiddleware, auth.requireRole('admin'), async (req, res) => {
  try {
    const { vendeurId } = req.params;
    const { startDate, endDate } = req.query;
    const report = await ReportsEngine.getVendeurReport(
      vendeurId,
      startDate || '2020-01-01',
      endDate || new Date().toISOString().split('T')[0]
    );
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// RAPPORT STOCK
router.get('/rapports/stock', auth.authMiddleware, auth.requireRole('admin', 'vendeur'), async (req, res) => {
  try {
    const report = await ReportsEngine.getStockReport();
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// RAPPORT PERFORMANCE
router.get('/rapports/performance', auth.authMiddleware, auth.requireRole('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const report = await ReportsEngine.getPerformanceReport(
      startDate,
      endDate
    );
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// RAPPORT PERSONNALISÉ
router.post('/rapports/custom', auth.authMiddleware, async (req, res) => {
  try {
    const report = await ReportsEngine.getCustomReport(req.body);
    res.json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// STATISTIQUES GÉNÉRALES
router.get('/rapports/stats', auth.authMiddleware, async (req, res) => {
  try {
    const stats = await ReportsEngine.getOverallStats();
    res.json(stats);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// EXPORTER RAPPORT EN CSV
router.post('/rapports/export/csv', auth.authMiddleware, (req, res) => {
  try {
    const { data, filename } = req.body;
    const csv = ReportsEngine.exportToCSV(data, filename);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'rapport'}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ===== AUDIT LOGS (ADMIN) =====

router.get('/admin/audit-logs', auth.authMiddleware, auth.requireRole('admin'), (req, res) => {
  const { limit = 100 } = req.query;

  db.all(
    `SELECT al.*, u.nom as user_nom
     FROM audit_logs al
     JOIN users u ON al.user_id = u.id
     ORDER BY al.date_action DESC
     LIMIT ?`,
    [limit],
    (err, logs) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json(logs);
    }
  );
});

module.exports = router;
