import { lazy } from 'react';

const RELOAD_KEY = 'chunk-reload-at';
const RELOAD_WINDOW_MS = 10000;

/**
 * React.lazy that recovers from a stale deploy. After a new release the old
 * chunk files are gone, so a tab opened before the deploy can't load the next
 * page. Reload once to pick up the new build; if the reload also fails within
 * a few seconds, surface the error instead of looping.
 */
export default function lazyWithRetry(factory) {
  return lazy(async () => {
    try {
      const module = await factory();
      try { sessionStorage.removeItem(RELOAD_KEY); } catch { /* storage blocked */ }
      return module;
    } catch (error) {
      let lastReload = 0;
      try { lastReload = Number(sessionStorage.getItem(RELOAD_KEY)) || 0; } catch { /* storage blocked */ }

      if (Date.now() - lastReload > RELOAD_WINDOW_MS) {
        try { sessionStorage.setItem(RELOAD_KEY, String(Date.now())); } catch { /* storage blocked */ }
        window.location.reload();
        return new Promise(() => {}); // keep the fallback on screen while the page reloads
      }
      throw error;
    }
  });
}
