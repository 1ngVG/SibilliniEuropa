# SibilliniEuropa

Widget galleria standalone per sibillinieuropa.eu.

## Stack

- Astro per sviluppo locale e pagina demo
- Vite per il bundle finale del widget
- Sharp per l'ottimizzazione immagini
- GLightbox per il lightbox

## Struttura

```text
galleries/
  Sess25/
public/
  generated/
src/
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

Slug attuale pubblicato nel repository: `Sess25`.

## Embed WordPress

```html
<link rel="stylesheet" href="https://your-netlify-site.netlify.app/gallery-widget.css">
<script type="module" src="https://your-netlify-site.netlify.app/gallery-widget.js"></script>

<div class="gallery-widget" data-gallery="Sess25"></div>
```

## Comandi

- `npm run dev`: demo locale Astro
- `npm run build:galleries`: genera immagini ottimizzate e manifest JSON
- `npm run build:widget`: genera il bundle standalone del widget
- `npm run build`: build del widget deployabile
- `npm run build:demo`: build opzionale della pagina demo Astro

## Netlify

Il repository include [netlify.toml](netlify.toml), quindi su Netlify basta collegare la repo: il build command e la publish directory sono gia impostati.
