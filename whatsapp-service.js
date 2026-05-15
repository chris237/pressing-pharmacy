// whatsapp-service.js - Service d'intégration WhatsApp (Optional)
// À utiliser si vous avez un compte Twilio

const twilio = require('twilio');

class WhatsAppService {
  constructor(accountSid, authToken, whatsappNumber) {
    this.client = twilio(accountSid, authToken);
    this.whatsappNumber = whatsappNumber;
  }

  // Envoyer un message WhatsApp
  async sendMessage(toNumber, message) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: `whatsapp:${this.whatsappNumber}`,
        to: `whatsapp:${toNumber}`
      });
      
      console.log('✅ Message WhatsApp envoyé:', result.sid);
      return {
        success: true,
        messageId: result.sid,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ Erreur envoi WhatsApp:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Générer un reçu automatique
  async sendReceipt(toNumber, serviceDetails) {
    const message = this._formatReceipt(serviceDetails);
    return this.sendMessage(toNumber, message);
  }

  // Format du reçu
  _formatReceipt(details) {
    const { serviceName, amount, reference, date, items } = details;
    
    let receipt = `
🧾 *REÇU DE SERVICE*

${serviceName}
━━━━━━━━━━━━━━━━━━━━
📋 Détails:
${items.map(item => `• ${item.name}: ${item.amount} FCFA`).join('\n')}

💰 *Total: ${amount} FCFA*
📅 Date: ${date}
🔖 Ref: ${reference}

Merci pour votre confiance! 🙏
`;
    
    return receipt.trim();
  }

  // Notification de statut
  async notifyStatusChange(toNumber, serviceType, newStatus, reference) {
    const statusMessages = {
      'collecte': '👔 Vos vêtements ont été collectés',
      'lavage': '🧼 Lavage en cours...',
      'pret': '✅ Vos vêtements sont prêts!',
      'livre': '🚚 Livré avec succès!',
      'en_vente': '💊 Médicament préparé',
      'programmé': '🩺 Votre rendez-vous est confirmé'
    };

    const message = `
${statusMessages[newStatus] || 'Mise à jour'}

Réf: ${reference}
Service: ${serviceType}

Pour plus d'infos, contactez-nous! 📞
    `;

    return this.sendMessage(toNumber, message.trim());
  }
}

module.exports = WhatsAppService;

// ===== UTILISATION DANS SERVER.JS =====
/*
const WhatsAppService = require('./whatsapp-service');

// Initialiser le service (avec vos identifiants Twilio)
const whatsappService = new WhatsAppService(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
  process.env.TWILIO_WHATSAPP_NUMBER
);

// Intégrer dans les routes
app.post('/api/pressing', async (req, res) => {
  // ... code existant ...
  
  // Envoyer notification WhatsApp
  if (req.body.notify) {
    const client = await getClient(client_id);
    await whatsappService.notifyStatusChange(
      client.whatsapp,
      'Pressing - ' + type_service,
      'collecte',
      service_id
    );
  }
});

// Webhook pour les réponses WhatsApp
app.post('/api/whatsapp/webhook', (req, res) => {
  const message = req.body.Body;
  const from = req.body.From;
  
  console.log(`Message reçu de ${from}: ${message}`);
  
  // Traiter les réponses
  res.send('OK');
});
*/
