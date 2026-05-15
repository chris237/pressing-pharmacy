FROM node:18-alpine

WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer dépendances
RUN npm ci --only=production

# Copier le code
COPY . .

# Créer répertoires
RUN mkdir -p public/css public/js backups logs

# Exposer port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Démarrer
CMD ["npm", "start"]
