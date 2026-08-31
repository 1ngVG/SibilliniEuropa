import "./widget.css";
import { escapeHtml } from "../shared/html.js";
import { createInstanceId, findPendingWidgets, markWidgetInitialized, renderWidgetState } from "../shared/widgets.js";

const DEFAULT_AMOUNTS = [10, 25, 50, 100];
const DEFAULT_CURRENCY = "EUR";
const DEFAULT_TITLE = "Sostienici";
const PAYPAL_DONATE_URL = "https://www.paypal.com/donate";

function parseAmounts(raw) {
  if (!raw) {
    return DEFAULT_AMOUNTS;
  }

  const amounts = raw
    .split(",")
    .map((value) => Number.parseFloat(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);

  return amounts.length > 0 ? amounts : DEFAULT_AMOUNTS;
}

function readConfig(element) {
  const buttonId = element.dataset.donationButtonId?.trim();

  if (!buttonId) {
    return null;
  }

  return {
    buttonId,
    amounts: parseAmounts(element.dataset.donationAmounts),
    currency: element.dataset.donationCurrency?.trim() || DEFAULT_CURRENCY,
    title: element.dataset.donationTitle?.trim() || DEFAULT_TITLE,
    subtitle: element.dataset.donationSubtitle?.trim() || ""
  };
}

function formatAmountLabel(amount, currency) {
  try {
    return new Intl.NumberFormat("it-IT", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function renderDonation(element, config) {
  const widgetId = createInstanceId("dw");

  element.dataset.state = "ready";
  element.innerHTML = `
    <section class="dw-shell" aria-label="${escapeHtml(config.title)}">
      <header class="dw-header">
        <p class="dw-kicker">Donazione</p>
        <h4 class="dw-title">${escapeHtml(config.title)}</h4>
        ${config.subtitle ? `<p class="dw-subtitle">${escapeHtml(config.subtitle)}</p>` : ""}
      </header>

      <form class="dw-form" action="${PAYPAL_DONATE_URL}" method="post" target="_blank" rel="noopener" data-widget-id="${widgetId}">
        <input type="hidden" name="hosted_button_id" value="${escapeHtml(config.buttonId)}">
        <input type="hidden" name="currency_code" value="${escapeHtml(config.currency)}">

        <div class="dw-amounts" role="group" aria-label="Importo donazione">
          ${config.amounts.map((amount) => `
            <button type="button" class="dw-amount-btn" data-amount="${amount}" aria-pressed="false">${escapeHtml(formatAmountLabel(amount, config.currency))}</button>
          `).join("")}
        </div>

        <label class="dw-custom-label" for="${widgetId}-amount">Altro importo</label>
        <input class="dw-custom-input" id="${widgetId}-amount" type="number" name="amount" min="1" step="0.01" inputmode="decimal" placeholder="Importo libero" autocomplete="off">

        <p class="dw-error" hidden>Inserisci un importo valido.</p>

        <button type="submit" class="dw-submit">Dona con PayPal</button>
      </form>
    </section>
  `;

  const form = element.querySelector(".dw-form");
  const amountInput = element.querySelector(".dw-custom-input");
  const errorMessage = element.querySelector(".dw-error");
  const amountButtons = [...element.querySelectorAll(".dw-amount-btn")];

  amountButtons.forEach((button) => {
    button.addEventListener("click", () => {
      amountInput.value = button.dataset.amount;
      errorMessage.hidden = true;
      amountButtons.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
    });
  });

  amountInput.addEventListener("input", () => {
    amountButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.amount === amountInput.value)));
  });

  form.addEventListener("submit", (event) => {
    const value = Number.parseFloat(amountInput.value);

    if (!Number.isFinite(value) || value <= 0) {
      event.preventDefault();
      errorMessage.hidden = false;
      amountInput.focus();
    }
  });
}

export function initDonationWidgets(root = document) {
  const elements = findPendingWidgets(root, ".donation-widget", "dwInitialized");

  if (elements.length === 0) {
    return;
  }

  for (const element of elements) {
    markWidgetInitialized(element, "dwInitialized");

    const config = readConfig(element);

    if (!config) {
      renderWidgetState(element, "Donation widget: manca hosted_button_id (data-donation-button-id).", "error");
      continue;
    }

    renderDonation(element, config);
  }
}

if (typeof window !== "undefined") {
  window.DonationWidget = {
    init: initDonationWidgets
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initDonationWidgets();
    }, { once: true });
  } else {
    initDonationWidgets();
  }
}
