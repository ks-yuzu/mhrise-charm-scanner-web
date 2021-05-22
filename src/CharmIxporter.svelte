<script>
  export let charmManager

  let textareaValue = ''

  async function importCharms() {
    if ( textareaValue.trim() ) {
      console.log('blank!!')
    }
  }

  async function exportCharms() {
    textareaValue = [
      ...(await charmManager.sql('select * from charms')).result.rows
    ] .map(row => {
        const {skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3} = row
        return [skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3].join(',')
      })
      .join('\n')
  }
</script>


<div class="tab-content">
  <div id="charm-ixporter">
    <textarea id="input" bind:value={textareaValue}></textarea>

    <div>
      <!-- <button class="btn btn-primary shadow-0 {(String(textareaValue).trim().length && charmManager) ? 'disabled' : 'disabled'}" on:click={importCharms}>import</button> -->
      <button class="btn btn-primary shadow-0 {charmManager ? '' : 'disabled'}" on:click={exportCharms}>export</button>
    </div>
  </div>
</div>


<style>
  .tab-content {
    margin:     0;
    padding:    0;
    height:     100%;
    overflow:   auto; /* width 100% でスクロールさせる用 */
  }

  .tab-content > #charm-ixporter {
    margin:     1rem auto;
    padding:    0;

    width:      95%;
  }

  /* .tab-content > #charm-ixporter > h2 { */
  /*   margin-top:  1rem; */

  /*   font-size:   1rem; */
  /*   font-weight: bold; */
  /*   text-align:  left; */
  /* } */

  .tab-content > #charm-ixporter > textarea {
    margin:      0 auto;
    width:       100%;

    height:      20rem;
    font-size:   small;
    font-family: monospace;

    border:      solid 1px #ddd;
    overflow:    auto;
  }
</style>
