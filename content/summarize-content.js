function getCleanText() {
  let text = "";

  // grab headings for extra context
  document.querySelectorAll("h1, h2, h3").forEach(h => {
    let content = h.innerText.trim();
    if (content.length > 10) text += content + ". ";
  });

  // grab paragraphs
  document.querySelectorAll("p").forEach(p => {
    let content = p.innerText.trim();
    if (content.length > 50) text += content + " ";
  });

  return text;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getText") {
    sendResponse({ text: getCleanText() });
  }
});