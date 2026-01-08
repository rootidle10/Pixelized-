# Dockerfile pour frontend
FROM node:20

# Crée le dossier de travail
WORKDIR /app

# Copie package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances (vite compris)
RUN npm install

# Copie le reste du code
COPY . .

# Expose le port
EXPOSE 3000

# Commande pour lancer le dev server
CMD ["npm", "run", "dev"]
