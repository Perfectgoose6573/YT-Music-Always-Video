const AUTO_KEY = "autoVideoEnabled";
const THEME_KEY = "themeMode";
const PANEL_KEY = "configOpen";

function applyTheme(mode) {
  if (mode === "system") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", mode);
  }
}

function notifyYTMusicTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs?.[0];
    if (!tab?.id || !tab.url?.startsWith("https://music.youtube.com/")) return;

    chrome.tabs.sendMessage(tab.id, { type: "SETTING_UPDATED" }, () => {
      if (chrome.runtime.lastError) return;
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const autoToggle = document.getElementById("autoVideo");
  const autoRow = document.getElementById("autoRow");
  const configBtn = document.getElementById("configBtn");
  const configPanel = document.getElementById("configPanel");
  const themeBtn = document.getElementById("themeBtn");
  const themeLabel = document.getElementById("themeLabel");
  const themeMenu = document.getElementById("themeMenu");

  if (!autoToggle || !autoRow || !configBtn || !configPanel ||
      !themeBtn || !themeLabel || !themeMenu) return;

  const items = themeMenu.querySelectorAll(".item");

  function setTheme(mode) {
    themeLabel.textContent = mode[0].toUpperCase() + mode.slice(1);
    items.forEach(i => i.classList.toggle("active", i.dataset.value === mode));
    applyTheme(mode);
    chrome.storage.sync.set({ [THEME_KEY]: mode });
  }

  chrome.storage.sync.get(
    { [AUTO_KEY]: true, [THEME_KEY]: "system", [PANEL_KEY]: false },
    (res) => {
      autoToggle.checked = !!res[AUTO_KEY];
      setTheme(res[THEME_KEY]);

      const open = !!res[PANEL_KEY];
      configPanel.classList.toggle("open", open);
      autoRow.style.display = open ? "none" : "flex";
    }
  );

  autoToggle.addEventListener("change", () => {
    chrome.storage.sync.set({ [AUTO_KEY]: autoToggle.checked });
    notifyYTMusicTab();
  });

  configBtn.addEventListener("click", () => {
    const open = !configPanel.classList.contains("open");

    configPanel.classList.toggle("open", open);
    autoRow.style.display = open ? "none" : "flex";

    chrome.storage.sync.set({ [PANEL_KEY]: open });
    themeMenu.classList.remove("open");
  });

  themeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    themeMenu.classList.toggle("open");
  });

  items.forEach(item => {
    item.addEventListener("click", () => {
      setTheme(item.dataset.value);
      themeMenu.classList.remove("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!themeBtn.contains(e.target) && !themeMenu.contains(e.target)) {
      themeMenu.classList.remove("open");
    }
  });
});
