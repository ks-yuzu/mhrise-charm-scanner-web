<script lang="ts">
  import {COLS_PER_PAGE_IN_EQLIST, ROWS_PER_PAGE_IN_EQLIST}
                                        from 'assets/mhrise/metadata'
  import type {Charm}                   from 'assets/mhrise/charm'
  import MHRiseCharmScanner             from 'assets/mhrise/mhrise-charm-scanner'

  export let page: number
  export let rowsPerPage = ROWS_PER_PAGE_IN_EQLIST
  export let colsPerPage = COLS_PER_PAGE_IN_EQLIST
  export let currentCharm: Charm
  export let charmScanner: MHRiseCharmScanner


  // TODO: スキャン毎に全セル分呼ばれないようにする？
  function getClassName({row, col}) {
    return [
      _getCharmClass({row, col}),
      _isCurrentCharm({row, col}) ? 'current' : '',
    ].join(' ')
  }

  function _getCharmClass({row, col}) {
    // return `rare${Math.floor(Math.random() * 7)}` // for debug

    // const rarity = charmScanner?.charms?.[page]?.[row]?.[col]
    const charm = charmScanner.charms[page][row][col]
    if (charm == null) { return 'none' }

    return `rare${charm.rarity}`
  }

  function _isCurrentCharm({row, col}) {
    // return row === 2 && col === 2

    if (currentCharm == null) { return false }
    if (page !== currentCharm.page) { return false }
    return currentCharm.row === row && currentCharm.col === col
  }
</script>

<div class="minimap">
  <table>
    <tbody>
      {#each [...Array(rowsPerPage + 1).keys()].slice(1) as row}
      <tr>
        {#each [...Array(colsPerPage + 1).keys()].slice(1) as col}
        <!-- <td class:current={_isCurrentCharm({row: row + 1, col: col + 1})} -->
        <!-- <td class:current={_isCurrentCharm(row, col, currentCharm)} -->
        <td class="{getClassName({row, col}, currentCharm)}"></td>
        {/each}
      </tr>
      {/each}
    </tbody>
  </table>
  {page}
</div>

<style>
  .minimap {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* .minimap:nth-of-type(n+2) { */
  /*   margin: 0 0 0 0.4rem; */
  /* } */

  .minimap > table {
    border-collapse: collapse;
  }
  .minimap > table > tbody > tr > td.current {
    border-color: rgb(255, 220, 40);
    border-width: 4px;
  }

  .minimap > table td {
    width:  0.8rem;
    height: 0.8rem;
    border: solid 1px gray;
  }


  .minimap > table > tbody > tr > td.rare1 {background: #bbb;}
  .minimap > table > tbody > tr > td.rare2 {background: #bbb }
  .minimap > table > tbody > tr > td.rare3 {background: rgb(236, 182, 200);}
  .minimap > table > tbody > tr > td.rare4 {background: rgb(163, 228, 133);}
  .minimap > table > tbody > tr > td.rare5 {background: rgb(54, 206, 255);}
  .minimap > table > tbody > tr > td.rare6 {background: rgb(116, 141, 243);}
  .minimap > table > tbody > tr > td.rare7 {background: rgb(217, 98, 81);}

</style>
