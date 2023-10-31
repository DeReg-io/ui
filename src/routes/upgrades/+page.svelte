<script lang="ts">
  import type { PageData } from './$types';
  import { browser } from '$app/environment';
  import ContractOwner from './ContractOwner.svelte';
  import { isDarkmode } from '$lib/stores/is-darkmode';
  import { timeAgo } from '$lib/util/time-ago';
  import { sortBy } from '$lib/util/sort-by-string';

  export let data: PageData;
  console.log('data ;', data);

  let tableData = data.table;

  // TODO: sort should be only 2 variables, one which field
  // and one which direction
  let sortDate: 'asc' | 'desc' | null = 'desc';
  let sortTvl: 'asc' | 'desc' | null = null;
  let sortOwner: 'asc' | 'desc' | null = null;
  let sortContract: 'asc' | 'desc' | null = null;
  let filterOwner: 'multisig' | 'EOA' | 'unknownProxyAdminContract' | 'none' =
    'none';

  let searchStr = '';

  $: if (sortDate) {
    tableData = sortBy(tableData, 'lastUpgrade', sortDate);
  }

  $: if (sortTvl) {
    tableData = sortBy(tableData, 'tvl', sortTvl);
  }

  $: if (sortContract) {
    tableData = sortBy(tableData, 'name', sortContract);
  }

  $: if (sortOwner) {
    let thresholdSorted = sortBy(tableData, 'owner.threshold', sortOwner);
    tableData = sortBy(thresholdSorted, 'owner.addressType', sortOwner);
  }

  $: if (filterOwner !== 'none') {
    console.log('filterOwner: ', filterOwner);
    tableData = data.table.filter(
      (row) => row?.owner?.addressType === filterOwner
    );
  } else {
    tableData = data.table;
  }

  $: if (searchStr) {
    tableData = data.table.filter((row) => {
      return (
        row.name.toLowerCase().includes(searchStr.toLowerCase()) ||
        row.address.toLowerCase().includes(searchStr.toLowerCase())
      );
    });
  } else {
    tableData = data.table;
  }

  function resetSorts(exception: string) {
    if (exception !== 'sortDate') {
      sortDate = null;
    }
    if (exception !== 'sortTvl') {
      sortTvl = null;
    }
    if (exception !== 'sortOwner') {
      sortOwner = null;
    }
    if (exception !== 'sortContract') {
      sortContract = null;
    }
  }

  let locale = 'en-US';
  if (browser) {
    locale = navigator.language;
  }
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD'
  });

  function getEtherscanLink(address: string) {
    return `https://etherscan.io/address/${address}`;
  }
</script>

<div class="w-max mx-auto">
  <div class="flex">
    <input
      type="text"
      placeholder="Search for address or contract name"
      class="input input-bordered w-96 mb-3"
      bind:value={searchStr}
    />
    <select
      class="select select-bordered w-42 ml-auto flex-0"
      bind:value={filterOwner}
    >
      <option disabled value="none">Owner Type</option>
      <option value="multisig">Multisig</option>
      <option>EOA</option>
      <option value="unknownProxyAdminContract">unknown</option>
      <option value="none">None</option>
    </select>
  </div>
  <table class="table">
    <!-- head -->
    <thead>
      <tr>
        <th
          class="cursor-pointer"
          on:click={() => {
            resetSorts('sortContract');
            sortContract === 'desc'
              ? (sortContract = 'asc')
              : (sortContract = 'desc');
          }}
          >Contract
          {#if sortContract === 'desc'}
            ↓
          {:else if sortContract === 'asc'}
            ↑
          {/if}
        </th>
        <th
          class="cursor-pointer"
          on:click={() => {
            resetSorts('sortDate');
            sortDate === 'desc' ? (sortDate = 'asc') : (sortDate = 'desc');
          }}
          >Last Upgrade
          {#if sortDate === 'desc'}
            ↓
          {:else if sortDate === 'asc'}
            ↑
          {/if}
        </th>
        <th
          class="cursor-pointer"
          on:click={() => {
            resetSorts('sortTvl');
            sortTvl === 'desc' ? (sortTvl = 'asc') : (sortTvl = 'desc');
          }}
          >TVL ($)
          {#if sortTvl === 'desc'}
            ↓
          {:else if sortTvl === 'asc'}
            ↑
          {/if}
        </th>
        <th
          class="cursor-pointer"
          on:click={() => {
            resetSorts('sortOwner');
            sortOwner === 'desc' ? (sortOwner = 'asc') : (sortOwner = 'desc');
          }}
          >Owner Type
          {#if sortOwner === 'desc'}
            ↓
          {:else if sortOwner === 'asc'}
            ↑
          {/if}
        </th>
      </tr>
    </thead>
    <tbody>
      {#each tableData as { name, lastUpgrade, tvl, owner, address }}
        <tr>
          <th>
            <a href={getEtherscanLink(address)} class="flex" target="_blank">
              {name}
              {#if $isDarkmode}
                <img src="open-link-light.png" alt="->" class="w-6" />
              {:else}
                <img src="open-link.png" alt="->" class="w-6" />
              {/if}
            </a>
          </th>
          <td>
            {#if lastUpgrade}
              <div
                class="tooltip"
                data-tip={new Date(lastUpgrade).toLocaleDateString()}
              >
                {timeAgo(lastUpgrade)}
              </div>
            {:else}
              -
            {/if}
          </td>
          <td>{tvl ? formatter.format(tvl) : 0}</td>
          <td><ContractOwner {owner} /></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
