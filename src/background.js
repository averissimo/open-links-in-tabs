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
browser.contextMenus.create({
  id: 'openselectedlinks',
  title: browser.i18n.getMessage('openLinks'),
  contexts: ['selection'], // Why? all
  onclick: openselectedlinks
});

async function openselectedlinks(info, tab) {
  // Prior to bug 1250631 tab was part of the info object
  if (!tab) {
    tab = info.tab;
  }
  const morelinks = await browser.tabs.sendMessage(tab.id, 'getSelectedLinks');
  for (const link of morelinks) {
    queue.push(link);
  }
  openTabs(tab);
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
let queue = [];

async function openTabs(firsttab) {
  if (running) {
    return;
  }
  const options = await browser.storage.sync.get('interval');
  debug('started running', running, queue);
  running = true;
  let i = 0;
  let lasttab = firsttab;
  while (queue[i]) {
    try {
      lasttab = await browser.tabs.create({ // eslint-disable-line no-await-in-loop
        windowId: firsttab.windowId,
        index: (lasttab.index + 1),
        openerTabId: lasttab.id,
        url: queue[i],
        active: false
      });
    } catch (e) {
      debug('RETRYING, because of', e);
      try {
        lasttab = await browser.tabs.create({ // eslint-disable-line no-await-in-loop
          windowId: firsttab.windowId,
          index: (lasttab.index + 1),
          url: queue[i],
          active: false
        });
      } catch (e) {
        debug('ERROR DURING RETRY:', e);
      }
    }
    await sleep(Number.parseFloat(options.interval || 100)); // eslint-disable-line no-await-in-loop
    i++;
  }
  queue = [];
  running = false;
  debug('finished running', running, queue);
}
