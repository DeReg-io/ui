<script lang="ts">
  import { isDarkmode } from '$lib/stores/is-darkmode';

  export let label: string = '';
  export let value: string;
  export let tooltip: string = '';
  export let noSpacing: boolean = false;
  export let labelLeft: boolean = false;
  let justCopied = false;

  function onCopy() {
    navigator.clipboard.writeText(value);
    justCopied = true;
    setTimeout(() => {
      justCopied = false;
    }, 700);
  }
</script>

<div class:gap-0={noSpacing}>
  {#if label}
    <label class="label justify-start" class:p-0={noSpacing}>
      <span class="label-text">{label}</span>
      {#if tooltip}
        <span class="tooltip" data-tip={tooltip}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="stroke-info w-5 h-5 ml-1"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            /></svg
          >
        </span>
      {/if}
    </label>
  {/if}
  <div class="flex items-center justify-center">
    <p class="truncate copy-text">
      {value}
    </p>
    <button class="btn btn-link h-auto min-h-0" on:click={onCopy}>
      {#if justCopied}
        <input type="checkbox" checked class="checkbox checkbox-primary" />
      {:else if $isDarkmode}
        <img class="flex-none w-5" src="/copy-light.png" alt="C" />
      {:else}
        <img class="flex-none w-5" src="/copy.png" alt="C" />
      {/if}
    </button>
  </div>
</div>

<style>
  .copy-text::-webkit-scrollbar {
    display: none;
  }

  .copy-text {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    white-space: nowrap;
  }
</style>
