const counters = new Map();

export function createInstanceId(prefix) {
  const nextValue = (counters.get(prefix) ?? 0) + 1;
  counters.set(prefix, nextValue);
  return `${prefix}-${nextValue}`;
}

export function findPendingWidgets(root, selector, initializedAttribute) {
  return [...root.querySelectorAll(selector)].filter((element) => element.dataset[initializedAttribute] !== "true");
}

export function markWidgetInitialized(element, initializedAttribute) {
  element.dataset[initializedAttribute] = "true";
}

export function renderWidgetState(element, message, state) {
  element.dataset.state = state;
  element.textContent = message;
}
