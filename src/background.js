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
browser.contextMenus.create( {
  id: "openselectedlinks",
  title: browser.i18n.getMessage("openLinks"),
  contexts: [ "all" ],
  onclick: openselectedlinks
} );

async function openselectedlinks( info, tab ) {
  // prior to bug 1250631 tab was part of the info object
  if ( !tab ) { tab = info.tab; }
  let morelinks = await browser.tabs.sendMessage(tab.id, "getSelectedLinks");
  for (let link of morelinks) {
	  queue.push(link);
  }
  openTabs(tab);
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
  running = true;
  let i = 0;
  let lasttab = firsttab;
  while (queue[i]) {
    lasttab = await browser.tabs.create({
      windowId: firsttab.windowId,
      index: (lasttab.index + 1),
      openerTabId: lasttab.id,
      url: queue[i],
      active: false
    });
    await sleep(1000);
    i++;
  }
  queue.length = 0;
  running = false;
}

