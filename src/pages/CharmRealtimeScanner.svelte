<script lang="ts">
  import type {Mat}         from 'opencv-ts'
  import dayjs              from 'dayjs'
  import {writable}         from 'svelte/store'
  import MDBBtn             from 'mdbsvelte/src/MDBBtn.svelte'
  import CameraReader       from '../components/parts/CameraReader.svelte'
  import CharmPositionInput from '../components/parts/CharmPositionInput.svelte'
  import RarityInput        from '../components/parts/CharmRarityInput.svelte'
  import SkillInput         from '../components/parts/CharmSkillInput.svelte'
  import SkillLevelInput    from '../components/parts/CharmSkillLevelInput.svelte'
  import SlotsInput         from '../components/parts/CharmSlotsInput.svelte'
  import CharmMinimap       from '../components/parts/CharmMinimap.svelte'
  import RecordButton       from '../components/parts/RecordButton.svelte'
  import {MAX_PAGE}         from 'assets/mhrise/metadata'
  import type {Charm}       from 'assets/mhrise/mhrise-charm'
  import MHRiseCharmScanner, {SCAN_MODE}
                            from 'assets/mhrise/mhrise-charm-scanner'
  import {charmManager}     from 'stores/stores.js'
  import {isAppReady}       from 'stores/flags'

  // const VIDEO_WIDTH      = 1280 // switch のキャプチャ解像度
  // const VIDEO_HEIGHT     = 720
  // const VIDEO_FRAME_RATE = 29.97

  let charmScanner = new MHRiseCharmScanner(SCAN_MODE.MODE_EQUIP_LIST)

  let domCameraReader
  let isRecording              = false
  let isRegisterEnabled        = true
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
    currentCharm = charm

    if ( !isCache && isRegisterEnabled ) {
      // nScanedCharms = charmScanner.countCharms()
      await $charmManager.registerCharm(charm, frame)
    }
  }

  ;(async () => {
    while ( !$isAppReady ) {
      await new Promise(r => setTimeout(r, 1000))
    }
    await domCameraReader.init()
  })()
</script>


<div class="tab-content">
  <div id="imgdump"></div>
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
                        {currentCharm}
                        {charmScanner}
                        />
                      {/each}
                    </div>
    </div>
  </div>
</div>


<style>
  .tab-content {
    margin:     2rem;
    padding:    0;
    height:     100%;
    overflow:   auto; /* width 100% でスクロールさせる用 */
  }

  #scanner > #status {
		width:     100%;
    max-width: calc(1280px + 26rem);
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
    display:   flex;
    flex-wrap: wrap;
    gap:       0 0.4rem;
  }
</style>
