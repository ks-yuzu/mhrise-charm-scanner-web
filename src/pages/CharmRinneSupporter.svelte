<script lang="ts">
  import type {Mat}          from 'opencv-ts'
  import dayjs               from 'dayjs'
  import {writable}          from 'svelte/store'
  import MDBBtn              from 'mdbsvelte/src/MDBBtn.svelte'
  import CameraReader        from '../components/parts/CameraReader.svelte'
  import CharmPositionInput  from '../components/parts/CharmPositionInput.svelte'
  import RarityInput         from '../components/parts/CharmRarityInput.svelte'
  import SkillInput          from '../components/parts/CharmSkillInput.svelte'
  import SkillLevelInput     from '../components/parts/CharmSkillLevelInput.svelte'
  import SlotsInput          from '../components/parts/CharmSlotsInput.svelte'
  import CharmMinimap        from '../components/parts/CharmMinimap.svelte'
  import RecordButton        from '../components/parts/RecordButton.svelte'
  import CharmTableWithPager from '../components/parts/CharmTableWithPager.svelte'
  import {MAX_PAGE, ROWS_PER_PAGE_IN_RINNE, COLS_PER_PAGE_IN_RINNE}
                             from 'assets/mhrise/metadata'
  import type {Charm}        from 'assets/mhrise/mhrise-charm'
  import {isSameCharm, flatCharm2charm}
                             from 'assets/mhrise/mhrise-charm'
  import MHRiseCharmScanner, {SCAN_MODE}
                             from 'assets/mhrise/mhrise-charm-scanner'
  import {charmManager}      from 'stores/stores.js'
  import {isAppReady}        from 'stores/flags'
  import {sleep}             from 'util.js'

  // const VIDEO_WIDTH      = 1280 // switch のキャプチャ解像度
  // const VIDEO_HEIGHT     = 720
  // const VIDEO_FRAME_RATE = 29.97

  let charmScanner = new MHRiseCharmScanner(SCAN_MODE.MODE_RINNE)

  let domCameraReader
  let isRecording              = false
  let isRegisterEnabled        = false
  let isPositionAdjustRequired = true

  // form to show and fix scanned data
  let currentCharm: Charm = {skills: [], skillLevels: [], slots: []}

  const imageProcessor = async (frame: Mat) => {
    if ( !isRecording ) { return }

    if ( isPositionAdjustRequired ) {
      isPositionAdjustRequired = false
      charmScanner.adjustPosition(frame)
    }

    const result = charmScanner.scan(frame, dayjs().format())
    if ( result == null ) { return }
    const {charm, isCache} = result

    // 表示を更新
    if ( !isSameCharm(currentCharm, charm) ) {
      currentCharm = charm
    }

    if ( !isCache && isRegisterEnabled ) {
      // nScanedCharms = charmScanner.countCharms()
      await $charmManager.registerCharm(charm, frame)
    }
  }

  async function init() {
    while ( !$isAppReady ) {
      await new Promise(r => setTimeout(r, 1000))
    }
    await domCameraReader.init()
  }
  init()

  // result table
  let domCharmTable
  let isSpinnerShown              = false
  let searchResults: CharmEntry[] = null

  // $: updateResult({
  //   skills:      currentCharm.skills,
  //   skillLevels: currentCharm.skillLevels,
  //   slots:       currentCharm.slots,
  // })
  $: updateResult(currentCharm)

  async function updateResult(baseSpec: Charm) {
    if ( isSpinnerShown ) { return }
    isSpinnerShown = true

    const {skills, skillLevels, slots} = baseSpec

    if ( !skills.length && !slots.length) {
      searchResults = null
      isSpinnerShown = false
      return
    }

    const input = {
      skills:      skills.map(i => i ?? '無し'),
      skillLevels: skillLevels.map(i => i ?? 0),
      slots:       slots.map(i => i ?? 0),
    }
    const inputJson = JSON.stringify(input)
    console.log(input)

    while ( typeof Module.getSubstitutes !== 'function' ) {
      await sleep(100)
    }

    const result = Module.getSubstitutes(
      JSON.stringify($charmManager.charms.map((i: CharmEntry) => {
        // 余分なデータを落としてから渡す
        const {rowid, skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3} = i
        return {rowid, skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3}
      })),
      inputJson
    )
    const matchIds = JSON.parse(result) as number[]
    searchResults = matchIds
      .map(id => $charmManager.charms.find((i: any) => i.rowid === id))
      .filter(c => !isSameCharm(flatCharm2charm(c), input))

    isSpinnerShown = false
  }
</script>


<div class="tab-content">
  <!-- <div id="imgdump"></div> -->
  <div id="scanner">
    <div id="status">
      <div id="main">
        <CameraReader bind:this={domCameraReader}
                      imageProcessor={imageProcessor}/>
        <div id="charm-spec">
          <RecordButton bind:isRecording
                        label="スキャン"
                        />
          <div id="charm-spec-position">
            位置:
            <CharmPositionInput inputIdPrefix="input-position-"
                                bind:page={currentCharm.page}
                                bind:row={currentCharm.row}
                                bind:col={currentCharm.col}
                                />
          </div>
          <div id="charm-spec-rarity">
            レア度:
            <RarityInput inputId="input-rarity"
                         bind:value={currentCharm.rarity}
                         />
          </div>
          <div id="charm-spec-skills">
            スキル:
            {#each [...Array(2).keys()] as i}
              <div>
                <SkillInput inputId="input-skill-{i}"
                            bind:value={currentCharm.skills[i]}
                            placeholder="スキル{i+1}"
                            />
                <SkillLevelInput inputId="input-skill-level-{i}"
                                 bind:value={currentCharm.skillLevels[i]}
                                 />
              </div>
            {/each}
          </div>
          <div id="charm-spec-slots">
            スロット:
            <SlotsInput inputIdPrefix="input-slot-level-"
                        bind:values={currentCharm.slots}
                        placeholder="スロット"
                        />
          </div>
        </div>
      </div>

      <div class="charm-box-overview">
        {#each [...Array(MAX_PAGE + 1).keys()].slice(1) as page}
          <CharmMinimap {page}
                        rowsPerPage={ROWS_PER_PAGE_IN_RINNE}
                        colsPerPage={COLS_PER_PAGE_IN_RINNE}
                        {currentCharm}
                        {charmScanner}
                        />
                      {/each}
                    </div>
    </div>
  </div>
  <div id="result">
    {#if isSpinnerShown}
      <div class="spinner-border text-info" role="status"></div>
    {:else if searchResults == null}
      <!-- blank -->
    {:else if searchResults.length === 0}
      <div style="text-align: center">not found</div>
    {:else}
      <CharmTableWithPager charms={searchResults}
                           />
                           <!-- initialOpenedScreentshots={[searchResults[0].rowid]} -->
    {/if}
  </div>
</div>


<style>
  .tab-content {
    padding:    2rem;
    height:     100%;
    overflow:   auto;
  }

  #scanner > #status {
		width:     100%;
    /* max-width: calc(1280px + 26rem); */
    margin:    0;
  }

  #scanner > #status > #main {
    display: flex;
  }

  #scanner > #status > #main > :global(.camera-reader) {
    max-width:   1280px;
    flex-grow:   1;
    flex-shrink: 1;
  }

  #scanner > #status > #main > #charm-spec {
    width:       25rem;
    margin:      0 0 0 1rem; /* TODO: gap */
    flex-grow:   0;
    flex-shrink: 0;
  }

  #scanner > #status > #main > #charm-spec > div {
    margin:      0 0 1rem 0;
  }

  #scanner > #status > div.charm-box-overview {
    margin:    0.5rem 0 1.0rem;

    display:     flex;
    /* flex-wrap:   wrap; */
    gap:         0 0.4rem;

    overflow-x:  auto;
  }

  #scanner > #status > div.charm-box-overview > :global(div) {
    flex-shrink: 0;
  }

  #result {
		width:     100%;
    margin:    0.5rem 0;
  }
</style>
