/* global DEFAULTS */

async function saveOptions(e) {
  e.preventDefault();

  const options = {};
  Object.keys(DEFAULTS).forEach(key => {
    const selector = document.querySelector(`#${key}`);
    switch (selector.type) {
      case "checkbox": 
        options[key] = selector.checked; 
        break;
      default:
        options[key] = selector.value; 
    }
  });

  await browser.storage.sync.set(options);
}

async function restoreOptions() {
  const options = await browser.storage.sync.get(DEFAULTS);

  Object.keys(DEFAULTS).forEach(key => {
    const selector = document.querySelector(`#${key}`)
    switch (selector.type) {
      case "checkbox": 
        selector.checked = options[key];
        break;
      default:
        selector.value = options[key];
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
