# Infraestrutura AWS para WebScraping Aero

Este projeto contém a infraestrutura como código (IaC) usando Terraform para hospedar a aplicação WebScraping Aero na AWS.

## 🏗️ Arquitetura

- **EC2 Instance**: t3.micro (Free Tier eligible)
- **OS**: Amazon Linux 2
- **VPC**: VPC dedicada com subnet pública
- **Security Group**: Portas 22 (SSH), 80 (HTTP), 443 (HTTPS), 3001 (App)
- **Elastic IP**: IP público fixo
- **Docker**: Aplicação containerizada

## 📋 Pré-requisitos

1. **AWS CLI configurado** com credenciais válidas
2. **Terraform** instalado (>= 1.0)
3. **Conta AWS** com acesso ao Free Tier

### Verificar AWS CLI
```bash
aws configure list
aws sts get-caller-identity
```

### Instalar Terraform (Windows)
```powershell
# Via Chocolatey
choco install terraform

# Ou baixar diretamente de: https://terraform.io/downloads
```

## 🚀 Deploy

### 1. Navegue para o diretório terraform
```bash
cd terraform
```

### 2. Inicialize o Terraform
```bash
terraform init
```

### 3. Revisar o plano de execução
```bash
terraform plan
```

### 4. Aplicar a infraestrutura
```bash
terraform apply
```

Digite `yes` quando solicitado.

### 5. Obter informações de acesso
```bash
terraform output
```

## 🔧 Configurações Opcionais

### Criar Key Pair para SSH (Opcional)
```bash
# Criar key pair na AWS
aws ec2 create-key-pair --key-name webscraping-key --query 'KeyMaterial' --output text > webscraping-key.pem

# No Windows PowerShell, use:
aws ec2 create-key-pair --key-name webscraping-key --query 'KeyMaterial' --output text | Out-File -FilePath webscraping-key.pem -Encoding ascii

# Definir permissões (Linux/macOS)
chmod 400 webscraping-key.pem
```

### Deploy com Key Pair
```bash
terraform apply -var="key_pair_name=webscraping-key"
```

### Personalizar configurações
```bash
# Alterar região
terraform apply -var="aws_region=us-west-2"

# Usar t2.micro em vez de t3.micro
terraform apply -var="instance_type=t2.micro"
```

## 📁 Estrutura de Arquivos

```
terraform/
├── main.tf           # Recursos principais (VPC, EC2, Security Groups)
├── variables.tf      # Variáveis de configuração
├── outputs.tf        # Outputs após deploy
├── user_data.sh      # Script de inicialização da EC2
└── README.md         # Esta documentação
```

## 🔍 Monitoramento

### Verificar status da aplicação
```bash
# Obter IP público
terraform output application_url

# Testar aplicação
curl $(terraform output -raw application_url)
```

### Acessar logs da instância
```bash
# SSH (se key pair configurado)
ssh -i webscraping-key.pem ec2-user@$(terraform output -raw instance_public_ip)

# Ver logs do user-data
sudo tail -f /var/log/user-data.log

# Ver logs do Docker
docker-compose logs -f
```

## 🧪 Testando a API

```bash
# Teste básico
curl -X GET "$(terraform output -raw application_url)/"

# Teste do endpoint de busca
curl -X POST "$(terraform output -raw application_url)/search-flights" \
  -H "Content-Type: application/json" \
  -d '{
    "client": "test",
    "number": "123",
    "textMessage": "test message",
    "origin": "GRU",
    "destination": "JFK",
    "departureDate": "15/12/2024"
  }'
```

## 🔄 Atualizações

### Para atualizar o código da aplicação:
1. Faça SSH na instância
2. Navegue para `/home/ec2-user/app`
3. Execute `git pull` para puxar as últimas alterações
4. Execute `./restart-app.sh` para reiniciar com as mudanças

### Para atualizações de infraestrutura:
```bash
terraform plan
terraform apply
```

## 💰 Custos Estimados

**Free Tier (12 meses):**
- EC2 t3.micro: 750 horas/mês (GRÁTIS)
- EBS 20GB: Grátis até 30GB
- Elastic IP: Grátis enquanto associado à instância
- Data Transfer: 1GB/mês grátis

**Após Free Tier (~$10-15/mês):**
- EC2 t3.micro: ~$8.50/mês
- EBS 20GB: ~$2.00/mês
- Elastic IP: $3.65/mês (se não associado)

## 🧹 Limpeza

Para remover toda a infraestrutura:
```bash
terraform destroy
```

⚠️ **ATENÇÃO**: Isso removerá permanentemente todos os recursos criados.

## 🛠️ Solução de Problemas

### Aplicação não responde
```bash
# SSH na instância
ssh -i webscraping-key.pem ec2-user@$(terraform output -raw instance_public_ip)

# Verificar status do Docker
sudo systemctl status docker
docker-compose ps

# Verificar logs
docker-compose logs
sudo tail -f /var/log/user-data.log
```

### Erro de permissões SSH
```bash
# Corrigir permissões da chave (Linux/macOS)
chmod 400 webscraping-key.pem
```

### Terraform state lock
```bash
# Forçar unlock (use com cuidado)
terraform force-unlock <LOCK_ID>
```

## 📝 Próximos Passos

1. **Adicionar HTTPS**: Configure Let's Encrypt ou ALB com certificado SSL
2. **Load Balancer**: Para alta disponibilidade
3. **Auto Scaling**: Para escalabilidade automática
4. **RDS**: Se precisar de banco de dados
5. **CloudWatch**: Para monitoramento avançado
6. **CI/CD**: Pipeline automatizado com GitHub Actions

## 🔒 Segurança

- Security Group configurado com portas mínimas necessárias
- Root volume criptografado
- Usuário não-root no container Docker
- Atualizações automáticas do sistema operacional