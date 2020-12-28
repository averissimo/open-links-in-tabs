function saveOptions(e) {
  browser.storage.sync.set({
    interval: document.querySelector("#interval").value
  });
  e.preventDefault();
}

function restoreOptions() {
  var storageItem = browser.storage.managed.get('interval');
  storageItem.then((res) => {
    document.querySelector("#managed-interval").innerText = res.interval;
  });

  var gettingItem = browser.storage.sync.get('interval');
  gettingItem.then((res) => {
    document.querySelector("#interval").value = res.interval || 100;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
