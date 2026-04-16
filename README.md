# SocialDeck

Application web de publication multi-plateformes construite avec:

- Next.js (frontend + API backend)
- MySQL (Prisma ORM)
- Redis + BullMQ (queue de publication et planification)
- Docker (web + worker + mysql + redis)

## Fonctionnalites implementees

- Authentification utilisateur securisee (inscription, connexion, session cookie HTTP-only, deconnexion)
- Gestion du profil utilisateur
- Connexion OAuth2 des comptes sociaux depuis les parametres:
	- LinkedIn
	- Instagram
	- Facebook
	- Threads
	- Pinterest
	- YouTube
	- Google Business
- Upload media image/video
- Creation de publication avec:
	- titre
	- description
	- personnalisation par plateforme
	- publication immediate
	- publication planifiee
- Historique des publications
- Statuts de publication (success / failed)
- Tableau de bord avec metriques

## Architecture

- `src/app`:
	- pages UI (landing, login, register, dashboard, settings)
	- route handlers API (`src/app/api/**`)
- `src/lib`:
	- auth, Prisma client, validateurs, OAuth2, queue, publication adapters
- `src/components/ui`:
	- micro-composants reutilisables (`Button`, `ButtonLink`, `Input`, `Textarea`, `Label`, `Card`, `Text`, `Checkbox`)
- `src/worker/publisher.ts`:
	- worker BullMQ qui execute les publications immediates ou planifiees
- `prisma/schema.prisma`:
	- modele de donnees MySQL

## Prerequis

- Node.js 20+
- npm
- Docker + Docker Compose

## Variables d'environnement

Copier le fichier exemple puis adapter les secrets:

```bash
cp .env.example .env
```

Variables principales:

- `DATABASE_URL`
- `REDIS_URL`
- `AUTH_SECRET`
- `APP_URL`
- `UPLOAD_DIR`

## Lancer avec Docker (recommande)

```bash
npm run docker:up
```

Puis, dans un nouveau terminal:

```bash
npm run db:push
npm run prisma:generate
npm run prisma db seed
```

Application: `http://localhost:3000`

Pour stopper:

```bash
npm run docker:down
```

## Lancer en local (sans Docker web/worker)

Prerequis: MySQL et Redis actifs localement.

```bash
npm install
npm run prisma:generate
npm run db:push
npm run dev
```

Dans un autre terminal:

```bash
npm run worker
```

## Scripts utiles

- `npm run dev` : frontend + API Next.js
- `npm run worker` : worker BullMQ
- `npm run build` : build production
- `npm run lint` : lint
- `npm run db:push` : synchroniser schema Prisma vers MySQL
- `npm run db:migrate` : migration Prisma en dev
- `npm run db:studio` : Prisma Studio
- `npm run docker:up` : demarrer stack Docker
- `npm run docker:down` : arreter stack Docker

## OAuth2 et APIs officielles

Les flux OAuth2 sont implements via les endpoints officiels des plateformes.

Pour la publication, la structure est en place et extensible par plateforme (`src/lib/publishers.ts`).

## Compte seed initial

Le seed cree un compte:

- Email: `demo@socialdeck.app`
- Mot de passe: `DemoPass123!`

Tu peux aussi creer ton propre compte via l'interface.
