<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';
  import MultiAddTextInput from '../../../../../lib/components/MultiAddTextInput.svelte';
  import CopyText from '../../../../../lib/components/CopyText.svelte';
  import { env } from '$env/dynamic/public';
  const { PUBLIC_WEBHOOK_URL } = env;
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  let formHasChanges = false;
  let nameInputRef;
  let isLoading = false;

  let allowlistActive = false;
  const defaultAllowList = [''];
  let allowlist = defaultAllowList;

  export let form: ActionData;
  export let data: PageData;
  let existingData: ActionData | PageData;
  let errors;

  function updateData(form, data) {
    existingData = form ?? { formData: data };
    allowlist = existingData?.formData.allowlist ?? defaultAllowList;
    if (!allowlist.length) {
      allowlist = [''];
    }
    allowlistActive =
      existingData?.formData.allowlistActive === undefined
        ? false
        : existingData?.formData?.allowlistActive;
  }

  $: updateData(form, data);

  $: {
    $page.params.triggerId;
    formHasChanges = false;
    if (nameInputRef) {
      nameInputRef.focus();
    }
  }

  // onMount(() => {
  //   nameInputRef.focus();
  // });

  // $: {
  //   // activeTrigger = $page.params.triggerId;
  //   console.log('got new data');
  //   console.log('data: ', data);
  //   console.log('form: ', form);
  //   existingData = form ?? { formData: data };
  //   console.log('existingData: ', existingData);
  // }

  async function setFormData() {
    isLoading = true;
    // const idBefore = existingData?.formData?.id;
    return async ({ result }) => {
      // existingData = result.data;
      // allowlist = result.data.formData.allowlist ?? defaultAllowList;
      // allowlistActive = result.data.formData.allowlistActive;
      if (result.data.errors) {
        errors = result.data.errors;
      } else {
        errors = null;
        formHasChanges = false;
      }
      // if (result.data.formData.id !== idBefore) {
      await goto(`/easy-trigger/settings/${result.data.formData.id}`, {
        invalidateAll: true
      });
      isLoading = false;
      // }
    };
  }

  function onFormChange() {
    formHasChanges = true;
  }
</script>

<div class="flex justify-center">
  <form
    id="easy-trigger-form"
    class="p-3"
    action="?/trigger"
    method="POST"
    use:enhance={setFormData}
    on:input={onFormChange}
  >
    {#if !existingData?.formData?.id}
      <h1 class="text-2xl pb-3">New Easy Trigger</h1>
    {/if}
    <div class="form-control w-full hidden">
      <!-- TODO: replace with routes -->
      <label class="label">
        <span class="label-text">Trigger ID</span>
      </label>
      <input
        name="id"
        type="text"
        placeholder="Type here"
        class="input input-bordered w-full"
        value={existingData?.formData?.id ?? 'new'}
      />
    </div>

    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">Trigger Name</span>
      </label>
      <input
        name="name"
        type="text"
        placeholder="Name for trigger..."
        class="input input-bordered w-full"
        value={existingData?.formData?.name ?? ''}
        class:input-error={errors?.name}
        bind:this={nameInputRef}
      />
      {#if errors?.name}
        <label class="label">
          <span class="label-text text-red-500">{errors?.name}</span>
        </label>
      {/if}
    </div>

    <div class="form-control w-full mb-2">
      <label class="label">
        <span class="label-text">Network</span>
      </label>
      <select
        class="select select-bordered w-full"
        name="network"
        value={existingData?.formData?.network ?? 'Sepolia'}
      >
        <option selected>Sepolia</option>
        <option selected>Goerli</option>
        <!-- <option>Mainnet</option> -->
      </select>
    </div>

    <div class="alert shadow-md mt-2">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-info flex-shrink-0 w-6 h-6"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          /></svg
        >
        <p>
          Make sure your contract inherits from <i>Triggerable</i> passing your
          <i>UserID</i>
          from top right of this page.
          <br />
          Check out our
          <a
            href="https://dereg-io.github.io/docs/"
            target="_blank"
            class="underline">documentation</a
          >
          for more info and examples.
        </p>
      </div>
    </div>

    <div class="form-control w-full">
      <label class="label">
        <span class="label-text">Contract Address</span>
      </label>
      <input
        name="contractAddress"
        type="text"
        placeholder="Enter Contract Address..."
        class="input input-bordered w-full"
        class:input-error={errors?.contractAddress}
        value={existingData?.formData?.contractAddress ?? ''}
      />

      {#if errors?.contractAddress}
        <label class="label">
          <span class="label-text text-red-500">{errors?.contractAddress}</span>
        </label>
      {/if}
    </div>

    <!--
	<div class="form-control w-full">
		<label class="label justify-start">
			<span class="label-text">Webhook (Forta, Custom Trigger)</span>
			<span
				class="tooltip"
				data-tip="Calling this Webhook via a POST request will call the xxx function of the above contract. You can add this Webhook to any Forta bot."
			>
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
		</label>
		<p>-</p>
		<div class="input-group">
			<input
				type="text"
				value="https://dereg.blaasfvie.com?asdf=asdfeaasdfasdfasdfasfawefasefasefaf"
				class="input input-bordered flex-1"
				readonly
			/>
			<button class="btn btn-outline p-0 border-gray-300">
				<img class="flex-none w-12 p-3" src="/copy.png" alt="C" />
			</button>
		</div>
	</div>
    -->

    <div class="form-control">
      <label class="label justify-start">
        <span class="label-text">Allowlist for specific domains</span>
        <span
          class="tooltip"
          data-tip="Recommended: Only allow specific domains to call the Webhook."
        >
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
      </label>
      <input
        name="allowlistActive"
        type="checkbox"
        class="toggle toggle-primary"
        bind:checked={allowlistActive}
      />
    </div>

    {#if !allowlistActive}
      <div class="alert alert-warning shadow-md mt-3">
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current flex-shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            /></svg
          >
          <span
            ><p class="font-bold">Public: Do not share this Webhook!</p>
            <p />
            We recommend to use the allowlist to limit domains that can call your
            Webhook.
            <p />
            <a
              class="underline"
              href="https://dereg-io.github.io/docs/"
              target="_blank">Read the docs</a
            >
          </span>
        </div>
      </div>
    {/if}

    {#if allowlistActive}
      <div class="form-control mt-3">
        <MultiAddTextInput
          placeholder="Enter domain..."
          inputName="allowlist"
          bind:value={allowlist}
          errors={errors ?? {}}
        />
      </div>
    {/if}

    <div class="alert shadow-md mt-2">
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-info flex-shrink-0 w-6 h-6"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          /></svg
        >
        <p>
          After you create the Webhook, the trigger to your smart contract will
          be inactive at first. Even when inactive, you will get notifications
          for the Webhook here, for easier testing. The Webhook Url is generated
          after you save.
        </p>
      </div>
    </div>
    <!-- {#if form?.formData.id} -->
    <!-- TODO: replace with routes -->
    {#if existingData?.formData?.id}
      <div class="form-control w-full mt-2">
        <CopyText
          label="Webhook"
          tooltip="Calling this Webhook via a POST request will call the xxx function of the given contract. You can add this Webhook to any Forta bot."
          value={`${PUBLIC_WEBHOOK_URL}/${existingData?.formData.id}`}
        />
      </div>
    {/if}

    <div class="flex justify-between mt-5">
      <!--<button class="btn btn-secondary">Test Trigger</button> -->
      {#if formHasChanges}
        <button
          class="btn btn-primary"
          class:loading={isLoading}
          disabled={isLoading}>Save & Create Webhook</button
        >
      {:else}
        <button class="btn btn-primary btn-disabled">Saved</button>
      {/if}
    </div>
  </form>
</div>

<style>
  #easy-trigger-form {
    max-width: 32rem;
  }
</style>
