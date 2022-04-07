<script lang="ts">
  import cv                 from 'opencv-ts'
  import dayjs              from 'dayjs'
  import {writable}         from 'svelte/store'
  import MDBBtn             from 'mdbsvelte/src/MDBBtn.svelte'
  import {charmManager}     from 'stores/stores.js'
  import CameraReader       from '../components/parts/CameraReader.svelte'
  import CharmPositionInput from '../components/parts/CharmPositionInput.svelte'
  import RarityInput        from '../components/parts/CharmRarityInput.svelte'
  import SkillInput         from '../components/parts/CharmSkillInput.svelte'
  import SkillLevelInput    from '../components/parts/CharmSkillLevelInput.svelte'
  import SlotsInput         from '../components/parts/CharmSlotsInput.svelte'

  // const VIDEO_WIDTH      = 1280 // switch のキャプチャ解像度
  // const VIDEO_HEIGHT     = 720
  // const VIDEO_FRAME_RATE = 29.97

  export let charmScanner
  export let isInitialized

  // result
  let nScanedCharms = 0
  let exportData = ''

  // form to show and fix scanned data
  let currentCharm = { skills: [], skillLevels: [], slots: [] }

  let domCameraReader

  const imageProcessor = async (frame: cv.Mat) => {
    const charm = charmScanner.scan(frame, dayjs().format())
    if (charm == null) { return }

    exportData = JSON.stringify(charm, null, 2) // TODO: tmp
    currentCharm = charm
    nScanedCharms = charmScanner.countCharms()

    await $charmManager.registerCharms([charm])
  }

  ;(async () => {
    do {
      await new Promise(r => setTimeout(r, 1000))
    } while ( !isInitialized )
    // console.log({isInitialized})
    // await new Promise(r => setTimeout(r, 5000))

    await domCameraReader.init()

    // const offset = {x: 1, y: 1} // TODO: 適当にズレを取得する
    // charmScanner.adjustPosition(offset)
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
          <div id="charm-spec-position">
            位置:
            <CharmPositionInput inputId="input-position"
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
            <SlotsInput inputId="input-slot-level-"
                        bind:values={currentCharm.slots}
                        placeholder="スロット"
                        />
          </div>
        </div>
      </div>
      <div id="charmbox-overview">
      </div>
    </div>

    <div id="result">
      <div>Found {nScanedCharms} charms.</div>
      <textarea placeholder="納刀術,2,ひるみ軽減,1,1,0,0">{exportData}</textarea>
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
    margin:    0;

    /* text-align: center; */
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
    margin:      0 0 0 1rem;
    flex-grow:   0;
    flex-shrink: 0;
  }

  #scanner > #status > #main > #charm-spec > div {
    margin:      0 0 1rem 0;
  }

  #scanner #result {
    width:  100%;
    margin: 1rem 0 0 0;
  }

  #scanner #result textarea {
    width:       100%;
    height:      20rem;
    font-size:   small;
    font-family: monospace;
  }
</style>
