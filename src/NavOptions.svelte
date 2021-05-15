<script context="module">
  // import CharmScanner from './CharmScanner.svelte'
  import CharmList from './CharmList.svelte'

  export const navOptions = [
    // { tabTitle: 'Usage',   component: Usage },
		// { tabTitle: '護石スキャン', component: CharmScanner },
    { tabTitle: '護石管理', component: CharmList },
    // { tabTitle: 'Second Page',    component: Page2 },
  ]
</script>
