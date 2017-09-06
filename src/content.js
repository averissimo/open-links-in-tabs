//
// OpenSelectedLinks content_script
//
// When a message is received it will gather all links found in
// the selection and return their hrefs as an array.
//
// Repeated URLs are coalesced to avoid a common annoyance (particularly
// in bugzilla queries). Duplicates that are not adjacent will still
// result in duplicate tabs.
//
chrome.runtime.onMessage.addListener( gatherLinks );

function gatherLinks( message, sender, callback ) {
  console.log("gatherLinks in document " + document.location)
  //
  // sanity-check whoever is poking us
  //
  if ( message != "getSelectedLinks" )
    throw "openlinks content script received unexpected message: " + message;
  console.log("  message", message)

  //
  // To find all selected links we'll get all <a> elements found in the
  // commonAncestorContainer of the selection, and then filter those
  // to find the ones that are at least partially within the selection.
  //
  let results = [];
  // console.log('  results', results);
  let prevLink = "";
  // console.log('  prevLink', prevLink);
  let selection = window.getSelection();
  // console.log('  selection', selection);

  if (selection === null ) {
    // console.log('  selection is null');
    return;
  }

  let ancestor = selection.getRangeAt(0).commonAncestorContainer;
  // console.log('  ancestor', ancestor);

  for ( let link of ancestor.getElementsByTagName( "a" ) ) {
    if ( selection.containsNode( link, true ) && link.href != prevLink ) {
      results.push( link.href );
      prevLink = link.href;
    }
  }

  if (results.length > 0) {
    // console.log('  showing results', results);
    callback( results );
  } else {
    // console.log('  doing nothing, as there are no results')
  }
}
