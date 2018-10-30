

//
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
  contexts: [ "selection" ],
  onclick: openselectedlinks
} );

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//
// openUrls
//
// Given an <urllist> array open each in a new background tab
// relative to the passed in <tab>
//
async function openUrls( urllist, tab ) {
  console.log('urllist', urllist);
  console.log('tab', tab);
  if (urllist === undefined) {
    console.log('urllist is undefined!')
    return;
  }
  let ptab = tab;
  for ( url of urllist ) {
    ptab = await browser.tabs.create({
             windowId: tab.windowId,
             index: (ptab.index + 1),
             openerTabId: ptab.id,
             url: url,
             active: false
           });
	await sleep(600);
  }
}

function openselectedlinks( info, tab ) {
  // prior to bug 1250631 tab was part of the info object
  if ( !tab ) { tab = info.tab; }

  browser.tabs.sendMessage(
    tab.id,
    "getSelectedLinks",
    (results) => { openUrls( results, tab ); }
  )
}
