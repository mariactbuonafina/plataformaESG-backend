# ESG Platform

![Node.js](https://img.shields.io/badge/Node.js-v18.x-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![React](https://img.shields.io/badge/React-18-blueviolet)
![Docker](https://img.shields.io/badge/Docker-20.10-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

---

## Descrição do Projeto
A **ESG Platform** permite que empresas:
- Respondam questionários de maturidade ESG.
- Anexem evidências (documentos, políticas internas).
- Recebam selo de certificação ESG (Bronze, Prata ou Ouro) baseado na pontuação obtida.

O projeto simula um ambiente real de desenvolvimento, com:
- Fluxo de Git/GitHub (branches, PRs, issues)  
- Gestão de projeto via Trello  
- Containerização via Docker

---

## Funcionalidades
- Questionários de maturidade ESG.  
- Upload de evidências (documentos, práticas, políticas).  
- Cálculo de selo ESG automático (Bronze, Prata, Ouro).  
- API REST com Node.js + Express.  
- Frontend interativo com React.  
- Banco PostgreSQL.  
- Docker para padronização de ambiente.

---

## Tecnologias Utilizadas
- **Frontend:** React 18  
- **Backend:** Node.js 18 + Express 4.x  
- **Banco de Dados:** PostgreSQL 15  
- **Containerização:** Docker + Docker Compose  
- **Controle de versão:** GitHub  

---

## Estrutura do Projeto
plataformaESG/
├─ backend/ # API Node.js
│ ├─ src/
│ │ ├─ index.js
│ │ └─ db.js
│ ├─ package.json
│ └─ Dockerfile
├─ frontend/ # React
│ ├─ src/
│ └─ Dockerfile
├─ db/
│ └─ init/ # scripts SQL iniciais
├─ docker-compose.yml
└─ .env.example

---

## Pré-requisitos
- Node.js 18 ou superior  
- npm 9 ou superior  
- Docker 20.10+  
- PostgreSQL 15 (opcional se usar Docker)  
- Editor de código: VSCode recomendado
