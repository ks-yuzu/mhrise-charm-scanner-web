<script lang="ts">
  // import {MDBContainer, MDBBtn, MDBModal, MDBModalBody, MDBModalHeader, MDBModalFooter} from "mdbsvelte"
  import MDBBtn         from 'mdbsvelte/src/MDBBtn.svelte'
  import MDBBtnGroup    from 'mdbsvelte/src/MDBBtnGroup.svelte'

  // import {getContext} from 'svelte';
  import {charmManager} from './stores.js'
  import ConfirmModal from './ConfirmModal.svelte'

  // TYPES
  const IMPORT_MODE = {
    APPEND:    'append',
    OVERWRITE: 'overwrite',
  } as const
  type IMPORT_MODE = typeof IMPORT_MODE[keyof typeof IMPORT_MODE];

  // VARIABLES
  let textareaValue: string = ''
  let confirm

  // FUNCTIONS
  async function importCharms({mode}) {
    if ( textareaValue.trim().length <= 0 ) {
      console.log('blank!!')
      return
    }

    if ( mode !== IMPORT_MODE.APPEND && mode !== IMPORT_MODE.OVERWRITE ) {
      console.log('internal error')
      return
    }

    // importMode = mode

    const result = await confirm({
      message:         'kakuninn',
      colorOkayButton: 'danger',
      labelOKayButton: 'Import',
	    onOkay:          () => {},
      onCancel:        () => {},
    })
    console.log(result)
    // importMode = mode

    // if ( mode === IMPORT_MODE.OVERWRITE ) {
    //   $charmManager.reset()
    // }

    console.log(textareaValue)

    // $charmManager.registerCharms(charms)
  }

  async function exportCharms() {
    // console.log($charmManager.charmTableName)

    textareaValue = $charmManager.charms.map(row => {
      const {skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3} = row
      return [skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3].join(',')
    }).join('\n')

    // $charmManager.exportIdx()
  }

</script>


<div class="tab-content">
  <div id="charm-ixporter">
    <textarea id="input" bind:value={textareaValue}></textarea>

    <MDBBtnGroup class="shadow-0">
      {#each [
        {label: 'エクスポート',     onClick: exportCharms},
        {label: '追加インポート',   onClick: () => importCharms({mode: IMPORT_MODE.APPEND})},
        {label: '上書きインポート', onClick: () => importCharms({mode: IMPORT_MODE.OVERWRITE})} ] as p}
      <MDBBtn color="primary"
              class="shadow-0 mx-1 px-0"
              style="width: 8rem;"
              disabled={$charmManager == null}
              on:click={p.onClick}>
        {p.label}
      </MDBBtn>
      {/each}
    </MDBBtnGroup>

    <!-- <MDBModal isOpen={isConfirmModalOpen} toggle={toggleConfirmModal}> -->
    <!--   <MDBModalHeader toggle={toggleConfirmModal}>確認</MDBModalHeader> -->
    <!--   <MDBModalBody> -->
    <!--     {#if importMode === IMPORT_MODE.OVERWRITE} -->
    <!--       上書きインポートを実行すると既存の護石は削除されます。<br> -->
    <!--       <span class="font-weight-bold"> 一度上書きすると元には戻せません。</span><br> -->
    <!--     {:else if importMode === IMPORT_MODE.APPEND} -->
    <!--       追加インポートでは既存の護石は保持されます。<br> -->
    <!--     {/if} -->
    <!--     <br> -->
    <!--     インポートを実行しますか？<br> -->
    <!--   </MDBModalBody> -->
    <!--   <MDBModalFooter> -->
    <!--     <MDBBtn color="danger" on:click={toggleConfirmModal}>Import</MDBBtn> -->
    <!--     <MDBBtn color="primary" outline on:click={toggleConfirmModal}>Cancel</MDBBtn> -->
    <!--   </MDBModalFooter> -->
    <!-- </MDBModal> -->

    <ConfirmModal bind:confirm>
    </ConfirmModal>
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
