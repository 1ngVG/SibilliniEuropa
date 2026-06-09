# SibilliniEuropa

Widget standalone per sibillinieuropa.eu (galleria foto + calendario settimanale).

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
src/
  schedule/
  pages/
  scripts/
  widget/
```

## Workflow

1. Inserisci le immagini originali dentro `galleries/<slug-galleria>/`.
2. Esegui `npm install`.
3. Esegui `npm run build`.
4. Pubblica la cartella `dist/` su Netlify.
5. In WordPress importa `gallery-widget.css`, `gallery-widget.js` e aggiungi i contenitori `.gallery-widget`.

Per il calendario settimanale:

1. Compila `schedule/program.csv` con colonne `Day;StartTime;EndTime;Title;Description;Location;Color`.
2. Esegui `npm run build`.
3. In WordPress importa `schedule-widget.css`, `schedule-widget.js` e aggiungi i contenitori `.schedule-widget`.

Slug attuale pubblicato nel repository: `Sess25`.

Dopo il deploy, la root del sito Netlify mostra una pagina di anteprima del widget. Se vuoi verificare direttamente gli asset, prova anche `/gallery-widget.js`, `/gallery-widget.css` e `/generated/galleries.json`.

Il widget e pensato per embed cross-site: usa un bundle JS classico e non richiede fetch runtime del manifest JSON.

## Embed WordPress

```html
<link rel="stylesheet" href="https://your-netlify-site.netlify.app/gallery-widget.css">
<script defer src="https://your-netlify-site.netlify.app/gallery-widget.js"></script>

<div class="gallery-widget" data-gallery="Sess25"></div>
```

Per il calendario:

```html
<link rel="stylesheet" href="https://your-netlify-site.netlify.app/schedule-widget.css">
<script defer src="https://your-netlify-site.netlify.app/schedule-widget.js"></script>

<div class="schedule-widget" data-schedule="program"></div>
```

## Comandi

- `npm run dev`: demo locale Astro
- `npm run build:galleries`: genera immagini ottimizzate e manifest JSON
- `npm run build:schedule`: genera il manifest schedule da CSV
- `npm run build:widget`: genera il bundle standalone del widget
- `npm run build:schedule-widget`: genera il bundle standalone del widget calendario
- `npm run build`: build del widget deployabile
- `npm run build:demo`: build opzionale della pagina demo Astro

## Netlify

Il repository include [netlify.toml](netlify.toml), quindi su Netlify basta collegare la repo: il build command e la publish directory sono gia impostati.
