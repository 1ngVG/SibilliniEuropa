import { escapeHtml } from "../shared/html.js";

export const showcaseTitle = "Sibillini Europa Widgets";
export const showcaseDescription = "Anteprima pubblicata dei widget standalone per Sibillini Europa.";
export const showcaseLead = "Questa pagina conferma che il deploy statico e attivo e che i widget possono essere caricati correttamente. Galleria corrente: Sess25. Partner widget: Institutional + All Partners. Staff: Comitato Organizzatore. Programma corrente: program.";
export const showcaseStyles = `
:root {
  color-scheme: light;
  font-family: Georgia, "Times New Roman", serif;
  background: #f4f0e8;
  color: #1f2937;
}

body {
  margin: 0;
  min-block-size: 100vh;
  background:
    radial-gradient(circle at top left, rgba(191, 219, 254, 0.45), transparent 35%),
    linear-gradient(180deg, #f8f5ef 0%, #f0ece3 100%);
}

main {
  max-inline-size: 1100px;
  margin: 0 auto;
  padding: 4rem 1.5rem 6rem;
}

h1 {
  margin: 0 0 1rem;
  font-size: clamp(2.2rem, 5vw, 4rem);
}

p {
  max-inline-size: 66ch;
  line-height: 1.7;
}

.demo-columns {
  display: grid;
  gap: 2rem;
}

code {
  padding: 0.12rem 0.4rem;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
}
`;

export const showcaseWidgets = [
  {
    className: "gallery-widget",
    attrs: {
      "data-gallery": "Sess25"
    }
  },
  {
    className: "partners-widget",
    attrs: {
      "data-partners-set": "institutional"
    }
  },
  {
    className: "partners-widget",
    attrs: {
      "data-partners-set": "allPartners"
    }
  },
  {
    className: "staff-widget",
    attrs: {
      "data-staff-set": "committee"
    }
  },
  {
    className: "schedule-widget",
    attrs: {
      "data-schedule": "program"
    }
  }
];

function renderAttributes(attrs) {
  return Object.entries(attrs)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(" ");
}

export function renderShowcaseWidgets() {
  return showcaseWidgets
    .map(({ className, attrs }) => {
      const attributes = renderAttributes(attrs);
      return `        <div class="${escapeHtml(className)}" ${attributes}></div>`;
    })
    .join("\n");
}

export function renderShowcaseLeadHtml() {
  return `${escapeHtml("Questa pagina conferma che il deploy statico e attivo e che i widget possono essere caricati correttamente.")}\n        Galleria corrente: <code>Sess25</code>. Partner widget: <code>Institutional + All Partners</code>. Staff: <code>Comitato Organizzatore</code>. Programma corrente: <code>program</code>.`;
}

export function renderStaticDemoPage() {
  return `<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(showcaseTitle)}</title>
    <meta name="description" content="${escapeHtml(showcaseDescription)}">
    <link rel="stylesheet" href="./gallery-widget.css">
    <link rel="stylesheet" href="./partners-widget.css">
    <link rel="stylesheet" href="./staff-widget.css">
    <link rel="stylesheet" href="./schedule-widget.css">
    <style>
${showcaseStyles}
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(showcaseTitle)}</h1>
      <p>
        ${renderShowcaseLeadHtml()}
      </p>
      <div class="demo-columns">
${renderShowcaseWidgets()}
      </div>
    </main>
    <script defer src="./gallery-widget.js"></script>
    <script defer src="./partners-widget.js"></script>
    <script defer src="./staff-widget.js"></script>
    <script defer src="./schedule-widget.js"></script>
  </body>
</html>
`;
}
