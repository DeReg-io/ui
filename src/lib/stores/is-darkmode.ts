import { readable } from 'svelte/store';
import { browser } from '$app/environment';

export const isDarkmode = readable(false, function (set) {
  if (!browser) return;
  const updateDarkMode = (e: any) => {
    set(e.matches);
  };

  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  updateDarkMode(mql);
  mql.addEventListener('change', updateDarkMode);

  return function () {
    mql.removeEventListener('change', updateDarkMode);
  };
});
