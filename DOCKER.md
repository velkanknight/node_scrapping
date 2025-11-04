# Docker Instructions

## Estrutura do projeto
Os arquivos principais estão agora no diretório raiz:
- `server.js` - Servidor Express
- `scraping-final.js` - Lógica de scraping
- `package.json` - Dependências do projeto
- `Dockerfile` - Configuração da imagem Docker

## Construir a imagem Docker

```bash
docker build -t webscraping-aero .
```

## Executar o container

```bash
docker run -p 3000:3000 webscraping-aero
```

## Usando Docker Compose (Recomendado)

```bash
# Construir e executar
docker-compose up --build

# Executar em background
docker-compose up -d

# Parar os containers
docker-compose down
```

## Teste da API

Após o container estar rodando, você pode testar a API:

```bash
curl -X POST http://localhost:3000/search-flights \
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

## Comandos úteis

```bash
# Ver logs do container
docker-compose logs -f

# Acessar shell do container
docker-compose exec webscraping-aero sh

# Remover imagens não utilizadas
docker system prune -a
```

## Variáveis de ambiente

- `PORT`: Porta que a aplicação irá rodar (padrão: 3000)
- `NODE_ENV`: Ambiente de execução (padrão: production)