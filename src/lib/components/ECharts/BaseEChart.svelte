<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as echarts from 'echarts';
  import { isDarkmode } from '$lib/stores/is-darkmode';

  // for chart initialization
  export let theme = isDarkmode ? 'light' : 'dark';
  export let width = 200;
  export let height = 200;

  // chart options
  export let option: echarts.EChartsOption;
  export let notMerge = false;
  export let lazyUpdate = false;

  let chart: echarts.ECharts;
  let id: HTMLDivElement;

  $: width && handleResize();
  $: option && setOption();
  $: if (chart && theme) {
    makeChart();
    setOption();
  }

  const setOption = () => {
    if (chart && !chart.isDisposed()) {
      chart.setOption(option, notMerge, lazyUpdate);
    }
  };

  const destroyChart = () => {
    if (chart && !chart.isDisposed()) {
      chart.dispose();
    }
  };

  const makeChart = () => {
    destroyChart();
    chart = echarts.init(id, theme);
  };

  let timeoutId: any;
  const handleResize = () => {
    if (timeoutId == undefined) {
      timeoutId = setTimeout(() => {
        if (chart && !chart.isDisposed()) {
          chart.resize();
        }
        timeoutId = undefined;
      }, 500);
    }
  };

  onMount(() => {
    makeChart();
  });

  onDestroy(() => {
    destroyChart();
  });
</script>

<div bind:clientWidth={width}>
  <div bind:this={id} style="height: {height}px" />
</div>
