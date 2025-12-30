(() => {
  const KEY = "autoVideoEnabled";

  if (location.hostname !== "music.youtube.com") return;

  let enabled = true;
  let settingLoaded = false;

  function loadSetting() {
    try {
      chrome.storage.sync.get({ [KEY]: true }, (res) => {
        if (chrome.runtime?.lastError) return;
        enabled = !!res[KEY];
        settingLoaded = true;
      });
    } catch (_) {}
  }

  function enableVideoIfAvailable() {
    if (settingLoaded && !enabled) return;

    const toggle = document.querySelector("ytmusic-av-toggle");
    if (!toggle) return;

    // 🔒 If video is not available, YT Music disables the toggle
    if (toggle.hasAttribute("toggle-disabled")) return;

    const videoBtn = toggle.querySelector("button.video-button.ytmusic-av-toggle");
    if (!videoBtn) return;

    const pressed = videoBtn.getAttribute("aria-pressed") === "true";
    const disabled =
      videoBtn.disabled ||
      videoBtn.getAttribute("aria-disabled") === "true";

    if (disabled || pressed) return;

    videoBtn.click();
  }

  function scheduleChecks() {
    enableVideoIfAvailable();
    setTimeout(enableVideoIfAvailable, 800);
    setTimeout(enableVideoIfAvailable, 2000);
    setTimeout(enableVideoIfAvailable, 4000);
  }

  loadSetting();
  scheduleChecks();

  let last = 0;
  const mo = new MutationObserver(() => {
    const now = Date.now();
    if (now - last < 700) return;
    last = now;
    enableVideoIfAvailable();
  });

  mo.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("yt-navigate-finish", () =>
    setTimeout(enableVideoIfAvailable, 500), true);

  window.addEventListener("popstate", () =>
    setTimeout(enableVideoIfAvailable, 500), true);

  try {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg?.type === "SETTING_UPDATED") {
        loadSetting();
        scheduleChecks();
      }
    });
  } catch (_) {}
})();
