export function detectScriptBaseUrl(scriptFileName) {
  if (typeof document === "undefined") {
    return undefined;
  }

  const currentScript = document.currentScript;

  if (currentScript instanceof HTMLScriptElement && currentScript.src) {
    return new URL(".", currentScript.src);
  }

  if (!scriptFileName) {
    return undefined;
  }

  const widgetScript = [...document.querySelectorAll("script[src]")].find((script) => {
    return script.src.includes(scriptFileName);
  });

  if (widgetScript instanceof HTMLScriptElement && widgetScript.src) {
    return new URL(".", widgetScript.src);
  }

  return undefined;
}

export function resolveElementBaseUrl(element, {
  dataAttribute,
  globalProperty,
  scriptFileName
} = {}) {
  const localBase = dataAttribute ? element.dataset[dataAttribute] : undefined;

  if (localBase) {
    return new URL(localBase, window.location.href);
  }

  if (globalProperty && typeof window !== "undefined" && window[globalProperty]) {
    return new URL(window[globalProperty], window.location.href);
  }

  return detectScriptBaseUrl(scriptFileName) ?? new URL(window.location.href);
}

export function resolveSourceUrl(element, source, options) {
  if (/^https?:\/\//i.test(source)) {
    return new URL(source);
  }

  if (source.startsWith("/")) {
    return new URL(source, window.location.origin);
  }

  return new URL(source, resolveElementBaseUrl(element, options));
}
