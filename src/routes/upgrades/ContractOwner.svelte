<script lang="ts">
  import { AddressType, type AddressOwner } from '$lib/types';
  export let owner: AddressOwner | undefined;
</script>

{#if !owner || !owner.addressType}
  -
{:else if owner.addressType === AddressType.EOA}
  <div
    class="tooltip"
    data-tip={'EOA: Externally-Owned Account. Controlled by anyone with the private keys.'}
  >
    <div class="badge badge-secondary">EOA</div>
  </div>
{:else if owner.addressType === AddressType.multisig}
  <div
    class="tooltip"
    data-tip={'Multisig (multiple-signature) require multiple valid signatures to execute a transaction. The threshold defines how many signatures are required.'}
  >
    <div class="badge badge-primary">
      {owner.threshold}/{owner.multisigLength} Multisig
    </div>
  </div>
{:else}
  <!-- <div class="badge">{owner.addressType}</div> -->
  <div class="badge">unknown</div>
{/if}
