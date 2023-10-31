<script lang="ts">
  import { numToHumanText } from '$lib/util/number-to-human-readable';
  import type { PageData } from './$types';

  export let netFlow: number;
  export let selectedToken: string;
  export let data: PageData;
</script>

<div class="block md:hidden">
  <div class="stats stats-vertical stats-horizontal shadow">
    <div class="stat">
      <div class="stat-title">Net Flow</div>
      <div
        class="stat-value"
        class:text-error={netFlow < 0}
        class:text-success={netFlow > 0}
      >
        {numToHumanText(netFlow)}
      </div>
      <div class="stat-desc">In the last 3h</div>
    </div>

    <div class="stat">
      <div class="stat-title">Total Inflow</div>
      <div class="stat-value">
        {numToHumanText(data.data.perTokenInflowSum[selectedToken || ''])}
      </div>
      <div class="stat-desc">In the last 3h</div>
    </div>
  </div>
  <div class="stats stats-vertical stats-horizontal shadow">
    <div class="stat">
      <div class="stat-title">Current TVL</div>
      <div class="stat-value text-info">
        {numToHumanText(data.data.perTokenCurrentTvl[selectedToken || ''])}
      </div>
      <div class="stat-desc">{selectedToken}</div>
    </div>
    <div class="stat">
      <div class="stat-title">Total Outflow</div>
      <div class="stat-value">
        -{numToHumanText(data.data.perTokenOutflowSum[selectedToken || ''])}
      </div>
      <div class="stat-desc">In the last 3h</div>
    </div>
  </div>
</div>

<div class="md:block hidden">
  <div class="stats stats-horizontal shadow">
    <div class="stat">
      <div class="stat-title">Net Flow</div>
      <div
        class="stat-value"
        class:text-error={netFlow < 0}
        class:text-success={netFlow > 0}
      >
        {numToHumanText(netFlow)}
      </div>
      <div class="stat-desc">In the last 3h</div>
    </div>

    <div class="stat">
      <div class="stat-title">Total Outflow</div>
      <div class="stat-value">
        -{numToHumanText(data.data.perTokenOutflowSum[selectedToken || ''])}
      </div>
      <div class="stat-desc">In the last 3h</div>
    </div>
    <div class="stat">
      <div class="stat-title">Total Inflow</div>
      <div class="stat-value">
        {numToHumanText(data.data.perTokenInflowSum[selectedToken || ''])}
      </div>
      <div class="stat-desc">In the last 3h</div>
    </div>
    <div class="stat">
      <div class="stat-title">Current TVL</div>
      <div class="stat-value text-info">
        {numToHumanText(data.data.perTokenCurrentTvl[selectedToken || ''])}
      </div>
      <div class="stat-desc">{selectedToken}</div>
    </div>
  </div>
</div>
