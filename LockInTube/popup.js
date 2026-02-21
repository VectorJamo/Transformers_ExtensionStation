const addBtn = document.getElementById("addTag");
const input = document.getElementById("tagInput");
const resetButton = document.getElementById("clearTagsBtn");
const reloadButton = document.getElementById("reloadPage");

const blackListTagInput = document.getElementById("blackListTagInput");
const blackListAddBtn = document.getElementById("blackListAddTag");

console.log("SCRIPT LOADED");

addBtn.addEventListener("click", () => {
  const tag = input.value.trim().toLowerCase();
  if (!tag) return;

  chrome.storage.sync.get(["tags"], (result) => {
    const tags = result.tags || [];
    if (!tags.includes(tag)) tags.push(tag);
    chrome.storage.sync.set({ tags }, () => {
      input.value = "";
      renderTags();
    });
  });
});

resetButton.addEventListener("click", () => {
  // Clear tags in chrome.storage
  chrome.storage.sync.set({ tags: [] }, () => {
    // Optional: clear the UI list
    const tagList = document.getElementById("tagList");
    tagList.innerHTML = "";
  });
});

reloadButton.addEventListener("click", () => {
  // Reload the current tab (works in Chrome extension)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].id) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
});
function renderTags() {
  chrome.storage.sync.get(["tags"], (result) => {
    const tags = result.tags || [];
    const tagList = document.getElementById("tagList");
    tagList.innerHTML = "";
    tags.forEach(tag => {
      const li = document.createElement("li");
      li.textContent = tag;
      tagList.appendChild(li);
    });
  });
}

renderTags();

// Initialize default blacklist if it doesn't exist
chrome.storage.local.get(["blacklist"], (result) => {
  if (!result.blacklist) {
    chrome.storage.local.set({
      blacklist: ["gaming", "vlog", "drama"]
    });
  }
});

// Add new blacklist item
blackListAddBtn.addEventListener("click", () => {
  console.log("Blacklist add button clicked.");

  const tag = blackListTagInput.value.trim().toLowerCase();
  if (!tag) return;

  console.log("Check 1 Passed");

  chrome.storage.local.get(["blacklist"], (result) => {
    const blacklist = result.blacklist || [];

    if (!blacklist.includes(tag)) {
      blacklist.push(tag);
    }

    chrome.storage.local.set({ blacklist }, () => {
      console.log("BLACKLIST SAVED!");
      blackListTagInput.value = "";
      renderBlackListTags();
    });
  });
});

// Render blacklist in popup
function renderBlackListTags() {
  chrome.storage.local.get(["blacklist"], (result) => {
    const blacklist = result.blacklist || [];
    const tagList = document.getElementById("blackListTagList");

    tagList.innerHTML = "";

    console.log("BLACKLIST TAGS:");
    console.log(blacklist);

    blacklist.forEach(tag => {
      const li = document.createElement("li");
      li.textContent = tag;
      tagList.appendChild(li);
    });
  });
}

// Initial render
renderBlackListTags();