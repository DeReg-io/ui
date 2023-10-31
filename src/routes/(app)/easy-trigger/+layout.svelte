<script lang="ts">
  import EasyTriggerOverview from './EasyTriggerOverview.svelte';
  import type { LayoutData } from './$types';
  import { page } from '$app/stores';
  export let data: LayoutData;
</script>

<div class="px-5 flex flex-row gap-4 overview justify-center">
  <div class="">
    <EasyTriggerOverview easyTriggers={data?.easyTriggers ?? []} />
  </div>
  {#if $page?.params?.triggerId}
    <div class="overflow-scroll">
      <slot />
    </div>
  {/if}
</div>

<style>
  .overview {
    width: 100vw;
  }
</style>
