<script lang="ts">
  import '../../app.css';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';

  let title: string = '';
  $: {
    switch ($page.route.id?.split('/')[2]) {
      case 'alert-hub':
        title = 'Alert Hub 🚨';
        break;
      case 'easy-trigger':
        title = 'Easy Trigger';
        break;
    }
  }
</script>

<div class="navbar bg-base-100">
  <div class="flex-1">
    <a class="btn btn-ghost normal-case text-xl">
      <img src="/dereg-logo-colour.png" class="h-10 pt-1" />
    </a>
  </div>
  <h1 class="text-2xl flex-1">{title}</h1>
  <div class="flex-none">
    <a
      role="button"
      href="https://dereg-io.github.io/docs/"
      target="_blank"
      class="btn btn-sm btn-primary mr-4">docs</a
    >
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-ghost btn-circle avatar">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="inline-block w-5 h-5 stroke-current"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
          /></svg
        >
      </label>
      <ul
        tabindex="0"
        class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
      >
        <li>
          <a
            class="justify-between"
            href={`https://dereg.auth.eu-central-1.amazoncognito.com/logout?client_id=6cmi49shmis9h8u1ndifnoiqh3&logout_uri=${encodeURIComponent(
              browser ? window.location.origin : 'app.dereg.io'
            )}/auth/logout`}>Logout</a
          >
        </li>
      </ul>
    </div>
  </div>
</div>

<slot />

<style>
</style>
