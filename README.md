# Volumetria Platform

## Pré-requisitos

- Node.js >= 18
- Go >= 1.22
- Docker >= 24
- Docker Compose >= 2

## Setup

Copie os arquivos de ambiente:

```bash
cp api/.env.example api/.env
cp web/.env.local.example web/.env.local
cp backoffice/.env.local.example backoffice/.env.local
```

## Subir infraestrutura

```bash
docker-compose up --build
```

## Web (porta 3000)

```bash
cd web
npm install
npm run dev
```

## Backoffice (porta 3001)

```bash
cd backoffice
npm install
npm run dev
```

## Seed admin

```bash
psql postgres://postgres:postgres@localhost:5432/message_calc -f infra/seed.sql
// or cat infra/seed.sql | docker exec -i message_calc_db psql -U postgres -d message_calc
```

- email: `admin@admin.com`
- senha: `admin123`

## Portas

| Serviço    | Porta |
| ---------- | ----- |
| API        | 8080  |
| Web        | 3000  |
| Backoffice | 3001  |
| Postgres   | 5432  |
