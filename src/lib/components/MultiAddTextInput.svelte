<script lang="ts">
  import { isDarkmode } from '$lib/stores/is-darkmode';

  export let value = [''];
  export let inputName = 'multi-add-text-input';
  export let errors = {};
  export let placeholder = 'Enter text...';

  function addValue() {
    if (value[value.length - 1] !== '') {
      value = value.concat('');
    }
  }

  // function that takes a date and adds a day
  function addDay(date) {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    return newDate;
  }
</script>

{#each value as val, i}
  {#if i !== value.length - 1}
    <div class="input-group">
      <input
        type="text"
        {placeholder}
        bind:value={val}
        class="input input-bordered flex-1"
        class:input-error={errors[`${inputName}.${i}`]}
        name={`${inputName}.${i}`}
      />
      <button
        class="btn btn-neutral p-0"
        on:click|preventDefault={() =>
          (value = value.filter((_, j) => j !== i))}
      >
        {#if $isDarkmode}
          <img class="flex-none w-12 p-3" src="/trash-light.png" alt="C" />
        {:else}
          <img class="flex-none w-12 p-3" src="/trash-white.png" alt="C" />
        {/if}
      </button>
    </div>
    {#if errors[`${inputName}.${i}`]}
      <label class="label">
        <span class="label-text text-red-500"
          >{errors[`${inputName}.${i}`]}</span
        >
      </label>
    {/if}
    <div class="mb-2" />
  {:else}
    <div class="flex">
      <input
        type="text"
        {placeholder}
        class="input input-bordered w-full flex-1"
        bind:value={val}
        class:input-error={errors[`${inputName}.${i}`]}
        name={`${inputName}.${i}`}
      />
      <button class="btn flex-0 ml-2" on:click|preventDefault={addValue}
        >Add</button
      >
    </div>
    {#if errors[`${inputName}.${i}`]}
      <label class="label">
        <span class="label-text text-red-500"
          >{errors[`${inputName}.${i}`]}</span
        >
      </label>
    {/if}
  {/if}
{/each}
