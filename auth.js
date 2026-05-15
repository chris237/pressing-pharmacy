// auth.js - Système d'authentification et autorisation

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRY = '7d';

// ===== ENUMS RÔLES =====
const ROLES = {
  ADMIN: 'admin',
  VENDEUR: 'vendeur',
  CLIENT: 'client'
};

const SERVICES = {
  PRESSING: 'pressing',
  PHARMACY: 'pharmacy',
  INFIRMIER: 'infirmier'
};

// ===== HASH PASSWORD =====
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ===== GÉNÉRER JWT TOKEN =====
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role_id,
      nom: user.nom,
      services: user.services_autorise ? user.services_autorise.split(',') : []
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

// ===== VÉRIFIER TOKEN =====
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// ===== MIDDLEWARE AUTHENTIFICATION =====
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }

  req.user = decoded;
  next();
}

// ===== MIDDLEWARE PERMISSION =====
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès refusé - permissions insuffisantes' });
    }

    next();
  };
}

// ===== MIDDLEWARE SERVICE AUTORISÉ =====
function requireService(...allowedServices) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const userServices = req.user.services || [];
    const hasService = allowedServices.some(service => userServices.includes(service));

    if (!hasService && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: 'Service non autorisé' });
    }

    next();
  };
}

// ===== CRÉER UN UTILISATEUR =====
async function createUser(userData) {
  return new Promise(async (resolve, reject) => {
    const {
      nom,
      email,
      password,
      role_id,
      phone = '',
      services_autorise = ''
    } = userData;

    // Vérifier si l'email existe
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (row) {
        return reject(new Error('Cet email est déjà utilisé'));
      }

      const id = uuidv4();
      const hashedPassword = await hashPassword(password);

      db.run(
        `INSERT INTO users (id, nom, email, password, role_id, phone, services_autorise)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, nom, email, hashedPassword, role_id, phone, services_autorise],
        function(err) {
          if (err) {
            return reject(err);
          }
          resolve({
            id,
            nom,
            email,
            role_id,
            phone,
            services_autorise
          });
        }
      );
    });
  });
}

// ===== AUTHENTIFIER UTILISATEUR (LOGIN) =====
async function authenticateUser(email, password) {
  return new Promise(async (resolve, reject) => {
    db.get(
      `SELECT u.*, r.nom as role_nom FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = ? AND u.statut = 'actif'`,
      [email],
      async (err, user) => {
        if (err) {
          return reject(err);
        }

        if (!user) {
          return reject(new Error('Email ou mot de passe invalide'));
        }

        const passwordValid = await verifyPassword(password, user.password);
        if (!passwordValid) {
          return reject(new Error('Email ou mot de passe invalide'));
        }

        // Mettre à jour le dernier login
        db.run(
          'UPDATE users SET dernier_login = CURRENT_TIMESTAMP WHERE id = ?',
          [user.id]
        );

        const token = generateToken(user);

        resolve({
          token,
          user: {
            id: user.id,
            nom: user.nom,
            email: user.email,
            role: user.role_id,
            role_nom: user.role_nom,
            phone: user.phone,
            services: user.services_autorise ? user.services_autorise.split(',') : []
          }
        });
      }
    );
  });
}

// ===== OBTENIR LES PERMISSIONS D'UN RÔLE =====
function getPermissionsForRole(roleId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT p.* FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [roleId],
      (err, permissions) => {
        if (err) {
          return reject(err);
        }
        resolve(permissions || []);
      }
    );
  });
}

// ===== AJOUTER PERMISSION À RÔLE =====
async function addPermissionToRole(roleId, permissionId) {
  return new Promise((resolve, reject) => {
    const id = uuidv4();
    db.run(
      `INSERT INTO role_permissions (id, role_id, permission_id)
       VALUES (?, ?, ?)`,
      [id, roleId, permissionId],
      function(err) {
        if (err) {
          return reject(err);
        }
        resolve({ id, roleId, permissionId });
      }
    );
  });
}

// ===== ENREGISTRER ACTION AUDIT =====
function logAuditAction(userId, action, module, referenceId = '', ancienneValeur = '', nouvelleValeur = '', ipAddress = '') {
  const id = uuidv4();
  db.run(
    `INSERT INTO audit_logs (id, user_id, action, module, reference_id, ancienne_valeur, nouvelle_valeur, ip_address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, action, module, referenceId, ancienneValeur, nouvelleValeur, ipAddress],
    (err) => {
      if (err) {
        console.error('Erreur audit log:', err);
      }
    }
  );
}

// ===== INITIALISER LES RÔLES PAR DÉFAUT =====
function initializeDefaultRoles() {
  db.serialize(() => {
    // Créer les rôles
    const roles = [
      { id: uuidv4(), nom: ROLES.ADMIN, description: 'Administrateur complet', niveau: 3 },
      { id: uuidv4(), nom: ROLES.VENDEUR, description: 'Vendeur - accès ventes', niveau: 2 },
      { id: uuidv4(), nom: ROLES.CLIENT, description: 'Client - accès personnel', niveau: 1 }
    ];

    roles.forEach(role => {
      db.run(
        `INSERT OR IGNORE INTO roles (id, nom, description, niveau)
         VALUES (?, ?, ?, ?)`,
        [role.id, role.nom, role.description, role.niveau]
      );
    });

    // Créer les permissions
    const permissions = [
      // Clients
      { id: uuidv4(), nom: 'clients_read', description: 'Lire clients', module: 'clients', action: 'read' },
      { id: uuidv4(), nom: 'clients_create', description: 'Créer clients', module: 'clients', action: 'create' },
      { id: uuidv4(), nom: 'clients_update', description: 'Modifier clients', module: 'clients', action: 'update' },
      { id: uuidv4(), nom: 'clients_delete', description: 'Supprimer clients', module: 'clients', action: 'delete' },

      // Pressing
      { id: uuidv4(), nom: 'pressing_read', description: 'Lire pressing', module: 'pressing', action: 'read' },
      { id: uuidv4(), nom: 'pressing_create', description: 'Créer service pressing', module: 'pressing', action: 'create' },
      { id: uuidv4(), nom: 'pressing_update', description: 'Modifier service pressing', module: 'pressing', action: 'update' },

      // Médicaments
      { id: uuidv4(), nom: 'medicaments_read', description: 'Lire médicaments', module: 'medicaments', action: 'read' },
      { id: uuidv4(), nom: 'medicaments_create', description: 'Ajouter médicaments', module: 'medicaments', action: 'create' },
      { id: uuidv4(), nom: 'medicaments_update', description: 'Modifier médicaments', module: 'medicaments', action: 'update' },
      { id: uuidv4(), nom: 'ventes_create', description: 'Créer ventes', module: 'medicaments', action: 'ventes_create' },

      // Services Infirmiers
      { id: uuidv4(), nom: 'services_read', description: 'Lire services infirmiers', module: 'services', action: 'read' },
      { id: uuidv4(), nom: 'services_create', description: 'Créer service infirmier', module: 'services', action: 'create' },

      // Rapports
      { id: uuidv4(), nom: 'rapports_read', description: 'Lire rapports', module: 'rapports', action: 'read' },
      { id: uuidv4(), nom: 'rapports_export', description: 'Exporter rapports', module: 'rapports', action: 'export' },

      // Admin
      { id: uuidv4(), nom: 'admin_users', description: 'Gérer utilisateurs', module: 'admin', action: 'users' },
      { id: uuidv4(), nom: 'admin_roles', description: 'Gérer rôles', module: 'admin', action: 'roles' },
      { id: uuidv4(), nom: 'admin_audit', description: 'Voir audit logs', module: 'admin', action: 'audit' }
    ];

    permissions.forEach(perm => {
      db.run(
        `INSERT OR IGNORE INTO permissions (id, nom, description, module, action)
         VALUES (?, ?, ?, ?, ?)`,
        [perm.id, perm.nom, perm.description, perm.module, perm.action]
      );
    });

    console.log('✅ Rôles et permissions par défaut initialisés');
  });
}

module.exports = {
  // Enums
  ROLES,
  SERVICES,

  // Fonctions
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  createUser,
  authenticateUser,
  getPermissionsForRole,
  addPermissionToRole,
  logAuditAction,
  initializeDefaultRoles,

  // Middleware
  authMiddleware,
  requireRole,
  requireService
};
