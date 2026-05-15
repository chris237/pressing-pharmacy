#!/bin/bash
# Script de démarrage - Pressing & Pharmacy App

echo "╔════════════════════════════════════════════╗"
echo "║  📱 Pressing & Pharmacy Manager            ║"
echo "║  Installation & Démarrage                  ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé!"
    echo "📥 Téléchargez-le depuis https://nodejs.org"
    exit 1
fi

echo "✅ Node.js détecté: $(node -v)"
echo "✅ npm détecté: $(npm -v)"
echo ""

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Dépendances installées avec succès!"
    else
        echo "❌ Erreur lors de l'installation"
        exit 1
    fi
else
    echo "✅ Dépendances déjà installées"
fi

echo ""
echo "╔════════════════════════════════════════════╗"
echo "║  Démarrage du Serveur...                   ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Vérifier si la base de données existe
if [ ! -f "app.db" ]; then
    echo "📝 Création de la base de données..."
fi

echo "🚀 Serveur démarre sur http://localhost:3000"
echo ""
echo "💡 Raccourcis:"
echo "   - Ouvrir: http://localhost:3000"
echo "   - Arrêter: Ctrl+C"
echo "   - Mode devloppement: npm run dev"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm start
