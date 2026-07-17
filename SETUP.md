# Installation de RenovIA

RenovIA est un SaaS de gestion de chantiers pour les entreprises de
rénovation TCE, construit avec Next.js 14 (App Router), Supabase
(authentification, base de données, stockage) et Resend (emails
transactionnels).

## 1. Créer un projet Supabase

1. Rendez-vous sur [supabase.com](https://supabase.com) et créez un nouveau
   projet.
2. Dans **Authentication → Providers → Email**, désactivez l'option
   « Confirm email » si vous voulez que les nouveaux comptes soient
   redirigés directement vers le tableau de bord après inscription (sinon
   ils devront confirmer leur email avant de pouvoir se connecter).

## 2. Copier les clés dans `.env.local`

Dupliquez `.env.local.example` en `.env.local` :

```bash
cp .env.local.example .env.local
```

Dans **Project Settings → API**, copiez :

- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` (⚠️ secret, ne jamais exposer côté client) →
  `SUPABASE_SERVICE_ROLE_KEY`

## 3. Exécuter les migrations SQL

Ouvrez **SQL Editor** dans votre projet Supabase et exécutez, **dans
l'ordre**, le contenu des deux fichiers suivants (un fichier = une
exécution) :

1. [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) —
   crée les tables `entreprises`, `chantiers`, `etapes`, `reclamations`,
   `messages`, `photos`, les policies RLS de base et les buckets
   `chantier-photos` / `logos`.
2. [`supabase/migrations/0002_sop.sql`](supabase/migrations/0002_sop.sql) —
   ajoute le SOP réclamations (7 étapes) : numéro de ticket automatique
   (`SAV-YYYY-XXXX`), priorité (P1/P2/P3), note interne, relances, journal
   d'activité (`activites_ticket`), avis clients (`avis`), photos de
   réclamation (`reclamation_photos`), et le bucket `reclamation-photos`.

## 4. Créer un compte Resend

1. Créez un compte sur [resend.com](https://resend.com).
2. Copiez votre clé API dans `RESEND_API_KEY`.
3. Par défaut, les emails partent depuis `onboarding@resend.dev` (adresse de
   test Resend, aucune configuration requise). Pour utiliser votre propre
   domaine, vérifiez-le dans Resend puis renseignez `EMAIL_FROM` dans
   `.env.local` (ex. `RenovIA <contact@votredomaine.fr>`).

## 5. Lancer l'application

```bash
npm install
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

- `/register` : créer un compte entreprise
- `/dashboard` : tableau de bord (protégé, redirige vers `/login` sinon)
- `/dashboard/rapports` : note moyenne des avis, volume de tickets par
  priorité, délai moyen de résolution, taux de contestation, taux de
  réponse aux avis (mois en cours)
- `/chantier/[token]` : lien public à partager avec vos clients (le token
  est généré automatiquement à la création d'un chantier, disponible via le
  bouton « Copier lien client »)
- `/avis/[token]` : formulaire d'avis envoyé automatiquement 24h après
  l'archivage d'une réclamation

## Le SOP réclamations (7 étapes)

Le cycle de vie d'une réclamation :

1. **Réception** — le client soumet une réclamation depuis `/chantier/[token]`
   (canal, sujet, message, jusqu'à 3 photos). Un numéro `SAV-YYYY-XXXX` est
   généré automatiquement (trigger SQL).
2. **Accusé de réception** — email immédiat au client (numéro de ticket,
   délai engagé, ou message spécifique si reçu hors heures ouvrées) + email
   de notification à l'entreprise.
3. **Qualification** — la priorité (P1 urgence / P2 malfaçon ou facturation /
   P3 question) est déduite automatiquement du sujet choisi, et modifiable
   depuis le tableau de bord. Une note interne (jamais visible du client)
   peut être ajoutée.
4. **Transmission** — bannière rouge sur le tableau de bord si un ticket P1
   est ouvert ; bouton « Prendre en charge » qui notifie le client.
5. **Suivi actif** — le bouton **« Vérifier les relances »** du tableau de
   bord (ou un appel à `POST /api/cron/relances`) envoie les relances à 24h /
   48h / 72h sans mise à jour, archive automatiquement les tickets résolus
   après 72h sans contestation, et déclenche les demandes d'avis 24h après
   archivage. Pour l'automatiser en production, configurez un scheduler
   externe (Vercel Cron, cron-job.org...) qui appelle cette route avec le
   header `Authorization: Bearer <CRON_SECRET>` (voir `.env.local.example`).
6. **Résolution** — clôturer un ticket exige une description de
   l'intervention **et** une photo « après intervention » ; le client peut
   contester pendant 72h (le ticket repasse alors en P1).
7. **Avis** — le client reçoit un lien `/avis/[token]` ; une note ≥ 4 propose
   une redirection vers Google Maps, une note ≤ 3 déclenche une alerte
   interne sans redirection.

## Sécurité : comment fonctionne l'accès public par lien ?

Les pages `/chantier/[token]` et `/avis/[token]` n'utilisent jamais la
session de l'entreprise ni les policies RLS classiques : elles résolvent le
token (un UUID non devinable) côté serveur avec la clé `service_role`, puis
limitent toutes les lectures/écritures à l'enregistrement précis résolu.
Aucune route ne permet de lister ou deviner les chantiers ou avis d'une
autre entreprise.

## Ce que le client ne voit jamais

Le mot « RenovIA » n'apparaît ni sur `/chantier/[token]` et `/avis/[token]`,
ni dans aucun email envoyé au client : le nom affiché (page et expéditeur
d'email) est toujours celui de l'entreprise TCE.
