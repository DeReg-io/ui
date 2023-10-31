<script lang="ts">
  import { page } from '$app/stores';
  import { onMount, onDestroy } from 'svelte';
  import type { PageData } from './$types';
  import _ from 'lodash';
  import BaseEChart from '$lib/components/ECharts/BaseEChart.svelte';
  import getBoxplotOptions from './boxplot-gcb-break';
  import getBarchartOptions from './barchart';
  import type { EChartsOption, time } from 'echarts';
  import { isDarkmode } from '$lib/stores/is-darkmode';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { invalidateAll } from '$app/navigation';
  import Stats from './Stats.svelte';

  export let data: PageData;

  let loading = false;

  let addresses = '';
  let selectedToken = '';
  let timeRange = '1h';
  let autoRefresh = false;

  let tokens: string[] = [];
  let netFlow = 0;
  let maxTvlPercentage = 30;
  let boxplotOption: EChartsOption = {};
  let barchartOption: EChartsOption = {};
  // let maxOutflowExceeded = false;

  let interval: any;
  $: {
    if (autoRefresh) {
      interval = setInterval(async () => {
        invalidateAll();
      }, 12_000);
    } else {
      clearInterval(interval);
    }
  }

  $: onNewData(data);
  function onNewData(_data: PageData) {
    if (!_data.data) return;
    tokens = _.uniq([
      ...Object.keys(_data.data.perTokenInflow),
      ...Object.keys(_data.data.perTokenOutflow)
    ]);

    const token = $page.url.searchParams.get('token');
    if (token && tokens.includes(token)) {
      selectedToken = token;
    } else if (tokens.length) {
      selectedToken = tokens[0];
    }

    const range = $page.url.searchParams.get('range');
    if (range) {
      timeRange = range;
    } else {
      $page.url.searchParams.set('range', timeRange);
      const url = $page.url.toString();
      if (browser) {
        window.history.pushState({ path: url }, '', url);
      }
    }
  }

  $: if (data.data && selectedToken) {
    netFlow =
      data.data.perTokenInflowSum[selectedToken] -
      data.data.perTokenOutflowSum[selectedToken];

    const tokenOutflow = data.data.perTokenOutflowSum[selectedToken];
    const maxValue =
      (data.data.perTokenCurrentTvl[selectedToken] + tokenOutflow) *
      maxTvlPercentage *
      0.01;

    // maxOutflowExceeded = tokenOutflow > maxValue;

    boxplotOption = getBoxplotOptions({
      symbol: selectedToken,
      maxValue,
      currentValue: tokenOutflow,
      isDarkmode: $isDarkmode
    });
    barchartOption = getBarchartOptions({
      symbol: selectedToken,
      inflow: data.data.perTokenInflow[selectedToken] || [],
      outflow: data.data.perTokenOutflow[selectedToken] || [],
      isDarkmode: $isDarkmode
    });

    if (browser) {
      $page.url.searchParams.set('token', selectedToken);
      const url = $page.url.toString();
      window.history.pushState({ path: url }, '', url);
    }
  }

  let changeAddressTimeout: any;
  function setAddresses(e: any) {
    addresses = e.target.value.trim();
    if (addresses) {
      if (changeAddressTimeout) {
        clearTimeout(changeAddressTimeout);
      }
      changeAddressTimeout = setTimeout(gotoNewAddresses, 300);
    }
  }

  async function setTimerange(range: string) {
    timeRange = range;
    if (browser) {
      $page.url.searchParams.set('range', range);
      const url = $page.url.toString();
      loading = true;
      await goto(url, { invalidateAll: true });
      loading = false;
    }
  }

  onMount(async () => {
    const addressesQuery =
      $page.url.searchParams.get('addresses')?.split(',') || [];
    if (addressesQuery.length) {
      addresses = addressesQuery[0];
    }
  });

  async function gotoNewAddresses() {
    if (browser) {
      loading = true;
      $page.url.searchParams.set('addresses', addresses);
      const url = $page.url.toString();
      await goto(url, { invalidateAll: true });
      loading = false;
    }
  }
</script>

<div
  class="flex flex-wrap gap-y-3 justify-items-center justify-center items-center"
>
  {#if loading}
    <button class="btn btn-sm btn-square btn-ghost loading" />
  {/if}
  <div class="form-control max-w-xs">
    <input
      type="text"
      placeholder="Enter address"
      class="input input-bordered w-72 input-sm"
      on:input={setAddresses}
      value={addresses}
    />
  </div>
  <select
    class="select select-bordered max-w-xs ml-3 select-sm"
    disabled={!tokens.length}
    bind:value={selectedToken}
  >
    <option value="" disabled selected>Choose Token</option>
    {#each tokens as token}
      <option value={token}>{token}</option>
    {/each}
  </select>
  <div>
    <div class="input-group ml-3">
      <input
        type="number"
        class="input input-bordered w-16 input-sm join-item"
        bind:value={maxTvlPercentage}
      />
      <span class="whitespace-nowrap">% max TVL outflow</span>
    </div>
  </div>
  <div class="flex flex-row">
    {#each ['24h', '12h', '6h', '3h', '1h', '30m'] as range}
      <a
        class="link ml-5"
        class:link-primary={timeRange === range}
        class:font-bold={timeRange === range}
        on:click={() => setTimerange(range)}
        on:keypress={() => setTimerange(range)}
        >{range}
      </a>
    {/each}
  </div>
  <div class="form-control ml-3">
    <label class="cursor-pointer label">
      <input
        type="checkbox"
        class="toggle toggle-primary mr-1"
        bind:checked={autoRefresh}
      />
      <span class="label-text">Auto Refresh</span>
    </label>
  </div>
</div>

{#if data.error}
  <div
    class="w-full flex justify-items-center justify-center items-center mt-7"
  >
    <div
      class="alert alert-error w-96 justify-start"
      class:alert-info={data.error.includes('Not enough transfers found') ||
        data.error.includes('No address provided')}
      class:alert-error={!data.error.includes('Not enough transfers found') &&
        !data.error.includes('No address provided')}
    >
      {#if data.error.includes('Not enough transfers found') || data.error.includes('No address provided')}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 w-6 h-6"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          /></svg
        >
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          /></svg
        >
      {/if}
      {#if data.error.includes('No address provided')}
        <span class="block">
          No address provided. Click <a
            href="https://app.dereg.io/gcb?addresses=0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
            class="link link-primary">here</a
          > for an example.
        </span>
      {:else}
        <p>{data.error}</p>
      {/if}
    </div>
  </div>
{:else}
  {#if selectedToken && data.data}
    <div
      class="flex flex-wrap gap-y-3 justify-items-center justify-center items-center mt-5"
    >
      <Stats {data} {selectedToken} {netFlow} />
    </div>
  {/if}

  {#if data.data}
    <div class="flex items-center p-0">
      <div class="grow mt-7 md:mx-0 mx-3">
        <BaseEChart option={boxplotOption} notMerge={true} />
      </div>
    </div>
    <div
      class="flex items-center justify-center justify-items-center w-full px-3"
    >
      <div class="alert alert-info md:w-1/2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 w-6 h-6"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          /></svg
        >
        <span
          >The chart above emulates how the ERC-7265 circuit breaker acts on
          given parameters. It throttles at the selected percentage of TVL ({maxTvlPercentage}%).
          The threshold is calculated by the current TVL + the outflows of the
          selected time range ({timeRange}).</span
        >
      </div>
    </div>
    <div class="flex items-center p-0">
      <div class="grow mt-7 md:mx-0 mx-3">
        <BaseEChart option={barchartOption} notMerge={true} height={500} />
      </div>
    </div>
  {/if}
{/if}
