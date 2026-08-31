# SibilliniEuropa

Widget standalone per sibillinieuropa.eu (galleria foto, sezione partner dinamica, bacheca staff, tabella comitato scientifico + calendario settimanale).

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
  staff/
    committee.json
    ProfilePic/
  scientific_committee/
    scientific-committee.csv
  schedule/
    program.csv
public/
  generated/
src/
  demo/
  gallery/
  partners/
  staff/
  committee/
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

Per la bacheca staff:

1. Inserisci i dati staff in uno o piu file JSON dentro `content/staff/` (ad esempio `committee.json`).
2. Ogni membro deve avere almeno `name` e `photo`; `role` e opzionale.
3. Metti le foto profilo originali dentro `content/staff/ProfilePic/`. Nel JSON, `photo` punta al percorso generato, ad esempio `generated/staff/profile-pics/mario-rossi.jpg`.
4. Esegui `npm run build:staff-data` (oppure `npm run build`). Questo genera sia gli asset runtime in `public/generated/staff/` sia il manifest build-time in `src/generated/staff-manifest.js`.
5. In WordPress importa `staff-widget.css`, `staff-widget.js` e aggiungi i contenitori `.staff-widget`.

A differenza del widget partner, le card staff non flippano e non linkano a siti esterni: mostrano solo foto, nome e ruolo, con lo stesso linguaggio grafico (colori, radius, ombre) del widget partner.

```html
<link rel="stylesheet" href="https://your-static-host.example/staff-widget.css">
<script defer src="https://your-static-host.example/staff-widget.js"></script>

<div class="staff-widget" data-staff-set="committee"></div>
```

Anche qui restano disponibili le modalita JSON inline (`data-staff-data`) e sorgente remota (`data-staff-src="generated/staff/committee.json"`), con la stessa semantica del widget partner.

Per la tabella del comitato scientifico:

1. Compila uno o piu file CSV dentro `content/scientific_committee/` (ad esempio `scientific-committee.csv`) con colonne `Academic Title & Name;Site` (o separate da virgola).
2. Esegui `npm run build:committee-data` (oppure `npm run build`). Questo genera il manifest build-time in `src/generated/committee-manifest.js`; ogni file CSV diventa un dataset selezionabile per nome file.
3. In WordPress importa `committee-widget.css`, `committee-widget.js` e aggiungi i contenitori `.committee-widget`.

A differenza degli altri widget non c'e fetch runtime ne JSON inline: e pensato per un solo dataset build-time, con lo stesso approccio CSV -> manifest del widget calendario.

```html
<link rel="stylesheet" href="https://your-static-host.example/committee-widget.css">
<script defer src="https://your-static-host.example/committee-widget.js"></script>

<div class="committee-widget" data-committee-set="scientific-committee"></div>
```

Per il calendario settimanale:

1. Compila `content/schedule/program.csv` con colonne `Day;StartTime;EndTime;Title;Description;Location;Color`.
2. Esegui `npm run build`.
3. In WordPress importa `schedule-widget.css`, `schedule-widget.js` e aggiungi i contenitori `.schedule-widget`.

Slug attuale pubblicato nel repository: `Sess25`.

Per la donazione tramite PayPal:

1. Su PayPal (account Business) crea un bottone Donate (PayPal.Me/Donate Button) e recupera l'`hosted_button_id`.
2. Nessun build dati richiesto: il widget usa solo attributi `data-*` sull'elemento contenitore, niente file in `content/`.
3. In WordPress importa `donation-widget.css`, `donation-widget.js` e aggiungi un contenitore `.donation-widget` con `data-donation-button-id`.

Attributi disponibili:

- `data-donation-button-id` (obbligatorio): hosted button ID PayPal.
- `data-donation-amounts` (opzionale, default `10,25,50,100`): importi preset separati da virgola.
- `data-donation-currency` (opzionale, default `EUR`): codice valuta ISO.
- `data-donation-title` (opzionale, default `Sostienici`): titolo widget.
- `data-donation-subtitle` (opzionale): sottotitolo/descrizione.

Al submit il form posta a `https://www.paypal.com/donate` con `hosted_button_id`, `currency_code` e `amount` (preso dal preset cliccato o dal campo importo libero); si apre in una nuova scheda cosi il visitatore non perde il sito.

```html
<link rel="stylesheet" href="https://your-static-host.example/donation-widget.css">
<script defer src="https://your-static-host.example/donation-widget.js"></script>

<div class="donation-widget"
     data-donation-button-id="XXXXXXXXXXXXX"
     data-donation-amounts="10,25,50,100"
     data-donation-title="Sostieni Sibillini Europa"
     data-donation-subtitle="Ogni contributo aiuta a organizzare l'evento."></div>
```

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
- `npm run build:staff-data`: valida e pubblica i JSON staff in `public/generated/staff/`, ottimizza le foto profilo e rigenera `src/generated/staff-manifest.js`
- `npm run build:committee-data`: valida i CSV del comitato scientifico e rigenera `src/generated/committee-manifest.js`
- `npm run build:schedule`: genera il manifest schedule da CSV
- `npm run build:gallery-widget`: genera il bundle standalone del widget gallery
- `npm run build:widget`: alias compatibile di `build:gallery-widget`
- `npm run build:partners-widget`: genera il bundle standalone del widget partner
- `npm run build:staff-widget`: genera il bundle standalone del widget staff
- `npm run build:committee-widget`: genera il bundle standalone del widget comitato scientifico
- `npm run build:schedule-widget`: genera il bundle standalone del widget calendario
- `npm run build:donation-widget`: genera il bundle standalone del widget donazioni
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
<link rel="stylesheet" href="https://<user>.github.io/<repo>/staff-widget.css">
<script defer src="https://<user>.github.io/<repo>/staff-widget.js"></script>

<div class="staff-widget" data-staff-set="committee"></div>
```

```html
<link rel="stylesheet" href="https://<user>.github.io/<repo>/committee-widget.css">
<script defer src="https://<user>.github.io/<repo>/committee-widget.js"></script>

<div class="committee-widget" data-committee-set="scientific-committee"></div>
```

```html
<link rel="stylesheet" href="https://<user>.github.io/<repo>/schedule-widget.css">
<script defer src="https://<user>.github.io/<repo>/schedule-widget.js"></script>

<div class="schedule-widget" data-schedule="program"></div>
```

```html
<link rel="stylesheet" href="https://<user>.github.io/<repo>/donation-widget.css">
<script defer src="https://<user>.github.io/<repo>/donation-widget.js"></script>

<div class="donation-widget" data-donation-button-id="XXXXXXXXXXXXX"></div>
```

## Contenuti fuori repository (Google Drive)

Puoi tenere immagini gallerie, loghi partner e CSV programma fuori dalla repo e scaricarli in CI al momento della build.

### Opzione 2 (consigliata): cartelle Drive + Service Account

Il workflow puo sincronizzare direttamente 5 cartelle Drive condivise:

- cartella gallerie -> `content/galleries`
- cartella partners -> `content/partners`
- cartella staff -> `content/staff`
- cartella comitato scientifico -> `content/scientific_committee`
- cartella schedule -> `content/schedule`

Secret richiesti:

- `GOOGLE_SERVICE_ACCOUNT_JSON`: JSON completo della chiave service account
- `DRIVE_GALLERIES_FOLDER_ID`: ID cartella Drive gallerie
- `DRIVE_PARTNERS_FOLDER_ID`: ID cartella Drive partners
- `DRIVE_STAFF_FOLDER_ID`: ID cartella Drive staff
- `DRIVE_SCIENTIFIC_COMMITTEE_FOLDER_ID`: ID cartella Drive comitato scientifico
- `DRIVE_SCHEDULE_FOLDER_ID`: ID cartella Drive schedule

Come ricavare il folder ID:

- link cartella: `https://drive.google.com/drive/folders/<FOLDER_ID>`
- usa la parte `<FOLDER_ID>` come valore del secret

Permessi da impostare su Drive:

1. apri le 5 cartelle Drive
2. condividi ogni cartella con l'email del service account (`client_email` presente nel JSON)
3. ruolo: Viewer

Struttura attesa delle cartelle:

- gallerie: sottocartelle evento (esempio `Sess25/`) con immagini `jpg`, `jpeg`, `png`
- partners: file JSON dataset (`allPartners.json`, `institutional.json`) e cartella `logos/`
- staff: file JSON dataset (`committee.json`) e cartella `ProfilePic/`
- comitato scientifico: file CSV (esempio `scientific-committee.csv`) con colonne `Academic Title & Name`, `Site`
- schedule: file `program.csv` (oppure anche Google Sheet esportabile in CSV)

Script usato in CI:

- `npm run sync:content`
  - prima prova sync da cartelle Drive
  - poi esegue fallback URL archive (opzione 1)

Quando i secret Drive non sono valorizzati, la build continua a usare il contenuto locale in `content/`.

### Opzione 1 (fallback): URL diretti a archivi tar.gz

Il workflow supporta 5 secret opzionali:

- `CONTENT_GALLERIES_URL`
- `CONTENT_PARTNERS_URL`
- `CONTENT_STAFF_URL`
- `CONTENT_SCIENTIFIC_COMMITTEE_URL`
- `CONTENT_SCHEDULE_URL`

Ogni URL deve puntare a un archivio `.tar.gz` scaricabile (ad esempio link pubblico da Google Drive trasformato in download diretto).

Struttura attesa dentro gli archivi:

- `CONTENT_GALLERIES_URL`: file immagini direttamente dentro sottocartelle galleria (esempio `Sess25/foto1.jpg`)
- `CONTENT_PARTNERS_URL`: JSON dataset + cartella `logos/` (esempio `allPartners.json`, `institutional.json`, `logos/logo1.png`)
- `CONTENT_STAFF_URL`: JSON dataset + cartella `ProfilePic/` (esempio `committee.json`, `ProfilePic/mario-rossi.jpg`)
- `CONTENT_SCIENTIFIC_COMMITTEE_URL`: file CSV alla root dell'archivio (esempio `scientific-committee.csv`)
- `CONTENT_SCHEDULE_URL`: file `program.csv` alla root dell'archivio

Quando i secret non sono valorizzati, la build usa normalmente i file presenti in `content/` locale.

Script disponibile:

- `npm run sync:content`: sincronizza le 5 sorgenti remote (se configurate) dentro `content/`

Suggerimento pratico: in locale mantieni una copia minima per sviluppo, mentre in produzione (GitHub Actions) usi i secret URL per evitare di versionare asset pesanti.
