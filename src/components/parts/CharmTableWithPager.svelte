<script lang="ts">
  import CharmTable from './CharmTable.svelte'

  export let charms: CharmEntry[] = []
  export let disableFilterHeader  = true
  export let headerColor          = 'dodgerblue'
  export let initialOpenedScreentshots = []

  let currentPage:  number = 1
  let itemsPerPage: number = 10

  $: nPages     = Math.ceil((charms?.length ?? 0) / itemsPerPage)
  $: sliceBegin = itemsPerPage * currentPage
  $: sliceEnd   = itemsPerPage * (currentPage+1)
  $: { // reset page on update
    if ( charms && nPages ) { currentPage = 0 }
  }
</script>

<div>
  <div>
    show
    <select bind:value={itemsPerPage}>
      <option>10</option>
      <option>25</option>
      <option>50</option>
      <option>100</option>
    </select>
    charms
  </div>

  <CharmTable {charms}
              {sliceBegin}
              {sliceEnd}
              {disableFilterHeader}
              {headerColor}
              {initialOpenedScreentshots}
              />

  <div id="pager">
    <ul class="pagination">
      <li class="page-item" class:disabled={currentPage === 0} aria-label="First">
        <span class="page-link" on:click={() => currentPage = 0}>
          <span aria-hidden="true">&laquo;</span>
        </span>
      </li>
      <li class="page-item" class:disabled={currentPage === 0} aria-label="Previous">
        <span class="page-link" on:click={() => currentPage--}>
          <span aria-hidden="true">&lt;</span>
        </span>
      </li>
      {#each [...Array(nPages).keys()] as i}
        <li class="page-item" class:active={i === currentPage}>
          <span class="page-link" on:click={() => currentPage = i}>{i + 1}</span>
        </li>
      {/each}
      <li class="page-item" class:disabled={currentPage === (nPages - 1)} aria-label="Next">
        <span class="page-link" on:click={() => currentPage++}>
          <span aria-hidden="true">&gt;</span>
        </span>
      </li>
      <li class="page-item" class:disabled={currentPage === (nPages - 1)} aria-label="Last">
        <span class="page-link" on:click={() => currentPage = nPages - 1}>
          <span aria-hidden="true">&raquo;</span>
        </span>
      </li>
    </ul>
  </div>
</div>
