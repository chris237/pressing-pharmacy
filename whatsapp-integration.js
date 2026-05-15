// whatsapp-integration.js - WhatsApp complète (Web + Mobile + Notifications)

const twilio = require('twilio');
const { v4: uuidv4 } = require('uuid');
const db = require('./database');

class WhatsAppIntegration {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    
    if (this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
    }
  }

  /**
   * ENVOYER MESSAGE WHATSAPP
   */
  async sendMessage(toNumber, message, mediaUrl = null) {
    if (!this.client) {
      console.log('⚠️ Twilio non configuré. Mode démo.');
      return { success: false, demo: true };
    }

    try {
      const messageData = {
        from: `whatsapp:${this.whatsappNumber}`,
        to: `whatsapp:${toNumber}`
      };

      if (mediaUrl) {
        messageData.mediaUrl = [mediaUrl];
      } else {
        messageData.body = message;
      }

      const result = await this.client.messages.create(messageData);

      // Enregistrer dans DB
      this.logMessage(toNumber, message, 'sent', result.sid);

      console.log('✅ WhatsApp envoyé:', result.sid);
      return {
        success: true,
        messageId: result.sid,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Erreur WhatsApp:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * MODÈLES DE MESSAGES PRÉDÉFINIS
   */
  getMessageTemplate(templateName, data = {}) {
    const templates = {
      pressing_collecte: `
👔 Pressing - Confirmation de collecte

Bonjour ${data.clientName},

Vos vêtements ont été collectés avec succès!

📋 Détails:
• Nombre articles: ${data.nombreArticles}
• Montant: ${data.montant} FCFA
• Date collecte: ${data.dateCollecte}
• Référence: ${data.reference}

📍 Livraison estimée: ${data.dateLivraison}

Merci pour votre confiance! 🙏
      `.trim(),

      pressing_pret: `
👔 Pressing - Vos vêtements sont prêts!

Bonjour ${data.clientName},

Vos vêtements sont prêts à être retirés! ✅

📋 Détails:
• Nombre articles: ${data.nombreArticles}
• Montant: ${data.montant} FCFA
• Référence: ${data.reference}

⏰ Horaires: Lun-Sam 8h-18h

Merci! 🙏
      `.trim(),

      pressing_livre: `
👔 Pressing - Livré avec succès!

Bonjour ${data.clientName},

Vos vêtements ont été livrés! 🚚

📋 Détails:
• Date livraison: ${data.dateLivraison}
• Référence: ${data.reference}
• Montant: ${data.montant} FCFA

Merci pour votre confiance! 🙏
      `.trim(),

      pharmacy_confirmation: `
💊 Pharmacy - Commande reçue

Bonjour ${data.clientName},

Votre commande a été reçue! ✅

📋 Articles:
${data.articles.map(a => `• ${a.nom} x${a.quantite}`).join('\n')}

💰 Total: ${data.montant} FCFA
📅 Date: ${data.date}

Votre commande est en préparation.

Merci! 🙏
      `.trim(),

      pharmacy_pret: `
💊 Pharmacy - Commande prête!

Bonjour ${data.clientName},

Votre commande est prête! ✅

📋 Référence: ${data.reference}
💰 Montant: ${data.montant} FCFA

⏰ Horaires: Lun-Dim 8h-20h

Merci! 🙏
      `.trim(),

      infirmier_confirmation: `
🩺 Services Infirmiers - RDV confirmé

Bonjour ${data.clientName},

Votre rendez-vous est confirmé! ✅

📋 Détails:
• Type: ${data.typeService}
• Date: ${data.date}
• Heure: ${data.heure}
• Lieu: ${data.lieu}
• Montant: ${data.montant} FCFA

📞 Pour modification: ${data.phone}

À bientôt! 🙏
      `.trim(),

      rappel_rdv: `
🩺 Rappel - Votre rendez-vous demain

Bonjour ${data.clientName},

Rappel de votre rendez-vous demain! ⏰

📋 Détails:
• Heure: ${data.heure}
• Infirmière: ${data.infirmiere}

Confirmez votre présence s'il vous plaît.

Merci! 🙏
      `.trim(),

      rappel_depot: `
👔 Rappel - Votre dépôt expire dans 7 jours

Bonjour ${data.clientName},

Votre dépôt pressing expire dans 7 jours!

📋 Détails:
• Référence: ${data.reference}
• Date dépôt: ${data.dateDepot}
• Montant: ${data.montant} FCFA

Veuillez retirer rapidement.

Merci! 🙏
      `.trim()
    };

    return templates[templateName] || null;
  }

  /**
   * ENVOYER AVEC MODÈLE
   */
  async sendTemplateMessage(toNumber, templateName, data) {
    const message = this.getMessageTemplate(templateName, data);
    if (!message) {
      throw new Error(`Template "${templateName}" not found`);
    }
    return this.sendMessage(toNumber, message);
  }

  /**
   * WEBHOOK POUR RECEVOIR MESSAGES (WhatsApp → Vous)
   */
  handleIncomingMessage(req, res) {
    const { From, Body, NumMedia } = req.body;
    const fromNumber = From.replace('whatsapp:', '');

    console.log(`📨 Message reçu de ${fromNumber}: ${Body}`);

    // Enregistrer en DB
    this.logMessage(fromNumber, Body, 'received');

    // Répondre automatiquement
    this.sendAutoReply(fromNumber);

    res.json({ success: true });
  }

  /**
   * RÉPONSE AUTOMATIQUE
   */
  async sendAutoReply(toNumber) {
    const message = `
Merci pour votre message! 👋

Nous avons reçu votre message et y répondrons dès que possible.

Horaires: Lun-Dim 8h-20h

Merci! 🙏
    `.trim();

    await this.sendMessage(toNumber, message);
  }

  /**
   * ENREGISTRER MESSAGE EN DB
   */
  logMessage(phone, message, status, messageId = null) {
    const id = uuidv4();
    db.run(
      `INSERT INTO whatsapp_messages (id, phone, message, status, message_id, timestamp)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [id, phone, message, status, messageId],
      (err) => {
        if (err) console.error('Erreur DB:', err);
      }
    );
  }

  /**
   * OBTENIR HISTORIQUE CONVERSATIONS
   */
  getConversationHistory(phone) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM whatsapp_messages 
         WHERE phone = ? 
         ORDER BY timestamp DESC 
         LIMIT 50`,
        [phone],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * NOTIFICATIONS AUTOMATIQUES
   */
  async sendAutomaticNotification(clientId, type, data) {
    // Récupérer le client
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT whatsapp FROM clients WHERE id = ?`,
        [clientId],
        async (err, client) => {
          if (err || !client) {
            return reject(err || new Error('Client not found'));
          }

          try {
            const result = await this.sendTemplateMessage(
              client.whatsapp,
              type,
              data
            );
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * ENVOYER À PLUSIEURS (BROADCAST)
   */
  async broadcastMessage(template, dataList) {
    const results = [];

    for (const data of dataList) {
      try {
        const result = await this.sendTemplateMessage(
          data.phone,
          template,
          data
        );
        results.push({ phone: data.phone, success: result.success });
      } catch (error) {
        results.push({ phone: data.phone, success: false, error: error.message });
      }

      // Délai pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  /**
   * GÉNÉRER QR CODE WHATSAPP
   */
  generateWhatsAppQR(phone) {
    const message = 'Bonjour! Je souhaite en savoir plus sur vos services.';
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    return url;
  }

  /**
   * LIEN WHATSAPP DIRECT
   */
  generateWhatsAppLink(phone, message = 'Bonjour!') {
    return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  }
}

module.exports = WhatsAppIntegration;
