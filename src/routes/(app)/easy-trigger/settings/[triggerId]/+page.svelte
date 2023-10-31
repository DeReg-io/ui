<script lang="ts">
  import type { ActionData, PageData } from './$types';
  import EasyTriggerSettings from './EasyTriggerSettings.svelte';

  export let form: ActionData;
  export let data: PageData;
</script>

<EasyTriggerSettings {form} {data} />
