(() => {
  const LOG = (...a) => console.log("[YTMusic Auto Video]", ...a);
  const KEY = "autoVideoEnabled";

  if (location.hostname !== "music.youtube.com") return;

  function getSetting() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({ [KEY]: true }, (res) => resolve(!!res[KEY]));
    });
  }

  async function enableVideoIfAvailable() {
    const enabled = await getSetting();
    if (!enabled) return;

    const btn = document.querySelector("button.video-button.ytmusic-av-toggle");
    if (!btn) return;

    const pressed = btn.getAttribute("aria-pressed") === "true";
    const disabled = btn.disabled || btn.getAttribute("aria-disabled") === "true";

    if (disabled || pressed) return;

    LOG("Video button found -> clicking");
    btn.click();
  }

  function scheduleChecks() {
    enableVideoIfAvailable();
    setTimeout(enableVideoIfAvailable, 800);
    setTimeout(enableVideoIfAvailable, 2000);
    setTimeout(enableVideoIfAvailable, 4000);
  }

  // Initial + retries
  scheduleChecks();

  // DOM changes (new song / UI rebuild)
  let last = 0;
  const mo = new MutationObserver(() => {
    const now = Date.now();
    if (now - last < 700) return;
    last = now;
    enableVideoIfAvailable();
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });

  // SPA navigation events
  window.addEventListener("yt-navigate-finish", () => setTimeout(enableVideoIfAvailable, 500), true);
  window.addEventListener("popstate", () => setTimeout(enableVideoIfAvailable, 500), true);

  // Listen for popup changes (instant response)
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "SETTING_UPDATED") {
      LOG("Setting updated, re-checking…");
      scheduleChecks();
    }
  });
})();
