#!/bin/bash

# Log de início
echo "$(date): Iniciando configuração do WebScraping Aero" >> /var/log/user-data.log

# Atualizar sistema
yum update -y

# Instalar Docker
yum install -y docker
systemctl start docker
systemctl enable docker

# Adicionar usuário ec2-user ao grupo docker
usermod -a -G docker ec2-user

# Instalar Docker Compose v2 (versão mais recente com Buildx 0.17+)
curl -L "https://github.com/docker/compose/releases/download/v2.29.7/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Criar link simbólico para compatibilidade
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Instalar Docker Buildx mais recente (0.17+)
curl -L "https://github.com/docker/buildx/releases/download/v0.17.1/buildx-v0.17.1.linux-amd64" -o /tmp/docker-buildx
mkdir -p /home/ec2-user/.docker/cli-plugins
mv /tmp/docker-buildx /home/ec2-user/.docker/cli-plugins/docker-buildx
chmod +x /home/ec2-user/.docker/cli-plugins/docker-buildx
chown -R ec2-user:ec2-user /home/ec2-user/.docker

# Instalar Git
yum install -y git

# Criar diretório para a aplicação
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

# Clonar o repositório
echo "$(date): Clonando repositório do GitHub" >> /var/log/user-data.log
git clone https://github.com/velkanknight/node_scrapping.git .

# Verificar se o clone foi bem-sucedido
if [ ! -f "package.json" ]; then
    echo "$(date): ERRO - Falha ao clonar o repositório. Deploy abortado." >> /var/log/user-data.log
    echo "ERRO: Não foi possível clonar o repositório GitHub." >> /var/log/user-data.log
    echo "Verifique se o repositório existe e está público." >> /var/log/user-data.log
    exit 1
fi

echo "$(date): Repositório clonado com sucesso" >> /var/log/user-data.log

# Alterar propriedade dos arquivos
chown -R ec2-user:ec2-user /home/ec2-user/app

# Aguardar um pouco para garantir que o Docker está totalmente inicializado
sleep 30

# Construir e iniciar a aplicação como usuário ec2-user
cd /home/ec2-user/app
echo "$(date): Iniciando build da aplicação" >> /var/log/user-data.log

# Executar docker-compose como ec2-user
sudo -u ec2-user docker-compose up --build -d

# Verificar se os containers estão rodando
sleep 60
echo "$(date): Status dos containers:" >> /var/log/user-data.log
sudo -u ec2-user docker-compose ps >> /var/log/user-data.log

# Configurar log rotation para os logs do Docker
cat > /etc/logrotate.d/docker << 'EOFLOG'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size 10M
    missingok
    notifempty
    create 0644 root root
}
EOFLOG

# Criar script para restart da aplicação
cat > /home/ec2-user/restart-app.sh << 'EOFRESTART'
#!/bin/bash
cd /home/ec2-user/app
docker-compose down
docker-compose up --build -d
echo "$(date): Aplicação reiniciada" >> /var/log/user-data.log
EOFRESTART

chmod +x /home/ec2-user/restart-app.sh
chown ec2-user:ec2-user /home/ec2-user/restart-app.sh

# Log de finalização
echo "$(date): WebScraping Aero deployment completed" >> /var/log/user-data.log
echo "$(date): Aplicação disponível na porta 3001" >> /var/log/user-data.log