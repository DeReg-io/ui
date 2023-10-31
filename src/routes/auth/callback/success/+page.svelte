<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    goto('/');
  });
</script>

<h1>Success! Redirecting...</h1>
