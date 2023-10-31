<script lang="ts">
  import type { SiweMessage } from 'siwe';
  import { logger } from '$lib/logger';
  import { goto } from '$app/navigation';
  import { BrowserProvider } from 'ethers';

  let ethError: string | null = null;
  let isLoadingEth = false;

  async function createSiweMessage(address: string, statement: string) {
    console.log('creating siwe message');
    const response = await fetch('/siwe/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address,
        statement
      })
    });
    const siweMessage = await response.json();
    console.log('siweMessage: ', siweMessage);
    return siweMessage;
  }

  function signSiweMessage(message: SiweMessage, signature: string) {
    return fetch('/siwe/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        signature
      })
    });
  }

  async function signInWithEthereum() {
    isLoadingEth = true;
    ethError = null;
    try {
      logger.info('Signing in with ethereum', { with: 'some info' });
      // @ts-ignore
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      console.log('provider done: ', accounts);
      const signer = await provider.getSigner();
      console.log('signer done: ', signer);

      const message = await createSiweMessage(
        await signer.getAddress(),
        'Sign in with Ethereum to DeReg.'
      );
      const signature = await signer.signMessage(message);

      const response = await signSiweMessage(message, signature);
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      isLoadingEth = false;
      await goto('/');

      // TODO: handle errors with visual feedback
    } catch (err: any) {
      console.error('error while signing in: ', err);
      ethError = err.message;
      isLoadingEth = false;
    }
  }
</script>

<div class="mt-7">
  <button
    class="btn btn-primary w-full"
    on:click|preventDefault={signInWithEthereum}
    class:loading={isLoadingEth}
    disabled={isLoadingEth}
  >
    Sign in with Ethereum
  </button>
  {#if ethError}
    <label class="label">
      <span class="w-full label-text text-red-500 text-center"
        >Error signing in</span
      >
    </label>
  {/if}
</div>
