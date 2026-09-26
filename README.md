# PostPilot 🚀

Plateforme d'automatisation et de publication intelligente sur Facebook, propulsée par Google Gemini & PostgreSQL.

## 📦 Fonctionnalités
- **Génération IA Gemini** : Publications, accroches marketing, formats mèmes et carrousels.
- **Calendrier Éditorial Visuel** : Vues mensuelle et hebdomadaire interactives.
- **Analyseur de Site Web** : Extraction automatique d'audience cible et stratégie de contenu à partir de n'importe quelle URL.
- **Gestion des Pages Facebook** : Gestion multi-pages, statuts et planification.
- **Tableau de Bord Administrateur** : Gestion des utilisateurs, crédits SkyBoost, quotas et modèles de mèmes.
- **Base PostgreSQL** : Drizzle ORM avec support direct de `DATABASE_URL` (Neon, Supabase, Vercel Postgres).

---

## 🛠️ Déploiement sur Vercel

### 1. Variables d'environnement requises sur Vercel
Dans votre projet Vercel (**Settings > Environment Variables**) :

| Variable | Description | Exemple |
|---|---|---|
| `GEMINI_API_KEY` | Clé API Google Gemini (Google AI Studio) | `AIzaSy...` |
| `DATABASE_URL` | Chaîne de connexion PostgreSQL avec SSL | `postgresql://user:pass@ep-xyz.neon.tech/postpilot?sslmode=require` |
| `APP_URL` | URL publique de votre application | `https://mon-projet.vercel.app` |

*(Optionnel)* Si vous préférez séparer les identifiants SQL : `SQL_HOST`, `SQL_USER`, `SQL_PASSWORD`, `SQL_DB_NAME`, `SQL_PORT`.

---

## 🚀 Pousser sur GitHub

1. Initialiser le dépôt Git :
   ```bash
   git init
   git add .
   git commit -m "Initial commit - PostPilot application"
   git branch -M main
   ```
2. Lier votre dépôt GitHub distant :
   ```bash
   git remote add origin https://github.com/<votre-nom-utilisateur>/<nom-du-repo>.git
   git push -u origin main
   ```

---

## 💻 Développement Local

```bash
# Installation des dépendances
npm install

# Lancement en local (serveur Express + Vite)
npm run dev

# Vérification du build
npm run build
npm run lint
```
