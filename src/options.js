/* global DEFAULTS */

async function saveOptions(e) {
  e.preventDefault();

  const options = {};
  Object.keys(DEFAULTS).forEach(key => {
    options[key] = document.querySelector(`#${key}`).value;
  });

  await browser.storage.sync.set(options);
}

async function restoreOptions() {
  const options = await browser.storage.sync.get(DEFAULTS);

  Object.keys(DEFAULTS).forEach(key => {
    document.querySelector(`#${key}`).value = options[key];
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
