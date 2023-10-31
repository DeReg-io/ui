import type { EasyTriggerNotification } from '$lib/db';
import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

// do polling every 5 seconds
async function fetchData(triggerId: string, set) {
  if (!browser) return;
  if (!triggerId) return;
  try {
    const response = await fetch(
      `/easy-trigger/notifications?type=allNotifications&triggerId=${triggerId}`,
      {
        method: 'GET'
      }
    );
    const data = await response.json();
    set(data);
  } catch (err) {
    console.error('Error fetching notifications: ', err);
    set([]);
  }
}

function createNotificationsStore() {
  let triggerId: string;
  const { subscribe, set } = writable<EasyTriggerNotification[]>([], () => {
    const pollingInterval = setInterval(() => {
      fetchData(triggerId, set);
    }, 3000);
    return () => {
      clearInterval(pollingInterval);
    };
  });

  return {
    subscribe,
    fetchData: (_triggerId: string) => {
      triggerId = _triggerId;
      return fetchData(triggerId, set);
    },
    setAllSeen: async () => {
      if (!browser) return;
      const data = get({ subscribe });
      try {
        await fetch(`/easy-trigger/notifications`, {
          method: 'PATCH',
          body: JSON.stringify({ ids: data.map((n) => n.id) })
        });
        data.forEach((n) => (n.seen = true));
        return data;
      } catch (err) {
        console.error('Error setting notifications as seen: ', err);
        return data;
      }
    }
  };
}

export const easyTriggerNotifications = createNotificationsStore();
