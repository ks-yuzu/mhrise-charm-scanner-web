<script lang="ts">
  import MDBBtn                             from 'mdbsvelte/src/MDBBtn.svelte'
  import MDBBtnGroup                        from 'mdbsvelte/src/MDBBtnGroup.svelte'
  import ConfirmModal                       from '../components/parts/ConfirmModal.svelte'
  import type {Charm, CharmEntry}           from 'assets/mhrise/mhrise-charm'
  import {charmManager}                     from 'stores/stores.js'
  import {zenkaku2hankaku, hankaku2zenkaku} from 'string-util'


  // TYPES
  const IMPORT_MODE = {
    APPEND:    'append',
    OVERWRITE: 'overwrite',
  } as const
  type IMPORT_MODE = typeof IMPORT_MODE[keyof typeof IMPORT_MODE]

  // VARIABLES
  let textareaValue: string = ''
  let confirm: (params: any) => Promise<any>

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

    const result = await confirm({
      message:         mode === IMPORT_MODE.OVERWRITE
                                ? '護石を上書きインポートします。\n既存の護石は削除され、元に戻すことはできません。よろしいですか？'
                                : '護石を追加インポートします。',
      colorOkayButton: mode === IMPORT_MODE.OVERWRITE ? 'danger' : 'primary',
    })
    console.log(result)

    if ( mode === IMPORT_MODE.OVERWRITE ) {
      await $charmManager.reset()
    }

    // console.log($charmManager.charms)

    const charms: Charm[] = textareaValue.trim().split('\n').map(line => {
      const [s1, sl1, s2, sl2, slot1, slot2, slot3] = line.split(/,\s*/)

      return {
        skills:      [s1, s2].map(i => i === '' ? '無し' : zenkaku2hankaku(i)),
        skillLevels: [sl1, sl2].map(i => parseInt(i)),
        slots:       [slot1, slot2, slot3].map(i => parseInt(i)),
      } as Charm
    })
    console.log(charms)

    $charmManager.registerCharms(charms)
  }

  async function exportCharms() {
    // console.log($charmManager.charmTableName)

    textareaValue = $charmManager.charms.map((row: CharmEntry) => {
      const {skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3} = row
      return [
        hankaku2zenkaku(skill1 === '無し' ? '' : skill1), skill1Level,
        hankaku2zenkaku(skill2 === '無し' ? '' : skill2), skill2Level,
        slot1, slot2, slot3,
      ].join(',')
    }).join('\n')

    // $charmManager.exportIdx()
  }

</script>


<div class="tab-content">
  <div id="charm-ixporter">
    <textarea id="input" bind:value={textareaValue}></textarea>

    <MDBBtnGroup class="shadow-0">
      {#each [
        {label: 'エクスポート',     isDisabled: () => $charmManager == null, onClick: exportCharms},
        {label: '追加インポート',   isDisabled: () => $charmManager == null || textareaValue.trim().length === 0, onClick: () => importCharms({mode: IMPORT_MODE.APPEND})},
        {label: '上書きインポート', isDisabled: () => $charmManager == null || textareaValue.trim().length === 0, onClick: () => importCharms({mode: IMPORT_MODE.OVERWRITE})} ] as p}
      <MDBBtn color="primary"
              class="shadow-0 mx-1 px-0"
              style="width: 8rem;"
              disabled={p.isDisabled()}
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
