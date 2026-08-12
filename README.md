# SibilliniEuropa

Widget standalone per sibillinieuropa.eu (galleria foto, sezione partner dinamica + calendario settimanale).

## Stack

- Astro per sviluppo locale e pagina demo
- Vite per il bundle finale del widget
- Sharp per l'ottimizzazione immagini
- GLightbox per il lightbox

## Struttura

```text
galleries/
  Sess25/
schedule/
  program.csv
public/
  generated/
partners/
  allPartners.json
  institutional.json
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

1. Inserisci le immagini originali dentro `galleries/<slug-galleria>/`.
2. Esegui `npm install`.
3. Esegui `npm run build`.
4. Pubblica la cartella `dist/` sul tuo hosting statico.
5. In WordPress importa `gallery-widget.css`, `gallery-widget.js` e aggiungi i contenitori `.gallery-widget`.

Per il widget partner:

1. Inserisci i dati partner in uno o piu file JSON dentro `partners/` (ad esempio `institutional.json` e `allPartners.json`).
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
    {"title":"All Our Partners","cta":"Scopri di più","partners":[{"name":"Partner Uno","url":"https://example.com","logo":"/images/partner-uno.svg","alt":"Partner Uno"}]}
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

1. Compila `schedule/program.csv` con colonne `Day;StartTime;EndTime;Title;Description;Location;Color`.
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
