//
// OpenSelectedLinks content_script
//
// When a message is received it will gather all unique links found in
// the selection and return their hrefs as an array.
//
// Repeated URLs are coalesced to avoid a common annoyance (particularly
// in bugzilla queries).
//
chrome.runtime.onMessage.addListener(gatherLinks);

function gatherLinks(message, sender, callback) {
  if (message !== 'getSelectedLinks') {
    throw new Error(`openlinks content script received unexpected message: ${message}`);
  }

  const result = [];
  const selection = window.getSelection();
  if (selection === null) {
    return;
  }

  if (selection.type === "Range" && selection.rangeCount > 0) {
    const ancestor = selection.getRangeAt(0).commonAncestorContainer;

    // To find all selected links we'll get all <a> elements found in the
    // commonAncestorContainer of the selection, and then filter those
    // to find the ones that are at least partially within the selection.
    ancestor.querySelectorAll('a').forEach(e => {
      if (!selection.containsNode(e, true) || e.href === '' || result.indexOf(e.href) !== -1) {
        return; // Need only links from selection, with duplicates filtered out
      }
      result.push(e.href);
    });
    callback(result);
  }
}
