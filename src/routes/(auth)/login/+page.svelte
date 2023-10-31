<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import SignInWithEthereum from '../SignInWithEthereum.svelte';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  const COGNITO_CALLBACK_PATH = 'auth/callback/cognito';

  let isLoadingEmail = false;
  let errors: string | null = null;

  function getCognitoRedirectUrl(): string {
    let url: string;
    if (browser) {
      url = `${window.location.origin}/${COGNITO_CALLBACK_PATH}`;
    } else {
      url = `${$page.url.origin}/${COGNITO_CALLBACK_PATH}`;
    }
    return encodeURIComponent(url);
  }

  async function setFormData() {
    isLoadingEmail = true;
    return async ({ result }) => {
      if (result.data.errors) {
        errors = result.data.errors;
        isLoadingEmail = false;
      } else {
        await goto('/');
      }
    };
  }
</script>

<div class="w-72">
  <img src="/dereg-logo-colour.png" alt="DeReg" class="mb-3" />

  <SignInWithEthereum />

  <div class="divider mt-7">OR</div>

  <form class="w-72" method="POST" use:enhance={setFormData}>
    <div class="form-control w-full max-w-xs">
      <label class="label">
        <span class="label-text">Email</span>
      </label>
      <input
        name="email"
        type="text"
        placeholder="Enter email..."
        class="input input-bordered w-full max-w-xs"
        class:input-error={errors}
      />
    </div>

    <div class="form-control w-full max-w-xs">
      <label class="label">
        <span class="label-text">Password</span>
      </label>
      <input
        name="password"
        type="password"
        placeholder="Enter password..."
        class="input input-bordered w-full max-w-xs"
        class:input-error={errors}
      />
    </div>

    {#if errors}
      <p class="text-danger text-red-500 mt-3">Email or password is wrong.</p>
    {/if}

    <div class="justify-right mt-5">
      <button
        class:loading={isLoadingEmail}
        disabled={isLoadingEmail}
        class="btn btn-primary w-full">Login</button
      >
    </div>

    <div class="mt-7">
      Don't have an account? <a
        href={`https://dereg.auth.eu-central-1.amazoncognito.com/signup?client_id=6cmi49shmis9h8u1ndifnoiqh3&response_type=code&scope=email+openid+profile&redirect_uri=${getCognitoRedirectUrl()}`}
        class="link link-primary">Sign up</a
      >
    </div>
  </form>
</div>
