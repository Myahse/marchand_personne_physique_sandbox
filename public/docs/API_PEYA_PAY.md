# Documentation API — Plateforme PEYA PAY

**NB : Assurez-vous d'être enregistré en tant que client sur la plateforme Peya Pay avant de poursuivre l'activité marchande.**

---

## I. PROCÉDURE À SUIVRE POUR L'INTERFACAGE

1. Être enregistré en tant que marchand sur la plateforme PEYA PAY.
2. Disposer d'un accès de connexion (login et mot de passe).
3. Réaliser le développement technique nécessaire pour l'interfaçage avec l'API.
4. Effectuer les tests de paiement en environnement de test.
5. Procéder à la validation des tests, incluant le contrôle des opérations de paiement.
6. Passer en mise en production après validation et obtention des accès de production.

---

## II. MODALITÉS PRATIQUES – DESCRIPTION DE LA PROCÉDURE

Toute entreprise souhaitant effectuer l'interfaçage entre son logiciel de facturation et la plateforme PEYA PAY doit s'assurer que son logiciel répond aux critères suivants :

1. Support des requêtes HTTP (RESTful API)
2. Gestion du format de données JSON
3. Support de l'authentification via OAuth 2.0 ou certificat d'authentification
4. Connexion internet stable et sécurisée

---

## III. DESCRIPTION DE L'API

### 1. Format de données

L'API utilise le format JSON aussi bien pour les requêtes que pour les réponses.

Les en-têtes de demande sont définis comme suit :

| Request header | Valeur             | Description                    |
|----------------|--------------------|--------------------------------|
| content-type   | application/json   | La demande contient des données JSON |
| accept         | application/json   | La réponse doit être au format JSON  |

### 2. Authentification

L'authentification s'effectue via un jeton JWT qui doit être inclus dans l'en-tête de chaque requête.

| Request header | Valeur        | Description                          |
|---------------|---------------|--------------------------------------|
| Authorization | Bearer TOKEN   | Valeur du jeton fourni à la connexion |

**Important :** le Token est obligatoire pour toutes les opérations de paiement.

### 3. Méthodes API

L'API est de type RESTful et utilise principalement la méthode **POST**.
Certains endpoints peuvent également être exposés en **GET** selon l'instance.

- **URL test :** `https://test1-pey-peya.djogana-pay.com`
- **URL prod :** Transmise après validation de l'intégration par la DGI.

---

## API #1 : Génération du TOKEN

| Propriété | Valeur |
|------------|--------|
| **Méthode** | POST |
| **Endpoint** | `$url/authclient/token` |

### Paramètres

| Paramètre | Format | Description | Obligatoire |
|-----------|--------|-------------|-------------|
| username  | String | Username communiqué par la DGI | O |
| password  | String | Password communiqué par la DGI | O |

### Body

```json
{
  "username": "zImgfteNm2tVQiJDnJhb+w==",
  "password": "wWFMgdAJEi+HT0h8olL11w=="
}
```

### Réponse (exemple – code 800 : Succès)

**Headers :** `Content-Type: application/json`

```json
{
  "status": {
    "code": "800",
    "message": "Operation effectuee avec succes: Authentification réussie"
  },
  "hasError": false,
  "item": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
    "userId": "0103244851",
    "username": "admin",
    "codeAgence": "11111",
    "codePays": "CI",
    "codeBanque": "DPAY",
    "telephone": "0103244851",
    "codeCaisse": "",
    "premiereConnexion": true,
    "roles": ["admin authentification client"],
    "changePassword": false,
    "unlock": true,
    "changementDevice": false
  }
}
```

**NB :** le token se trouve dans le membre `item.token` et sera utilisé lors du paiement.

---

## API #2 : Recherche du client (recherche payeur)

| Propriété | Valeur |
|------------|--------|
| **Méthode** | POST |
| **Endpoint** | `$url/wClients/recherchePayeur` |

### Paramètres

| Paramètre         | Format | Description                        | Obligatoire |
|-------------------|--------|------------------------------------|-------------|
| gsmPrincipale     | String | Le numéro de téléphone du client   | O           |
| codePaysResidence | String | Valeur fixe : CI                   | O           |

### Body

```json
{
  "data": {
    "gsmPrincipale": "",
    "codePaysResidence": "CI"
  }
}
```

### Réponse (exemple)

```json
{
  "status": {
    "code": "800",
    "message": "Operation effectuee avec succes: "
  },
  "hasError": false,
  "count": 2,
  "items": [
    {
      "changerTelephone": false,
      "codeClient": "0103244851",
      "codePaysResidence": "CI",
      "datasCompte": [
        {
          "dateouverture": "2025-07-22T18:50:45.000+00:00",
          "soldedispo": 299500,
          "soldecompta": 155900,
          "soldeautorisation": 0,
          "codeBanque": "DPAY",
          "codeAgence": "11111",
          "nomDuCompte": "DOSSO VADJIGUIBA",
          "numerocomptecomplet": "0103244851",
          "ngc": "251200",
          "codePack": "PV00000010",
          "creditAut": "O",
          "debitAut": "O"
        }
      ],
      "gsmPrincipale": "5JWbiDL+jOIcJSM0Bks94Q==",
      "wtypeClient": { ... }
    }
  ]
}
```

---

## API #3 : Envoi code OTP (cas où le client saisit son numéro de téléphone)

| Propriété | Valeur |
|------------|--------|
| **Méthode** | POST |
| **Endpoint** | `$url/wClients/code-partenaire` |

### Body

```json
{
  "data": {}
}
```

*(Détails des champs à transmettre selon la doc partenaire.)*

---

## API #4 : Validation code OTP

| Propriété | Valeur |
|------------|--------|
| **Méthode** | POST |
| **Endpoint** | `$url/wClients/verifcode-partenaire` |

### Paramètres

| Paramètre     | Format | Description                          | Obligatoire |
|---------------|--------|--------------------------------------|-------------|
| codeValid     | String | Le code OTP à 4 chiffres reçu via SMS | O          |
| login         | String | Le numéro de téléphone du client      | O          |

### Body

```json
{
  "data": {
    "codeValid": "otp_4_chiffres",
    "login": "téléphone_10_chiffres"
  }
}
```

### Réponse

```json
{
  "hasError": false,
  "data": {
    "codeValid": "...",
    "login": "..."
  }
}
```

---

## API #5 : Envoi code OTP (données appareil)

| Propriété | Valeur |
|------------|--------|
| **Méthode** | POST |
| **Endpoint** | `$url/wClients/code-partenaire` (cas où le client saisit son numéro) |

### Paramètres

| Paramètre     | Format | Description                                      | Obligatoire |
|---------------|--------|--------------------------------------------------|-------------|
| gsmPrincipale | String | Le numéro de téléphone du client (10 chiffres)   | O           |
| modele        | String | Le modèle de téléphone du client (ex : SM-G…)    | O           |
| imei          | String | IMEI de l'appareil (ex : SM-G…)                  | O           |
| plateform     | String | Système d'exploitation (ex : ios, android)        | O           |

### Body

```json
{
  "data": {
    "gsmPrincipale": "téléphone_10_chiffres",
    "modele": "model_appareil",
    "imei": "imei",
    "plateform": "android"
  }
}
```

---

## API #6 : Paiement

| Propriété | Valeur |
|------------|--------|
| **Méthode** | POST |
| **Endpoint** | `$url/paiement-partenaire/create` |

### Paramètres

| Paramètre    | Format  | Description                                                       | Obligatoire |
|--------------|---------|-------------------------------------------------------------------|-------------|
| compteDebit  | String  | Compte du client obtenu dans API#2                                | O           |
| compteCredit | String  | Compte marchand obtenu dans API#1 (compte activité)              | O           |
| montant      | Integer | Montant de l'opération                                            | O           |
| login        | String  | Username de la fonction d'authentification                       | O           |
| codeBanque   | String  | Valeur fixe : DPAY                                                | O           |
| codeAgence   | String  | Valeur fixe : 11111                                               | O           |
| infos        | Array   | Tableau contenant au moins un élément avec le montant de l'opération | O        |

### Structure de `infos`

Chaque élément du tableau peut contenir : `nom`, `label`, `type`, `ordre`, `obligatoire`, `montantMin`, `valeur`, `typeselection`. Au moins un élément doit porter le montant de l'opération. Exemple d'éléments possibles :

```json
[
  { "nom": "nom_etablissement", "label": "Nom Etablissement", "type": "select", "ordre": 1, "obligatoire": true, "montantMin": null, "valeur": null, "typeselection": ["Ecole 1", "Ecole 2", "Ecole 3"] },
  { "nom": "num_matricule", "label": "Numéro Matricule", "type": "String", "ordre": 2, "obligatoire": true, "montantMin": null, "valeur": null, "typeselection": null },
  { "nom": "montant", "label": "Montant", "type": "Number", "ordre": 3, "obligatoire": true, "montantMin": null, "valeur": "1000", "typeselection": null }
]
```

### Body (exemple minimal)

```json
{
  "data": {
    "compteDebit": "",
    "compteCredit": "",
    "montant": "1000",
    "login": "",
    "codeBanque": "DPAY",
    "codeAgence": "11111",
    "infos": [
      {
        "nom": "montant",
        "label": "Montant",
        "type": "Number",
        "ordre": 1,
        "obligatoire": true,
        "montantMin": null,
        "valeur": "1000",
        "typeselection": null
      }
    ]
  }
}
```

---

## API #7 : Mouvements de compte (MVM comptes)

Permet de consulter les mouvements d'un compte sur une période (avec pagination).

| Propriété | Valeur |
|------------|--------|
| **Méthode** | POST* |
| **Endpoint** | `$url/vMvtopMvtc/mvtsComptes-partenaire` |

### Paramètres (GET)

| Paramètre | Format | Description | Obligatoire |
|----------|--------|-------------|-------------|
| index | Integer | Page (commence à 1) | O |
| size | Integer | Taille de page | O |
| numerocomptecomplet | String | Numéro de compte complet | O |
| operator | String | Opérateur d'intervalle : `[]` | O |
| start | String | Date début au format `DD/MM/YYYY` | O |
| end | String | Date fin au format `DD/MM/YYYY` | O |

### Exemple (GET)

`$url/vMvtopMvtc/mvtsComptes-partenaire?index=1&size=20&numerocomptecomplet=0103244851&operator=%5B%5D&start=01%2F01%2F2026&end=31%2F01%2F2026`

### Body (POST — format utilisé par ce sandbox)
.

```json
{
  "index": 1,
  "size": 20,
  "data": {
    "numerocomptecomplet": "0103244851",
    "dateOperationParam": {
      "operator": "[]",
      "start": "01/01/2026",
      "end": "31/01/2026"
    }
  }
}
```

### Réponse (structure)

La réponse est au format JSON et peut contenir :

- `hasError` : boolean
- `status` : objet avec `code` et `message`
- `count` : nombre total d'éléments
- `items` : liste des mouvements (structure selon l'instance)

---

## API #8 : Virement fournisseur (paiement fournisseur)

Permet d'effectuer un paiement vers un compte fournisseur (virement).

| Propriété | Valeur |
|------------|--------|
| **Méthode** | POST |
| **Endpoint** | `$url/wVirement/create` |
| **URL test (complète)** | `https://test1-pey-peya.djogana-pay.com/wVirement/create` |

### Paramètres

| Paramètre | Format | Description | Obligatoire |
|----------|--------|-------------|-------------|
| compteDebit | String | Compte à débiter (client) | O |
| compteCredit | String | Compte à créditer (fournisseur) | O |
| login | String | Login / identifiant initiateur | O |
| montant | String / Integer | Montant du virement | O |
| motif | String | Motif / libellé (ex : `test`) | N |

### Body (exemple)

```json
{
  "data": {
    "compteDebit": "0748513076",
    "compteCredit": "DPAY111118547161738802108426852",
    "login": "0748513076",
    "montant": "1000",
    "motif": "test"
  }
}
```

### Réponse (structure)

La réponse est au format JSON et peut contenir :

- `hasError` : boolean
- `status` : objet avec `code` et `message`
- `item` / `data` : détails de l'opération (selon l'instance)

---

## Référence rapide des endpoints (sandbox)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/authclient/token` | Génération du token |
| POST | `/wClients/recherchePayeur` | Recherche client (recherche payeur) |
| POST | `/wClients/code-partenaire` | Envoi code OTP partenaire |
| POST | `/wClients/verifcode-partenaire` | Validation code OTP partenaire |
| POST | `/paiement-partenaire/create` | Création paiement partenaire |
| POST | `/vMvtopMvtc/mvtsComptes-partenaire` | Mouvements de compte *(MVM comptes)* |
| POST | `/wVirement/create` | Virement fournisseur *(paiement fournisseur)* |
| POST | `/wUtilisateur/rechercheAllPdv` | Liste des points de vente (PDV) — Agents *(longitude/latitude)* |
| POST | `/wClients/soldePartenaire` | Solde partenaire *(balance)* |

---

## API #9 : Recherche de tous les points de vente (PDV) — Agents

Permet de récupérer la liste des points de vente (PDV) / agents.  
**Authentification requise** : `Authorization: Bearer TOKEN`.

| Propriété | Valeur |
|------------|--------|
| **Méthode** | POST |
| **Endpoint** | `$url/wUtilisateur/rechercheAllPdv` |

### Body (attendu)

```json
{
  "data": {}
}
```

### Réponse (structure)

La réponse peut contenir selon l’instance :

- `hasError` : boolean
- `status` : objet avec `code` et `message`
- `count` : nombre d’éléments
- `items` ou `item` : données retournées *(selon l’instance backend)*

---

## API #10 : Solde partenaire (balance)

Permet de récupérer le solde d’un compte (balance) côté partenaire.
**Authentification requise** : `Authorization: Bearer TOKEN`.

| Propriété | Valeur |
|------------|--------|
| **Méthode** | POST |
| **Endpoint** | `$url/wClients/soldePartenaire` |

### Paramètres (dans `data`)

| Paramètre | Description |
|----------|-------------|
| `compte` | Numéro de compte / téléphone dont on veut le solde |
| `gsmPrincipale` | Login partenaire (GSM principale) |

### Body (attendu)

```json
{
  "data": {
    "compte": "0102030405",
    "gsmPrincipale": "0102030405"
  }
}
```

### Réponse (exemple)

```json
{
  "status": { "code": "800", "message": "Operation effectuee avec succes: " },
  "hasError": false,
  "item": {
    "soldedispo": 299500,
    "soldecompta": 155900,
    "soldeautorisation": 0
  }
}
```

**Documentation API PEYA PAY — Sandbox Partenaires**

| | |
|---|---|
| **Environnement test** | `https://test1-pey-peya.djogana-pay.com` |
| **Support / intégration** | Contacter la DGI pour les accès et la mise en production. |
| **Dernière mise à jour** | Documentation technique des APIs partenaire. |

*© PEYA PAY — Plateforme de paiement. Usage réservé aux partenaires autorisés.*
