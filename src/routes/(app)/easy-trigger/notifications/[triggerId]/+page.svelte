<script lang="ts">
  import type { EasyTrigger } from '$lib/schemas/EasyTrigger';
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { easyTriggerNotifications } from '$lib/stores/easy-trigger-notifications';
  import type { EasyTriggerNotification } from '$lib/db';
  import { onMount } from 'svelte';
  import JSONTree from 'svelte-json-tree';

  export let data: PageData;
  let trigger: EasyTrigger | undefined;
  $: {
    const triggerId = $page.params.triggerId;
    trigger = data?.easyTriggers?.find((t) => t.id === triggerId);
    easyTriggerNotifications.fetchData(triggerId).then(() => {
      easyTriggerNotifications.setAllSeen();
    });
  }

  async function onTabFocus() {
    if (document.visibilityState === 'visible') {
      easyTriggerNotifications.setAllSeen();
    }
  }

  function parseBody(bodyStr: string) {
    const cleandedBodyStr = bodyStr;
    // .replaceAll('\\"', '"')
    // .replaceAll('\\n', '"')
    // .replaceAll('\\\\', '"')
    // .replaceAll('""', '"')
    // .slice(1, -1);
    // const parsed = JSON.parse(JSON.parse(cleandedBodyStr));
    const parsed = JSON.parse(cleandedBodyStr);
    return parsed;
  }

  onMount(() => {
    document.addEventListener('visibilitychange', onTabFocus);
    return () => {
      document.removeEventListener('visibilitychange', onTabFocus);
    };
  });

  function getTransactionEtherscanUrl(notification: EasyTriggerNotification) {
    if (!notification.transactionHash || !notification.network) return '-';
    if (notification.network === 'Mainnet') {
      return `https://etherscan.io/tx/${notification.transactionHash}`;
    } else if (notification.network === 'Goerli') {
      return `https://goerli.etherscan.io/tx/${notification.transactionHash}`;
    } else if (notification.network === 'Sepolia') {
      return `https://sepolia.etherscan.io/tx/${notification.transactionHash}`;
    }
  }
</script>

<h1 class="text-2xl pb-3 pl-3">Notifications for <i>{trigger?.name}</i></h1>
<div class="overflow-x-auto">
  <table class="table w-full">
    <!-- head -->
    <thead>
      <tr>
        <th class="!relative">Timestamp</th>
        <th>Contract <br />Called</th>
        <th>Domain <br />Verified</th>
        <th>Caller Url</th>
        <th>Transaction <br />Details</th>
        <th>Body</th>
      </tr>
    </thead>
    <tbody>
      {#each $easyTriggerNotifications as notification}
        <tr>
          <td>{new Date(notification.createdAt).toLocaleString()}</td>
          <td>
            {#if notification.triggeredContract}
              <div class="badge badge-primary">Yes</div>
            {:else}
              <div class="badge">No</div>
            {/if}
          </td>
          <td>
            {#if notification.verifiedDomain}
              <div class="badge badge-primary">Yes</div>
            {:else}
              <div class="badge">No</div>
            {/if}
          </td>
          <td>{notification.callerUrl}</td>
          <td>
            {#if notification.transactionHash}
              <a
                href={getTransactionEtherscanUrl(notification)}
                class="link"
                target="_blank">etherscan</a
              >
            {:else}
              -
            {/if}
          </td>
          <td>
            {#if notification.body && notification.body !== 'null'}
              <label for={notification.id} class="btn btn-link">view</label>
              <input
                type="checkbox"
                id={notification.id}
                class="modal-toggle"
              />
              <div class="modal">
                <div class="modal-box relative w-10/12 max-w-5xl">
                  <h3 class="text-lg font-bold">Body</h3>
                  <div class="flex py-2">
                    <p class="flex-1">
                      Copy Body

                      <button
                        class="btn btn-link h-auto min-h-0"
                        on:click={() =>
                          navigator.clipboard.writeText(
                            JSON.stringify(
                              parseBody(notification.body),
                              null,
                              2
                            )
                          )}
                      >
                        <img class="flex-none w-5" src="/copy.png" alt="C" />
                      </button>
                    </p>
                    {#if parseBody(notification.body)?.alerts && parseBody(notification.body)?.alerts[0]?.links?.explorerUrl}
                      <a
                        href={parseBody(notification.body).alerts[0].links
                          .explorerUrl}
                        target="_blank"
                        class="btn btn-link">View on Forta Explorer</a
                      >
                    {/if}
                  </div>

                  <div class="shadow-inner p-3">
                    <JSONTree value={parseBody(notification.body)} />
                  </div>
                  <div class="modal-action flex">
                    <div class="flex-1">
                      <label
                        id={notification.id}
                        for={notification.id}
                        class="btn">Close</label
                      >
                    </div>
                  </div>
                </div>
              </div>
            {:else}
              -
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
</style>
