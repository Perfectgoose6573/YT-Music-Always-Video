const KEY = "autoVideoEnabled";

function setStatus(msg) {
  document.getElementById("status").textContent = msg;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function notifyContentScript(tabId) {
  // If the tab isn't on music.youtube.com, this will fail silently.
  try {
    await chrome.tabs.sendMessage(tabId, { type: "SETTING_UPDATED" });
  } catch (_) {}
}

document.addEventListener("DOMContentLoaded", async () => {
  const toggle = document.getElementById("autoVideo");

  // Load saved state (default ON)
  chrome.storage.sync.get({ [KEY]: true }, (res) => {
    toggle.checked = !!res[KEY];
    setStatus(toggle.checked ? "Enabled" : "Disabled");
  });

  toggle.addEventListener("change", async () => {
    const enabled = toggle.checked;

    chrome.storage.sync.set({ [KEY]: enabled }, async () => {
      setStatus(enabled ? "Enabled" : "Disabled");

      const tab = await getActiveTab();
      if (tab?.id) await notifyContentScript(tab.id);
    });
  });
});
