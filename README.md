# Sandbox Partenaires — API PEYA PAY

Application **React** (Vite + TypeScript) pour tester les APIs partenaire PEYA PAY : token, envoi/vérification OTP, recherche payeur, paiement partenaire.

## Démarrage

```bash
cd marchand_dart_sandbox
cp .env.example .env
# Éditer .env : VITE_APP_ADMIN_USERNAME, VITE_APP_ADMIN_PASSWORD
npm install
npm run dev
```

Ouvrir http://localhost:5174 (ou le port indiqué).

## Endpoints disponibles

| Endpoint | Description |
|----------|-------------|
| `POST /authclient/token` | Token admin |
| `POST /wClients/code-partenaire` | Envoi code OTP |
| `POST /wClients/verifcode-partenaire` | Vérification code OTP |
| `POST /wClients/recherchePayeur` | Recherche payeur (par téléphone, données en clair) |
| `POST /paiement-partenaire/create` | Création paiement (données en clair) |

- **Base URL** par défaut : configurable dans la barre latérale (et via `VITE_API_BASE_URL` dans `.env`).
- **Recherche payeur** et **Paiement** envoient les données **en clair** (sans chiffrement).

## Interface / Navigation

- **Arrivée sur `/`** : affichage direct de la **documentation API** (logo PEYA PAY + sommaire à gauche). Aucun login requis pour lire la doc.
- Bouton **« Sandbox »** en haut à droite de la doc → redirige vers **`/login`**.
- **Login (`/login`)** : saisie base URL + identifiants admin (depuis `.env`), génération du token. Une fois connecté, accès au **sandbox**.
- **Sandbox** :
  - Barre latérale : base URL, identifiants admin, génération du token, option « Utiliser le token pour tous les endpoints », et liste des endpoints (Token, OTP send/verify, Recherche payeur, Paiement).
  - Zone principale : chaque endpoint s’affiche au clic.
  - **Paiement** : formulaire avec établissement, matricule, compte débit/crédit, montant, login, code banque/agence ; type compte débit (P/S/C) détecté automatiquement pour les numéros à 10 chiffres.

## Documentation API

Documentation détaillée (procédure, format des requêtes/réponses, authentification) : **[docs/API_PEYA_PAY.md](docs/API_PEYA_PAY.md)**.

Exemple de body pour Postman (paiement) : **[docs/postman_paiement_body.json](docs/postman_paiement_body.json)**.

## Stack

- **React 18** + **TypeScript**
- **Vite 5**
- **Tailwind CSS v4** + **shadcn/ui** (New York, thème clair)
- `fetch` natif + helpers dans `src/api/`
