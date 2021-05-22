<script>
  import CharmTable from './CharmTable.svelte'
  import MHRiseCharmManager from './mhrise-charm-manager.js'
  import {skillToSlotLevel} from './mhrise-charm-decorations.js'
  import {fRefleshCharmTable} from './stores.js'

  export let charmManager

  // fields
  let charms = null


  // init
  const init = async () => {
    if ( charmManager == null ) {
      setTimeout(init, 1000)
    }
    else {
      await updateCharmTable()
      searchSubstitutableCharms()
    }
  }
  init()


  // update
  $: if ( $fRefleshCharmTable ) {
    (async () => {
      console.log('reflesh table')

      $fRefleshCharmTable = false

      await updateCharmTable()
      searchSubstitutableCharms()
    })()
  }


  // functions
  async function updateCharmTable() {
    charms = [
      ...(await charmManager.searchCharms('select rowid,* from charms'))
    ].map(row => {
      row.evaluation = skillToSlotLevel[row.skill1] * row.skill1Level
                     + skillToSlotLevel[row.skill2] * row.skill2Level
                     + row.slot1
                     + row.slot2
                     + row.slot3
      return row
    })
  }

  async function searchSubstitutableCharms() {
    while ( typeof Module.getSubstitutesAll !== 'function' ) {
      await new Promise(r => setTimeout(r, 100))
    }

    const res = Module.getSubstitutesAll( JSON.stringify(charms) ) // use wasm module
    const substitutes = JSON.parse(res)

    for (const i in charms) {
      const [baseId, upperIds] = substitutes[0] || [Number.MAX_SAFE_INTEGER, []]

      if ( charms[i].rowid > baseId ) {
        console.log('internal error')
      }
      else if ( charms[i].rowid < baseId ) {
        charms[i].substitutableCharms = []
      }
      else {
        charms[i].substitutableCharms = upperIds.map(u => charms[u - 1])
        substitutes.shift()
      }
    }

    // for (const [baseId, upperIds] of substitutes) {
    //   charms[baseId - 1].substitutableCharms = upperIds.map(i => charms[i - 1])
    // }
  }
</script>


<div class="tab-content">
  <div id="charm-list">
    {#if charms == null}
      <div class="spinner-border text-info" role="status">
        <!-- <span class="visually-hidden">Loading...</span> -->
      </div>
    {:else}
      <CharmTable bind:charms
                  bind:charmManager
                  />
    {/if}
  </div>
</div>


<style>
  :global(.hide-first-child > *:first-child) {
    display: none;
  }

  .tab-content {
    margin:     0;
    padding:    0;
    height:     100%;
    overflow:   hidden;
  }

  #charm-list{
    padding:     8px;

    margin-top: 2px;
    width:      100%;
    height:     100%;

    font-family: monospace;
    overflow-x: auto;
    overflow-y: hidden;
  }

  #charm-list .spinner-border {
    margin: 30% calc(50% - 1rem);
  }

</style>
