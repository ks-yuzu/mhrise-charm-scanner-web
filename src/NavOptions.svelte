<script context="module">
  import CharmScanner from './CharmScanner.svelte'
  import CharmList    from './CharmList.svelte'
  import Description  from './Description.svelte'

  export const navOptions = [
    // { tabTitle: 'Usage',   component: Usage },
		{ tabTitle: '護石スキャン', component: CharmScanner },
    { tabTitle: '護石管理',     component: CharmList },
    { tabTitle: '説明',         component: Description },
  ]
</script>
