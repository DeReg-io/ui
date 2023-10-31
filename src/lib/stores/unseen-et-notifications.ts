import { writable } from 'svelte/store';
import { browser } from '$app/environment';

async function fetchData(set) {
  if (!browser) return;
  const response = await fetch(`/easy-trigger/notifications?type=unseenCount`, {
    method: 'GET'
  });
  const data = await response.json();
  set(data);
}

function createUnseenETNotifications() {
  const { subscribe, set } = writable<Record<string, number>>({}, () => {
    const pollingInterval = setInterval(() => {
      fetchData(set);
    }, 3000);
    return () => {
      clearInterval(pollingInterval);
    };
  });

  return {
    subscribe,
    init: async () => {
      return fetchData(set);
    }
  };
}

export const unseenETNotifications = createUnseenETNotifications();
