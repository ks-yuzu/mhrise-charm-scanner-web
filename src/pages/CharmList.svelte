<script lang="ts">
  import CharmTable from '../components/parts/CharmTable.svelte'
  import {charmManager} from 'stores/stores.js'

  let charms

  setInterval(() => { // WORKAROUND: charms does not follow charManager.charms...
    if ( charms !== $charmManager?.charms ) {
      charms = $charmManager?.charms
    }
  }, 1000)
</script>


<div class="tab-content">
  <div id="charm-list">
    {#if charms == null}
      <div class="spinner-border text-info" role="status">
        <!-- <span class="visually-hidden">Loading...</span> -->
      </div>
    {:else}
      <CharmTable bind:charms
                  showDeleteColumn={true}
                  />
    {/if}
  </div>
</div>


<style>
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

    overflow-x: auto;
    overflow-y: hidden;
  }

  #charm-list .spinner-border {
    margin: 30% calc(50% - 1rem);
  }
</style>
