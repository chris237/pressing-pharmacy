// notifications.js - Système de notifications multi-canal

const nodemailer = require('nodemailer');
const twilio = require('twilio');
const webpush = require('web-push');

class NotificationService {
  constructor() {
    // Email
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail', // Ou autre service email
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // SMS (Twilio)
    this.smsClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.smsNumber = process.env.TWILIO_PHONE_NUMBER;

    // Push notifications
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    this.notificationQueue = [];
  }

  /**
   * ===== EMAIL NOTIFICATIONS =====
   */
  async sendEmail(toEmail, subject, htmlContent) {
    try {
      const result = await this.emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: subject,
        html: htmlContent
      });

      console.log('✅ Email envoyé:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Erreur email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendEmailTemplate(toEmail, template, data) {
    const templates = {
      welcome: `
        <h1>Bienvenue!</h1>
        <p>Bonjour ${data.name},</p>
        <p>Bienvenue sur notre plateforme Pressing & Pharmacy!</p>
        <p><a href="${data.loginUrl}">Se connecter</a></p>
      `,

      order_confirmation: `
        <h1>Confirmation de commande</h1>
        <p>Bonjour ${data.clientName},</p>
        <p>Votre commande a été reçue!</p>
        <p><strong>Référence:</strong> ${data.reference}</p>
        <p><strong>Montant:</strong> ${data.montant} FCFA</p>
      `,

      order_ready: `
        <h1>Votre commande est prête!</h1>
        <p>Bonjour ${data.clientName},</p>
        <p>Votre commande est prête à être retirée!</p>
        <p><strong>Référence:</strong> ${data.reference}</p>
      `,

      invoice: `
        <h1>Votre facture</h1>
        <p>Bonjour ${data.clientName},</p>
        <p>Veuillez trouver ci-joint votre facture.</p>
        <p><strong>Montant total:</strong> ${data.montant} FCFA</p>
      `,

      password_reset: `
        <h1>Réinitialiser votre mot de passe</h1>
        <p>Cliquez ici pour réinitialiser:</p>
        <p><a href="${data.resetUrl}">Réinitialiser</a></p>
        <p>Lien valide 24h.</p>
      `
    };

    const html = templates[template];
    if (!html) throw new Error(`Template "${template}" not found`);

    return this.sendEmail(toEmail, data.subject || template, html);
  }

  /**
   * ===== SMS NOTIFICATIONS =====
   */
  async sendSMS(toPhone, message) {
    if (!this.smsClient) {
      console.log('⚠️ SMS non configuré.');
      return { success: false };
    }

    try {
      const result = await this.smsClient.messages.create({
        from: this.smsNumber,
        to: toPhone,
        body: message
      });

      console.log('✅ SMS envoyé:', result.sid);
      return { success: true, messageId: result.sid };
    } catch (error) {
      console.error('❌ Erreur SMS:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ===== PUSH NOTIFICATIONS =====
   */
  async sendPushNotification(subscription, title, options = {}) {
    if (!subscription) return { success: false };

    try {
      const payload = JSON.stringify({
        title: title,
        body: options.body || '',
        icon: options.icon || '/icon.png',
        badge: '/badge.png',
        tag: options.tag || 'notification',
        data: options.data || {}
      });

      await webpush.sendNotification(subscription, payload);

      console.log('✅ Push notification envoyée');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur push:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * ===== IN-APP NOTIFICATIONS =====
   */
  async sendInAppNotification(userId, title, message, type = 'info') {
    return new Promise((resolve, reject) => {
      const id = require('uuid').v4();
      const db = require('./database');

      db.run(
        `INSERT INTO notifications (id, user_id, title, message, type, read, created_at)
         VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)`,
        [id, userId, title, message, type],
        (err) => {
          if (err) reject(err);
          else resolve({ success: true, notificationId: id });
        }
      );
    });
  }

  /**
   * ===== NOTIFICATIONS MULTI-CANAL =====
   */
  async sendMultiChannelNotification(clientId, type, data, channels = ['whatsapp', 'email', 'inapp']) {
    const results = {};

    for (const channel of channels) {
      try {
        switch (channel) {
          case 'whatsapp':
            // results.whatsapp = await whatsappService.send(...);
            break;

          case 'email':
            if (data.email) {
              results.email = await this.sendEmailTemplate(
                data.email,
                type,
                data
              );
            }
            break;

          case 'sms':
            if (data.phone) {
              results.sms = await this.sendSMS(data.phone, data.message);
            }
            break;

          case 'push':
            if (data.pushSubscription) {
              results.push = await this.sendPushNotification(
                data.pushSubscription,
                data.title,
                data
              );
            }
            break;

          case 'inapp':
            results.inapp = await this.sendInAppNotification(
              clientId,
              data.title,
              data.message,
              type
            );
            break;
        }
      } catch (error) {
        results[channel] = { success: false, error: error.message };
      }
    }

    return results;
  }

  /**
   * ===== NOTIFICATIONS AUTOMATIQUES PROGRAMMÉES =====
   */
  scheduleNotification(delay, clientId, type, data, channels) {
    setTimeout(() => {
      this.sendMultiChannelNotification(clientId, type, data, channels);
    }, delay);
  }

  /**
   * ===== RAPPELS AUTOMATIQUES =====
   */
  async sendAutomaticReminders() {
    // Rappel RDV demain
    this.sendAppointmentReminders();

    // Rappel paiement en attente
    this.sendPaymentReminders();

    // Rappel dépôt pressing expire bientôt
    this.sendPressingReminders();

    // Rappel stock critique
    this.sendStockAlerts();
  }

  async sendAppointmentReminders() {
    const db = require('./database');

    db.all(
      `SELECT * FROM services_infirmiers 
       WHERE DATE(date_service) = DATE('now', '+1 day')
       AND reminder_sent = 0`,
      async (err, appointments) => {
        if (err) return;

        for (const apt of appointments) {
          await this.sendInAppNotification(
            apt.client_id,
            '🩺 Rappel RDV demain',
            `Votre rendez-vous est demain à ${apt.date_service}`,
            'reminder'
          );

          db.run(
            'UPDATE services_infirmiers SET reminder_sent = 1 WHERE id = ?',
            [apt.id]
          );
        }
      }
    );
  }

  async sendPaymentReminders() {
    const db = require('./database');

    db.all(
      `SELECT * FROM ventes_medicaments 
       WHERE paiement_statut = 'unpaid'
       AND DATE(date_vente) < DATE('now', '-7 days')`,
      async (err, unpaid) => {
        if (err) return;

        for (const payment of unpaid) {
          await this.sendInAppNotification(
            payment.client_id,
            '💰 Paiement en attente',
            `Vous avez un paiement en attente de ${payment.montant_total} FCFA`,
            'warning'
          );
        }
      }
    );
  }

  async sendPressingReminders() {
    const db = require('./database');

    db.all(
      `SELECT * FROM pressing_services 
       WHERE statut = 'pret'
       AND DATE(date_creation) < DATE('now', '-7 days')`,
      async (err, services) => {
        if (err) return;

        for (const service of services) {
          await this.sendInAppNotification(
            service.client_id,
            '👔 Dépôt expiration',
            'Votre dépôt pressing expire dans 7 jours!',
            'warning'
          );
        }
      }
    );
  }

  async sendStockAlerts() {
    const db = require('./database');

    db.all(
      `SELECT * FROM medicaments 
       WHERE quantite_stock <= quantite_min
       AND alert_sent = 0`,
      async (err, lowStock) => {
        if (err) return;

        for (const med of lowStock) {
          // Envoyer à admin
          await this.sendInAppNotification(
            'admin',
            '⚠️ Stock critique',
            `${med.nom} est en rupture ou stock critique!`,
            'alert'
          );

          db.run(
            'UPDATE medicaments SET alert_sent = 1 WHERE id = ?',
            [med.id]
          );
        }
      }
    );
  }

  /**
   * ===== SERVICE WORKER PUSH NOTIFICATIONS =====
   */
  getServiceWorkerCode() {
    return `
// service-worker.js
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (let client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
    `;
  }
}

module.exports = NotificationService;
