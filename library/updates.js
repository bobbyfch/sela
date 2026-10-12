// Generated from app/library/updates.ts by npm run build. Do not edit.
(function(root) {
  "use strict";
  const endpoint = "https://api.github.com/repos/bobbyfch/sela/releases";
  function version(value) {
    const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-(beta)(?:\.(\d+))?)?$/.exec(value || "");
    return match ? [...match.slice(1, 4).map(Number), match[4] || "", Number(match[5] || 0)] : null;
  }
  function newer(remote, current) {
    const a = version(remote), b = version(current);
    if (!a || !b || a[3] && !b[3]) return false;
    for (let i = 0; i < 3; i++) {
      if (a[i] !== b[i]) return a[i] > b[i];
    }
    if (a[3] !== b[3]) return !a[3];
    return a[4] > b[4];
  }
  async function check(current, request = root.fetch.bind(root)) {
    const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 8e3);
    const beta = !!version(current)?.[3];
    try {
      const response = await request(endpoint + (beta ? "?per_page=100" : "/latest"), { signal: controller.signal, credentials: "omit", referrerPolicy: "no-referrer", headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error("Update service unavailable (" + response.status + ")");
      const payload = await response.json();
      let release = payload;
      if (beta) {
        if (!Array.isArray(payload)) throw new Error("Invalid release information");
        const candidates = payload.filter((item) => !item.draft && version(item.tag_name));
        release = candidates.reduce((best, item) => !best || newer(item.tag_name, best.tag_name) ? item : best, null);
        if (!release) throw new Error("Invalid release information");
      }
      if (release.draft || !beta && release.prerelease || !version(release.tag_name)) throw new Error("Invalid release information");
      const tag = release.tag_name;
      return { checked: Date.now(), version: tag.replace(/^v/, ""), available: newer(tag, current), url: "https://github.com/bobbyfch/sela/releases/tag/" + tag };
    } finally {
      clearTimeout(timer);
    }
  }
  root.SelaUpdates = { check, newer };
})(globalThis);
