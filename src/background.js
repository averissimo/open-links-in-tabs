/* global DEFAULTS */

// Open Selected Links web extension
//
// URL/Link helper extension, primarily for dealing with mass links.
// The extension adds context menus to handle links in various ways,
// especially bulk actions on multiple selected links
//

//
// Open selected links
//
// a context menu item that opens selected HTML links in background tabs.
// Since a background script can't see page content we have to ask
// the tab that was clicked to return it to us.
//

contextMenuId = "openselectedlinks";

async function shouldBeVisible() {
  const options = await getOptions();
  if (options.removeContextMenu) {
    return false;
  }
  return true;
}

async function createMenu() {
  browser.contextMenus.create({
    id: contextMenuId,
    title: browser.i18n.getMessage('openLinks'),
    contexts: ['selection'], // Why? all
    onclick: openselectedlinks,
    visible: await shouldBeVisible()
  });
}

createMenu();

browser.contextMenus.onHidden.addListener(async (info, tab) => {
  browser.contextMenus.update(contextMenuId, {
    enabled: true,
    visible: await shouldBeVisible()
  });
});

browser.contextMenus.onShown.addListener(async (info, tab) => {
  const links = await browser.tabs.sendMessage(tab.id, 'getSelectedLinks');
  
  if (!links || links.length == 0) {
    browser.contextMenus.update(contextMenuId, {
      enabled: false,
      visible: await shouldBeVisible()
    });

  } else {
    browser.contextMenus.update(contextMenuId, {
      enabled: true,
      visible: true
    });
  }

  browser.contextMenus.refresh();
});

async function openselectedlinks(info, tab) {
  // Prior to bug 1250631 tab was part of the info object
  if (!tab) {
    tab = info.tab;
  }
  const links = await browser.tabs.sendMessage(tab.id, 'getSelectedLinks');
  queue.push({tab, links});
  openTabs();
}

const debugOn = false;

function debug(...str) {
  if (debugOn) {
    console.log(...str);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let running = false;
let loading = 0;
const queue = [];

async function openTabs() {
  if (running) {
    return;
  }

  try {
    running = true;
    loading = 0;

    const options = await getOptions();
    debug('started running', running, queue);
    debug('options', options);

    while (queue.length) {
      let {tab: lastTab, links} = queue.shift();

      while (links.length) {
        const link = links.shift();
        const newTab = await openTab(link, lastTab); // eslint-disable-line no-await-in-loop
        if (!newTab) {
          continue;
        }

        lastTab = newTab;
        loading++;
        waitTab(lastTab, options.loadTimeout).then(() => {
          loading = Math.max(loading - 1, 0);
        });

        do {
          await sleep(options.interval); // eslint-disable-line no-await-in-loop
        } while (options.maxLoading && (loading >= options.maxLoading)); // eslint-disable-line no-unmodified-loop-condition
      }
    }
  } finally {
    queue.length = 0;
    running = false;
    debug('finished running', running, queue);
  }
}

async function getOptions() {
  const parseBool = (value, defaultValue) => ['true', 'false', true, false].includes(value) && JSON.parse(value) || defaultValue

  try {
    const options = await browser.storage.sync.get(DEFAULTS);
    Object.keys(options).forEach(key => {
      switch (key) {
        case "removeContextMenu":
          options[key] = parseBool(options[key], DEFAULTS.removeContextMenu);
          break;
        default:
          options[key] = parseInt(options[key], 10);
      }
    });
    return options;
  } catch (error) {
    return DEFAULTS;
  }
}

async function openTab(url, lastTab) {
  try {
    lastTab = (await getTab(lastTab.id)) || lastTab;

    return await browser.tabs.create({
      windowId: lastTab.windowId,
      index: (lastTab.index + 1),
      url,
      active: false
    });
  } catch (error) {
    debug('failed to open tab', url, error);
    return null;
  }
}

async function getTab(tabId) {
  try {
    return await browser.tabs.get(tabId);
  } catch (error) {
    return null;
  }
}

async function waitTab(tab, loadTimeout) {
  return new Promise(resolve => {
    function cleanResolve(reason) {
      debug('wait finished', reason);
      browser.tabs.onUpdated.removeListener(updateListener);
      browser.tabs.onRemoved.removeListener(removeListener);
      clearTimeout(timeoutId);
      resolve();
    }

    function updateListener(tabId, changeInfo) {
      if (changeInfo.status === 'complete') {
        cleanResolve('completed');
      }
    }

    function removeListener(tabId) {
      if (tabId === tab.id) {
        cleanResolve('removed');
      }
    }

    browser.tabs.onUpdated.addListener(updateListener, {tabId: tab.id, properties: ['status']});
    browser.tabs.onRemoved.addListener(removeListener);
    const timeoutId = setTimeout(() => cleanResolve('timeout'), loadTimeout * 1000);
  });
}
