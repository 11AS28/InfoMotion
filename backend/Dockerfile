# 1. Luăm o imagine oficială de Node.js (un Linux mini)
FROM node:18-slim

# 2. Rulăm comenzi de terminal ca să instalăm g++, build-essential ȘI time
RUN apt-get update && \
    apt-get install -y g++ build-essential time && \
    rm -rf /var/lib/apt/lists/*

# 3. Creăm folderul aplicației în serverul din cloud
WORKDIR /app

# 4. Copiem listele de dependențe și le instalăm
COPY package*.json ./
RUN npm install

# 5. Copiem tot codul tău din backend în cloud
COPY . .

# 6. Spunem pe ce port ascultă serverul tău
EXPOSE 5000

# 7. Comanda care pornește efectiv serverul tău Node
CMD ["node", "server.js"]