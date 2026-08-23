# CLAUDE.md — troupakada-player

## Contexte

Ce repo est un fork personnalisé de [beatboxjs/ror-player](https://github.com/beatboxjs/ror-player)
adapté aux besoins de l'association de batucada **Troup'akada d'Échirolles**
(RNA W381030226).

Stack : **TypeScript + Vue 3 + Bootstrap 5 + beatbox.js + Vite**
Déploiement : **application Dockerisée** (nginx en prod, dev-server en développement)

- Compte GitHub : **lezardsemelle**
- Remote upstream : `https://github.com/beatboxjs/ror-player.git`

## Synchronisation upstream

```bash
# Quand le player officiel a des mises à jour
git fetch upstream
git merge upstream/main
# Conflits probables uniquement sur : src/config.ts et src/defaultTunes.ts
git push origin main
```

## Principes de développement

- **Services TypeScript purs** : toute logique métier dans `src/services/` sans
  couplage Vue (portable Angular si besoin futur)
- **Pas de breaking change** sur le format `bbState` du localStorage
- **AGPL-3.0** : conserver la licence et les attributions d'origine
- Pas de `any` TypeScript
- Commits en **français**

---

## Docker — architecture complète

### Dockerfile de production

Le `Dockerfile` existant à la racine utilise Apache httpd. Le remplacer par une
version **nginx** plus légère et standard, avec build multi-stage :

```dockerfile
# Étape 1 : build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Étape 2 : serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf à créer à la racine

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Compression gzip pour les assets
    gzip on;
    gzip_types text/plain text/css application/javascript application/json
               audio/mpeg audio/wav;

    # Cache long pour les assets hashés
    location ~* \.(js|css|png|jpg|mp3|wav|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback — toutes les routes vers index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### docker-compose.yml à créer à la racine

```yaml
version: "3.9"

services:

  # Service de développement (hot reload)
  dev:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "8080:8080"
    command: sh -c "yarn install && npm run dev-server"
    profiles: ["dev"]

  # Service de production (build + nginx)
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:80"
    restart: unless-stopped
    environment:
      - TITLE=Troup'akada Player
      - DESCRIPTION=Player de percussions pour Troup'akada d'Échirolles
    profiles: ["prod"]
```

### Commandes Docker du quotidien

```bash
# Développement avec hot reload
docker compose --profile dev up

# Build et lancer en production
docker compose --profile prod up --build

# Reconstruire après un changement de dépendances
docker compose --profile prod build --no-cache

# Arrêter
docker compose down

# Voir les logs en temps réel
docker compose logs -f app
```

### Variables d'environnement

| Variable      | Défaut                    | Description                    |
|---------------|---------------------------|--------------------------------|
| `TITLE`       | `Troup'akada Player`      | Titre de l'onglet navigateur   |
| `DESCRIPTION` | `Player de percussions…`  | Meta description               |
| `PORT`        | `80`                      | Port exposé (si besoin custom) |

### .dockerignore à vérifier/compléter

```
node_modules
dist
.git
.yarn/cache
*.log
```

---

## Modifications à appliquer — dans l'ordre

### ✅ Prérequis : bugfixes upstream inclus

Ces deux bugs sont corrigés avant toute autre modification :

- **Bug modal** : modal de création qui se ferme au moindre changement de state
  → ref locale isolée du store
- **Bug historique** : création de morceau qui réinitialise bbState au lieu de merger
  → merge dans le state existant

---

### Modification 1 — Renommage et identité

**Fichier** : `index.html`

```html
<title>Troup'akada Player</title>
```

Le champ `appName` dans `src/config.ts` est dérivé de `document.title` automatiquement.
Aucun autre changement nécessaire pour le renommage.

---

### Modification 2 — Système de catégories Troup'akada

**Principe** : les morceaux RoR non joués par Troup'akada restent dans le code mais
sont masqués par défaut. L'utilisateur peut les afficher via le filtre "Tous".

**Fichier** : `src/config.ts`

```typescript
// Ajouter "troupakada" en première position
const categoryKeys = [
  "troupakada",   // ← NOUVEAU — vue par défaut au démarrage
  "common", "uncommon", "new", "proposed", "custom",
  "onesurdo", "easy", "medium", "tricky",
  "western", "cultural-appropriation", "all"
] as const;

// Dans filterCats :
troupakada: () => "Troup'akada",

// Changer le morceau affiché par défaut :
tuneOfTheYear: "Afoxe",  // à confirmer
```

Mettre à jour le type `Category` en conséquence.
Changer le filtre par défaut affiché au démarrage pour `"troupakada"`.

**Fichier** : `src/defaultTunes.ts`

Ajouter `"troupakada"` dans `categories` des morceaux joués par Troup'akada.
Ne rien supprimer — les autres morceaux restent accessibles via le filtre "Tous".

Morceaux à taguer `"troupakada"` (liste à compléter) :
- Afoxe
- Samba Reggae
- Funk
- *(autres à confirmer avec l'utilisatrice)*

---

### Modification 3 — Instruments batucada

**Fichier** : `src/config.ts`

Contrainte : **les identifiants doivent rester exactement 2 caractères**.

| Identifiant | Nom affiché   | Remplace | Sample provisoire         |
|-------------|---------------|----------|---------------------------|
| `lg`        | Surdo grave   | `ls`     | copier les fichiers `ls_` |
| `mg`        | Surdo médium  | `ms`     | copier les fichiers `ms_` |
| `hg`        | Surdo aigu    | `hs`     | copier les fichiers `hs_` |
| `re`        | Repique       | —        | inchangé                  |
| `ca`        | Caixa         | `sn`     | copier les fichiers `sn_` |
| `ta`        | Tamborim      | —        | inchangé                  |
| `ag`        | Agogô         | —        | inchangé                  |
| `ch`        | Chocalho      | `sh`     | copier les fichiers `sh_` |
| `ot`        | Voix / Autres | —        | inchangé                  |

Mettre à jour `instrumentKeys`, `instruments`, `volumePresets` et toutes les
références aux anciens identifiants dans `defaultTunes.ts`.

**Samples audio** : `assets/audio/`
Convention : `${instrumentKey}_${strokeHex}.mp3`

```bash
# En attendant les vrais samples batucada, copier les existants
cp assets/audio/ls_*.mp3 assets/audio/lg_*.mp3  # surdo grave
cp assets/audio/ms_*.mp3 assets/audio/mg_*.mp3  # surdo médium
cp assets/audio/hs_*.mp3 assets/audio/hg_*.mp3  # surdo aigu
cp assets/audio/sn_*.mp3 assets/audio/ca_*.mp3  # caixa
cp assets/audio/sh_*.mp3 assets/audio/ch_*.mp3  # chocalho
```

Les vrais fichiers MP3 batucada seront fournis ultérieurement et remplaceront ces copies.

---

### ✅ Modification 4 — Bouton Pause (déjà présente, vérifié le 2026-08-23)

**Constat** : contrairement à l'hypothèse ci-dessous, `Beatbox.stop(reset?: boolean)` accepte déjà un
paramètre optionnel. `src/ui/play-pause-stop-button.vue` appelle `stop()` sans reset pour le bouton ▶/⏸
(position conservée), un bouton "Stop" séparé appelle `stop()` puis `setPosition(0)` (vrai reset).
Testé en direct dans le lecteur de pattern : pause au temps 4 → reprise exactement au temps 4.
Aucun changement de code nécessaire.

Paragraphe d'origine conservé pour mémoire (son constat de départ était erroné) :

**Contexte** : beatbox.js ne supporte que play/stop. La pause se gère via l'API
Web Audio nativement disponible dans le navigateur.

**Fichier à créer** : `src/services/playerControls.ts`

```typescript
export class PlayerControls {
  private pausePosition = 0
  private startTime = 0

  pause(audioContext: AudioContext): void {
    this.pausePosition = audioContext.currentTime - this.startTime
    audioContext.suspend()
  }

  resume(audioContext: AudioContext): void {
    audioContext.resume()
    this.startTime = audioContext.currentTime - this.pausePosition
  }

  stop(): void {
    this.pausePosition = 0
  }
}
```

**UI** : ajouter le bouton ⏸ entre ▶ et ⏹ dans le composant player.
États visuels distincts : en lecture / en pause / arrêté.

---

### Modification 5 — Favoris

**Fichier à créer** : `src/services/favorites.ts`

```typescript
const STORAGE_KEY = 'troupaFavorites'

export const getFavorites = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export const isFavorite = (tuneId: string): boolean =>
  getFavorites().includes(tuneId)

export const toggleFavorite = (tuneId: string): void => {
  const favs = getFavorites()
  const updated = favs.includes(tuneId)
    ? favs.filter(id => id !== tuneId)
    : [...favs, tuneId]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}
```

**UI** :
- Icône étoile ☆/★ sur chaque morceau dans la liste latérale
- Filtre "Favoris" calculé dynamiquement depuis le localStorage
  (ajouter `"favorites"` aux `categoryKeys` de `config.ts`)

---

### ✅ Modification 6 — Export PDF (fait le 2026-08-23)

**Réalisé** : `src/services/pdfExport.ts` (fonction unique `exportPatternToPdf(state, [tuneName, patternName])`,
réutilisable pour le morceau principal ("Tune") et chaque break — pas besoin de deux fonctions séparées vu que
dans ce fork les breaks sont juste des entrées `Pattern` comme les autres dans `tune.patterns`). Grille dessinée
sur canvas off-screen puis intégrée au PDF via `addImage`, une ligne par instrument réellement utilisé, groupement
visuel par temps (traits verticaux), mnémonique décodé automatiquement depuis les frappes `ot` (déjà mappées vers
des mots via `config.strokes`). Bouton PDF ajouté dans `tune-info.vue` à côté du bouton MP3 existant, sur chaque
ligne de la table "Sons" (donc sur le morceau et sur chaque break). Testé avec un vrai PDF généré et lu (Afoxé).
La section "Gestes de maîstration" du PDF est différée à la Modification 7 (pas encore implémentée).

Spécification d'origine conservée pour mémoire :

**Dépendance à ajouter** :
```bash
yarn add jspdf
```

**Fichier à créer** : `src/services/pdfExport.ts`
Ce service est **pur TypeScript, zéro dépendance Vue**.

Contenu du PDF :
1. En-tête : nom du morceau, tempo BPM, signature rythmique
2. Grille de notes : rendue sur `<canvas>` off-screen → `dataURL` → `jsPDF.addImage()`
   - Une ligne par instrument
   - Chaque case = une frappe
   - Groupement visuel par temps
3. Mnémotechniques : texte sous chaque ligne si le champ `ot` contient des paroles
4. Gestes de maîstration : images ou SVG fallback (voir Modification 7)

```typescript
import jsPDF from 'jspdf'

export const exportTuneToPdf = (tuneName: string, tune: Tune): void => {
  const doc = new jsPDF()

  // En-tête
  doc.setFontSize(18)
  doc.text(tuneName, 20, 20)
  doc.setFontSize(11)
  doc.text(`Tempo : ${tune.speed ?? 100} BPM`, 20, 30)

  // Grille de notes via canvas off-screen
  const canvas = renderNotesGrid(tune)
  doc.addImage(canvas.toDataURL(), 'PNG', 20, 40, 170, 60)

  // Gestes de maîstration
  appendMaestrationSigns(doc, tuneName)

  doc.save(`${tuneName}.pdf`)
}

export const exportBreakToPdf = (
  tuneName: string,
  breakName: string,
  breakData: Break
): void => {
  // Même logique pour un break individuel
}
```

**Déclenchement** : bouton "Exporter PDF" sur la page d'un morceau et sur chaque break.

---

### 🟡 Modification 7 — Gestes de maîstration (base + affichage fait le 2026-08-23, éditeur reporté)

**Réalisé** (décidé avec Amel : base + affichage seul, pas assez de contenu réel pour justifier l'éditeur
Compose ou le panneau pendant lecture) :
- `src/maestrationSigns.ts` : modèle de données (`standardSigns` avec les 3 gestes d'exemple tourne/break/fin
  du plan d'origine, `tunesMaestration` avec Afoxé comme seul exemple — à compléter avec Troup'akada).
- Les photos ne sont **pas** chargées via un chemin runtime `"assets/maestration/x.jpg"` comme suggéré plus bas :
  le build de prod empaquette tout dans un seul fichier HTML (`vite-plugin-singlefile`, voir `vite.config.ts`),
  donc un chemin brut y donnerait un 404 permanent une fois construit. Utilisé `import.meta.glob` à la place
  (même mécanisme que les fichiers i18n et les descriptions de morceaux) pour empaqueter correctement les
  photos une fois ajoutées dans `assets/maestration/`, avec repli automatique sur le SVG si aucune photo n'existe
  pour un geste donné.
- `src/ui/listen/maestration-signs.vue` : section "Gestes" en accordéon Bootstrap, intégrée dans `tune-info.vue`.
  N'affiche rien si le morceau n'a pas d'entrée dans `tunesMaestration`.
- Intégration dans l'export PDF (Modification 6) : ligne "Gestes : ..." ajoutée sous la grille. Testé avec un
  vrai PDF généré (Afoxé → "Gestes : Tourne, Break, Fin").
- ⚠️ Ne pas confondre avec `src/ui/maestration/` : dossier de code AngularJS mort, vestige de l'ancienne version
  du projet avant portage Vue, non référencé nulle part dans le build actuel. Sujet différent (cues de
  conducteur en direct, pas photos de référence).

**Reporté** : interface d'association geste↔morceau dans Composer, et panneau gestes visible pendant la lecture.
Nécessitent d'abord une vraie liste de gestes/associations de la part de Troup'akada. Si l'éditeur Compose est
repris plus tard, il faudra aussi décider où persister les associations utilisateur (`tunesMaestration` est un
tableau statique en code source, pas éditable à l'exécution — probablement un calque localStorage façon favoris
si c'est pensé comme une personnalisation par navigateur, pas partagée).

Spécification d'origine conservée pour mémoire :

**Dossier à créer** : `src/assets/maestration/`
Stocker les images (JPG/PNG/SVG) nommées par identifiant de geste.

**Fichier à créer** : `src/maestrationSigns.ts`

```typescript
export type MaestrationSign = {
  id: string          // ex: "break", "tourne", "fin", "plus-vite"
  label: string
  imageUrl?: string   // "assets/maestration/break.jpg"
  svgFallback: string // SVG inline si imageUrl absent
}

export type TuneMaestration = {
  tuneId: string
  signs: MaestrationSign[]
}

export const standardSigns: MaestrationSign[] = [
  {
    id: "tourne",
    label: "Tourne",
    imageUrl: "assets/maestration/tourne.jpg",
    svgFallback: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor">
      <circle cx="20" cy="20" r="16" stroke-width="2"/>
      <path d="M20 4 A16 16 0 0 1 36 20" stroke-width="2"
        marker-end="url(#arr)"/>
    </svg>`
  },
  {
    id: "break",
    label: "Break",
    imageUrl: "assets/maestration/break.jpg",
    svgFallback: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor">
      <rect x="8" y="10" width="24" height="20" rx="3" stroke-width="2"/>
      <line x1="20" y1="10" x2="20" y2="30" stroke-width="2"/>
    </svg>`
  },
  {
    id: "fin",
    label: "Fin",
    imageUrl: "assets/maestration/fin.jpg",
    svgFallback: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor">
      <line x1="8" y1="20" x2="32" y2="20" stroke-width="3" stroke-linecap="round"/>
      <line x1="30" y1="12" x2="30" y2="28" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  }
  // Compléter selon le répertoire Troup'akada
]

// Association geste ↔ morceau (à compléter)
export const tunesMaestration: TuneMaestration[] = [
  {
    tuneId: "Afoxe",
    signs: ["tourne", "break", "fin"]
      .map(id => standardSigns.find(s => s.id === id)!)
  }
]
```

**Gestion des images manquantes** :
Si `imageUrl` absent ou échec de chargement → afficher `svgFallback`.
Les photos réelles sont ajoutées progressivement dans `assets/maestration/`.

**UI** :
- Section "Gestes" en accordion sur la page de chaque morceau
- Interface d'association signe ↔ morceau dans le mode Compose
- Panneau gestes visible pendant la lecture
- Intégration dans l'export PDF (Modification 6)

---

### ✅ Modification 8 — Affichage des croches (fait le 2026-08-23)

**Réalisé** : `src/ui/pattern-player/pattern-player.vue` avait déjà exactement ce mécanisme pour
`time: 12` et `time: 20` (suppression sélective de `border-right` par index de case, via la classe
dynamique `time-${pattern.time}` déjà posée sur la table). Ajouté un bloc `&.time-8` du même type :
bordure supprimée aux positions relatives 0/2/4/6 dans chaque temps de 8 croches, ce qui fusionne
visuellement chaque paire tout en gardant le séparateur léger par défaut entre les paires (la bordure
forte de fin de temps, elle, n'est pas touchée). Aucun changement de `config.ts` ni de logique JS, comme
prévu. Testé sur "Bomba" → "Break 1" (a du `time: 8`) : le regroupement par paires est visible.

Spécification d'origine conservée pour mémoire :

**Contexte** : `playTime: 120` dans `config.ts` supporte déjà les subdivisions.
Aucun changement moteur ni `config.ts` nécessaire.

**Uniquement dans le composant Vue de la grille de notes** :
- Détecter les breaks avec `time: 8`
- Regrouper visuellement les cases par paires
- Ajouter un séparateur léger entre chaque temps

---

## Marche à suivre globale

```
1. yarn install
2. docker compose --profile dev up      ← développement hot reload
   — OU —
   npm run dev-server                   ← sans Docker
3. http://localhost:8080

4. Appliquer les modifications dans l'ordre — toutes faites le 2026-08-23 :
   a. ✅ Bugfixes upstream (Prérequis) — déjà inclus avant le début de la session
   b. ✅ Renommage (Modif 1)
   c. ✅ Catégories troupakada (Modif 2)
   d. ✅ Instruments + samples (Modif 3)
   e. ✅ Pause (Modif 4) — déjà présente, aucun code ajouté
   f. ✅ Favoris (Modif 5)
   g. ✅ Export PDF (Modif 6)
   h. 🟡 Gestes de maîstration (Modif 7) — base + affichage fait, éditeur Compose et panneau lecture reportés
   i. ✅ Croches affichage (Modif 8)

5. Avant chaque mise en prod :
   docker compose --profile prod up --build
   → vérifier http://localhost:80
```

## Références

- Repo source : https://github.com/beatboxjs/ror-player
- Documentation : https://player-docs.rhythms-of-resistance.org/
- Config technique : https://player-docs.rhythms-of-resistance.org/guide/technical/config.html
- Player live : https://player.rhythms-of-resistance.org
