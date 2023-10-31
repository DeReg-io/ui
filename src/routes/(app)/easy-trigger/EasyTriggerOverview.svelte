<script lang="ts">
  import type { EasyTrigger } from '$lib/schemas/EasyTrigger';
  import CopyText from '../../../lib/components/CopyText.svelte';
  import { env } from '$env/dynamic/public';
  const { PUBLIC_WEBHOOK_URL } = env;
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { unseenETNotifications } from '$lib/stores/unseen-et-notifications';
  import { isDarkmode } from '$lib/stores/is-darkmode';

  unseenETNotifications.init();

  export let easyTriggers: EasyTrigger[];

  let activeTrigger = '';
  let isLoading = false;

  $: activeTrigger = $page.params.triggerId;

  async function goToTrigger(triggerId: string) {
    await goto(`/easy-trigger/settings/${triggerId}`);
  }

  async function goToNotifications(triggerId: string) {
    await goto(`/easy-trigger/notifications/${triggerId}`);
  }

  async function deleteTrigger(triggerId: string) {
    isLoading = true;
    await fetch(`/easy-trigger/settings/${triggerId}`, {
      method: 'DELETE'
    });
    isLoading = false;
    const modal = document.getElementById(triggerId);
    modal?.click();
    await goto(`/easy-trigger/`);
    await invalidateAll();
  }

  async function setTriggerActive(trigger: EasyTrigger) {
    await fetch(`/easy-trigger/settings/${trigger.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ isActive: trigger.isActive })
    });
    await invalidateAll();
  }

  async function triggerWebhook(trigger: EasyTrigger, e: any) {
    e.target.classList.add('loading');
    e.target.setAttribute('disabled', 'disabled');
    // TODO: is this necessary?
    await new Promise((r) => setTimeout(r, 1000));
    const url = `${PUBLIC_WEBHOOK_URL}/${trigger.id}`;
    await fetch(url, {
      mode: 'no-cors',
      method: 'POST'
    });
    e.target.classList.remove('loading');
    e.target.removeAttribute('disabled');
  }
</script>

<!-- <button class="btn mb-3" on:click={() => goToTrigger('new')}>New Trigger</button> -->
<div class="flex items-center justify-start mb-3 easy-trigger-card">
  <a
    data-sveltekit-reload
    role="button"
    class="btn mr-3"
    href="/easy-trigger/settings/new">New Trigger</a
  >
  {#if $page.data.userId}
    <div class="flex">
      <b class="mr-2">UserID: </b>
      <!-- <CopyText label="" noSpacing value={$page.data.userId} /> -->
      <div class="flex-grow user-id-copy-text">
        <CopyText noSpacing={true} value={$page.data.userId} />
      </div>
    </div>
  {/if}
</div>
<!-- a scrollable container on page-->
{#each easyTriggers as trigger}
  <div
    class="card bg-base-100 shadow-xl mb-3 easy-trigger-card"
    class:active={activeTrigger === trigger.id}
  >
    <div class="card-body" on:click|self={() => goToTrigger(trigger.id)}>
      <div class="card-title flex">
        <h2 class="flex-1">{trigger.name}</h2>
        <div class="flex-0 flex">
          {#if trigger.network === 'Mainnet'}
            <div class="badge badge-secondary mr-3">Mainnet</div>
          {:else if trigger.network === 'Goerli'}
            <div class="badge badge-accent mr-3">Goerli</div>
          {:else if trigger.network === 'Sepolia'}
            <div class="badge badge-accent mr-3">Sepolia</div>
          {/if}

          <button
            class="btn btn-link h-auto min-h-0 pl-0 pr-2"
            on:click={() => goToTrigger(trigger.id)}
          >
            {#if $isDarkmode}
              <img class="w-5" src="/edit-light.png" />
            {:else}
              <img class="w-5" src="/edit.png" />
            {/if}
          </button>

          <div class="indicator">
            {#if $unseenETNotifications[trigger.id] > 0}
              <span class="indicator-item badge"
                >{$unseenETNotifications[trigger.id]}</span
              >
            {/if}
            <button
              class="btn btn-link h-auto min-h-0 pl-0 pr-1"
              on:click={() => goToNotifications(trigger.id)}
            >
              {#if $isDarkmode}
                <img class="w-5 p-x1" src="/bell-light.png" />
              {:else}
                <img class="w-5 p-x1" src="/bell.png" />
              {/if}
            </button>
          </div>
        </div>
      </div>

      <div class="flex py-1">
        <input
          name="triggerActive"
          type="checkbox"
          class="toggle toggle-primary mr-3"
          bind:checked={trigger.isActive}
          on:change={() => setTriggerActive(trigger)}
        />
        <p class="flex-0">
          Connection to Contract {trigger.isActive ? 'active' : 'inactive'}
        </p>
      </div>

      <CopyText
        label="Connected Contract"
        value={trigger.contractAddress}
        noSpacing={true}
      />

      <CopyText
        label="Webhook URL"
        value={`${PUBLIC_WEBHOOK_URL}/${trigger.id}`}
        noSpacing={true}
      />

      <div class="card-actions pt-1 flex">
        <div class="flex-1">
          <label for={trigger.id} class="btn btn-error text-primary-content"
            >Delete
          </label>
        </div>
        <button
          class="btn btn-primary justify-end flex-0"
          on:click={(e) => triggerWebhook(trigger, e)}>Trigger Webhook</button
        >
      </div>
    </div>
  </div>
  <input type="checkbox" id={trigger.id} class="modal-toggle" />
  <label for={trigger.id} class="modal cursor-pointer">
    <label class="modal-box relative" for="">
      <h3 class="text-lg font-bold">Delete Trigger <i>{trigger.name}</i></h3>
      <p class="py-4">
        Are you sure you want to delete the trigger <i>{trigger.name}</i>? This
        cannot be undone!
      </p>
      <div class="modal-action flex">
        <div class="flex-1">
          <label id={trigger.id} for={trigger.id} class="btn">Cancel</label>
        </div>
        <div class="flex-0">
          <button
            class="btn btn-error text-primary-content"
            on:click={() => deleteTrigger(trigger.id)}
            class:loading={isLoading}
            disabled={isLoading}
          >
            Delete
          </button>
        </div>
      </div>
    </label>
  </label>
{/each}

<style>
  .active {
    box-shadow: inset 0 4px 8px 0 rgb(0 0 0 / 0.1);
  }

  .easy-trigger-card {
    max-width: 36rem;
  }

  .user-id-copy-text {
    width: 23.5rem;
  }
</style>
