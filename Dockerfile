FROM node:20-alpine3.19

# Instalar dependências necessárias para o Puppeteer/Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Definir variáveis de ambiente para o Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Instalar dependências do Node.js
RUN npm ci --only=production && npm cache clean --force

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copiar código da aplicação (excluindo node_modules e outros arquivos via .dockerignore)
COPY --chown=nextjs:nodejs . .

# Mudar para usuário não-root
USER nextjs

# Expor a porta que a aplicação usa
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]