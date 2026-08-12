# SibilliniEuropa

Widget standalone per sibillinieuropa.eu (galleria foto, sezione partner dinamica + calendario settimanale).

## Stack

- Astro per sviluppo locale e pagina demo
- Vite per il bundle finale del widget
- Sharp per l'ottimizzazione immagini
- GLightbox per il lightbox

## Struttura

```text
content/
  galleries/
    Sess25/
  partners/
    allPartners.json
    institutional.json
    logos/
  schedule/
    program.csv
public/
  generated/
src/
  demo/
  gallery/
  partners/
  schedule/
  pages/
  scripts/
  shared/
```

## Workflow

1. Inserisci le immagini originali dentro `content/galleries/<slug-galleria>/`.
2. Esegui `npm install`.
3. Esegui `npm run build`.
4. Pubblica la cartella `dist/` sul tuo hosting statico.
5. In WordPress importa `gallery-widget.css`, `gallery-widget.js` e aggiungi i contenitori `.gallery-widget`.

Per il widget partner:

1. Inserisci i dati partner in uno o piu file JSON dentro `content/partners/` (ad esempio `institutional.json` e `allPartners.json`).
2. Ogni partner deve avere almeno `name`, `url` e `logo`.
3. Esegui `npm run build:partners-data` (oppure `npm run build`). Questo genera sia gli asset runtime in `public/generated/partners/` sia il manifest build-time in `src/generated/partners-manifest.js`.
4. In WordPress importa `partners-widget.css`, `partners-widget.js` e aggiungi i contenitori `.partners-widget`.

Modalita consigliata: set build-time tramite chiave dataset.

```html
<link rel="stylesheet" href="https://your-static-host.example/partners-widget.css">
<script defer src="https://your-static-host.example/partners-widget.js"></script>

<div class="partners-widget" data-partners-set="institutional"></div>
<div class="partners-widget" data-partners-set="allPartners"></div>
```

Esempio con JSON inline:

```html
<link rel="stylesheet" href="https://your-static-host.example/partners-widget.css">
<script defer src="https://your-static-host.example/partners-widget.js"></script>

<div class="partners-widget">
  <script type="application/json" data-partners-data>
    {"title":"All Our Partners","partners":[{"name":"Partner Uno","url":"https://example.com","logo":"/images/partner-uno.svg","alt":"Partner Uno"}]}
  </script>
</div>
```

Modalita compatibile con sorgente remota:

```html
<div class="partners-widget" data-partners-src="generated/partners/institutional.json"></div>
<div class="partners-widget" data-partners-src="generated/partners/allPartners.json"></div>
```

La modalita `data-partners-src` resta disponibile come fallback, ma la modalita `data-partners-set` e ora l'architettura primaria per ridurre fetch runtime e problemi di hosting.

Per il calendario settimanale:

1. Compila `content/schedule/program.csv` con colonne `Day;StartTime;EndTime;Title;Description;Location;Color`.
2. Esegui `npm run build`.
3. In WordPress importa `schedule-widget.css`, `schedule-widget.js` e aggiungi i contenitori `.schedule-widget`.

Slug attuale pubblicato nel repository: `Sess25`.

Dopo il deploy, la root del sito pubblicato mostra una pagina di anteprima del widget. Se vuoi verificare direttamente gli asset, prova anche `/gallery-widget.js`, `/gallery-widget.css` e `/generated/galleries.json`.

La demo locale Astro (`src/pages/index.astro`) e la preview statica pubblicata (`public/index.html`) condividono la stessa source of truth in `src/demo/showcase.js`. La preview statica viene rigenerata con `npm run build:demo-page`.

La build completa pulisce `dist/` una sola volta con `npm run build:clean`, poi genera tutti gli artifact con la stessa policy di output. I singoli build `build:gallery-widget`, `build:partners-widget` e `build:schedule-widget` non svuotano piu `dist/` autonomamente.

Il widget e pensato per embed cross-site: usa bundle JS classici. Gallery, schedule e partners possono essere consumati senza fetch runtime quando usi i manifest build-time.

## Embed WordPress

```html
<link rel="stylesheet" href="https://your-static-host.example/gallery-widget.css">
<script defer src="https://your-static-host.example/gallery-widget.js"></script>

<div class="gallery-widget" data-gallery="Sess25"></div>
```

Per il calendario:

```html
<link rel="stylesheet" href="https://your-static-host.example/schedule-widget.css">
<script defer src="https://your-static-host.example/schedule-widget.js"></script>

<div class="schedule-widget" data-schedule="program"></div>
```

## Comandi

- `npm run dev`: demo locale Astro
- `npm run build:clean`: pulisce esplicitamente `dist/`
- `npm run build:demo-page`: rigenera `public/index.html` dalla source of truth condivisa della demo
- `npm run build:galleries`: genera immagini ottimizzate e manifest JSON
- `npm run build:partners-data`: valida e pubblica i JSON partner in `public/generated/partners/` e rigenera `src/generated/partners-manifest.js`
- `npm run build:schedule`: genera il manifest schedule da CSV
- `npm run build:gallery-widget`: genera il bundle standalone del widget gallery
- `npm run build:widget`: alias compatibile di `build:gallery-widget`
- `npm run build:partners-widget`: genera il bundle standalone del widget partner
- `npm run build:schedule-widget`: genera il bundle standalone del widget calendario
- `npm run build`: build del widget deployabile
- `npm run build:demo`: build opzionale della pagina demo Astro

## GitHub Pages

Il repository include anche il workflow [deploy-pages.yml](.github/workflows/deploy-pages.yml) per pubblicare automaticamente `dist/` su GitHub Pages a ogni push su `main`.

Setup iniziale (una sola volta):

1. Vai su `Settings > Pages` del repository.
2. In `Build and deployment`, scegli `Source: GitHub Actions`.
3. Fai push su `main`.
4. Attendi il completamento del workflow `Deploy To GitHub Pages`.

L'URL finale sara in forma `https://<user>.github.io/<repo>/` (a meno di dominio custom).

Per WordPress, se usi GitHub Pages senza dominio custom, aggiorna gli embed con il prefisso repo:

```html
<link rel="stylesheet" href="https://<user>.github.io/<repo>/gallery-widget.css">
<script defer src="https://<user>.github.io/<repo>/gallery-widget.js"></script>

<div class="gallery-widget" data-gallery="Sess25"></div>
```

```html
<link rel="stylesheet" href="https://<user>.github.io/<repo>/partners-widget.css">
<script defer src="https://<user>.github.io/<repo>/partners-widget.js"></script>

<div class="partners-widget" data-partners-set="institutional"></div>
<div class="partners-widget" data-partners-set="allPartners"></div>
```

```html
<link rel="stylesheet" href="https://<user>.github.io/<repo>/schedule-widget.css">
<script defer src="https://<user>.github.io/<repo>/schedule-widget.js"></script>

<div class="schedule-widget" data-schedule="program"></div>
```

## Contenuti fuori repository (Google Drive)

Puoi tenere immagini gallerie, loghi partner e CSV programma fuori dalla repo e scaricarli in CI al momento della build.

### Opzione 2 (consigliata): cartelle Drive + Service Account

Il workflow puo sincronizzare direttamente 3 cartelle Drive condivise:

- cartella gallerie -> `content/galleries`
- cartella partners -> `content/partners`
- cartella schedule -> `content/schedule`

Secret richiesti:

- `GOOGLE_SERVICE_ACCOUNT_JSON`: JSON completo della chiave service account
- `DRIVE_GALLERIES_FOLDER_ID`: ID cartella Drive gallerie
- `DRIVE_PARTNERS_FOLDER_ID`: ID cartella Drive partners
- `DRIVE_SCHEDULE_FOLDER_ID`: ID cartella Drive schedule

Come ricavare il folder ID:

- link cartella: `https://drive.google.com/drive/folders/<FOLDER_ID>`
- usa la parte `<FOLDER_ID>` come valore del secret

Permessi da impostare su Drive:

1. apri le 3 cartelle Drive
2. condividi ogni cartella con l'email del service account (`client_email` presente nel JSON)
3. ruolo: Viewer

Struttura attesa delle cartelle:

- gallerie: sottocartelle evento (esempio `Sess25/`) con immagini `jpg`, `jpeg`, `png`
- partners: file JSON dataset (`allPartners.json`, `institutional.json`) e cartella `logos/`
- schedule: file `program.csv` (oppure anche Google Sheet esportabile in CSV)

Script usato in CI:

- `npm run sync:content`
  - prima prova sync da cartelle Drive
  - poi esegue fallback URL archive (opzione 1)

Quando i secret Drive non sono valorizzati, la build continua a usare il contenuto locale in `content/`.

### Opzione 1 (fallback): URL diretti a archivi tar.gz

Il workflow supporta 3 secret opzionali:

- `CONTENT_GALLERIES_URL`
- `CONTENT_PARTNERS_URL`
- `CONTENT_SCHEDULE_URL`

Ogni URL deve puntare a un archivio `.tar.gz` scaricabile (ad esempio link pubblico da Google Drive trasformato in download diretto).

Struttura attesa dentro gli archivi:

- `CONTENT_GALLERIES_URL`: file immagini direttamente dentro sottocartelle galleria (esempio `Sess25/foto1.jpg`)
- `CONTENT_PARTNERS_URL`: JSON dataset + cartella `logos/` (esempio `allPartners.json`, `institutional.json`, `logos/logo1.png`)
- `CONTENT_SCHEDULE_URL`: file `program.csv` alla root dell'archivio

Quando i secret non sono valorizzati, la build usa normalmente i file presenti in `content/` locale.

Script disponibile:

- `npm run sync:content`: sincronizza le 3 sorgenti remote (se configurate) dentro `content/`

Suggerimento pratico: in locale mantieni una copia minima per sviluppo, mentre in produzione (GitHub Actions) usi i secret URL per evitare di versionare asset pesanti.
