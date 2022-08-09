<script lang="ts">
  import {writable}         from 'svelte/store'
  import VideoReader        from '../components/parts/VideoReader.svelte'
  import MHRiseCharmScanner, {SCAN_MODE, SCAN_SKIP_MODE}
                            from 'assets/mhrise/mhrise-charm-scanner'
  import {charmManager}     from 'stores/stores.js'
  import {isAppReady}       from 'stores/flags.js'


  // const VIDEO_WIDTH      = 1280 // switch のキャプチャ解像度
  // const VIDEO_HEIGHT     = 720
  // const VIDEO_FRAME_RATE = 29.97
  const N_VIDEO_SPLITS = (navigator.hardwareConcurrency || 8) / 2

  let charmScanner = new MHRiseCharmScanner({
    scanMode: SCAN_MODE.MODE_EQUIP_LIST,
    scanSkipMode: SCAN_SKIP_MODE.SKIP_SCANNED_CHARM,
  })

  let domFileInput // ファイルアップロード用 input 要素
  let files = []   // 選択されたローカルファイル

  // video reader
  let videoReaderProps = writable([])
  let countFinishVideoRead
  let isVideoReadFinished = false

  // progress
  let currentFileIndex = -1
  let isScanFinished = false

  // result
  let nScanedCharms = 0
  let exportData = ''


  function initVideoReaders() {
    videoReaderProps = writable([])
    countFinishVideoRead = 0
    isVideoReadFinished = false
  }


  async function onFileSelected(e) {
    if ( e.target.files == null ) { return }

    const filelist = e.target.files as FileList
    const files: File[] = [...filelist]

    isScanFinished = false

    // console.log(files)
    for (let i = 0; i < files.length; i++) {
      currentFileIndex = i
      const file = files[i]

      console.log(file.name, Date())

      initVideoReaders()

      const reader = new FileReader()
      reader.readAsDataURL(file);
      await new Promise((resolve) => { reader.onload = resolve })

      for (let i = 0; i < N_VIDEO_SPLITS; i++) {
        const index = $videoReaderProps.length

        $videoReaderProps[index] = {
          index:        index,
          videoName:    file.name,
          videoData:    reader.result,
       // charmScanner: charmScanner,
          nSplits:      N_VIDEO_SPLITS,
          onCapture:    onCapture,
          onFinish:     onFinishVideoRead,
        }
      }
      // console.log($videoReaderProps)

      // wait for movie
      await new Promise((resolve) => requestAnimationFrame(resolve))

      // wait scanning
      const updateResult = () => {
        nScanedCharms = charmScanner.countCharms()
        exportData = charmScanner.exportAsText()
      }
      while ( !isVideoReadFinished ) {
        updateResult()
        await new Promise(r => setTimeout(r, 1000))
      }
      updateResult()

      const charms = charmScanner.getCharms()
      await $charmManager.registerCharms(charms)
    }

    const charms = charmScanner.getCharms()
    console.log(JSON.stringify(charms))

    isScanFinished = true
  }


  function onCapture(frame, videoName) {
    const result = charmScanner.scan(frame, videoName)
    if ( result == null ) { return }
    const {charm, isCache} = result

    if ( !isCache ) {
      // スクショ保存だけしておく. (護石データの DB 保存は動画単位で)
      $charmManager.saveScreenshot(frame, charm.imageName)
    }
  }


  function onFinishVideoRead() {
    if ( ++countFinishVideoRead !== N_VIDEO_SPLITS ) { return }
    isVideoReadFinished = true
  }
</script>


<div class="tab-content">
  <div id="scanner">
    <div id="status">
      {#each $videoReaderProps as props}
        <VideoReader {...props} />
      {/each}

      {#if isScanFinished}
        Completed!
      {:else if files.length > 0}
        Processing {1 + Number(currentFileIndex)}/{files.length} file. Please wait...
      {/if}
    </div>


    <div id="result">
      <div>Found {nScanedCharms} charms.</div>
      <textarea placeholder="納刀術,2,ひるみ軽減,1,1,0,0">{exportData}</textarea>
    </div>

    <div id="upload">
      {#if isAppReady}
        <input style="display:none"
               type="file"
               accept=".mp4"
               multiple
               on:change={onFileSelected}
               bind:files
               bind:this={domFileInput}>
        <img src="https://static.thenounproject.com/png/625182-200.png"
             alt=""
             on:click={()=>domFileInput.click()}
             />
        <div on:click={()=>domFileInput.click()}>Click to Select Movie</div>
      {:else}
        Loading Files...
      {/if}
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

  #scanner #status {
		width:     96%;
    max-width: 960px;
    margin:    2rem auto;

    text-align: center;
  }

  #scanner #result {
    width:  95%;
    margin: auto;
  }

  #scanner #result textarea {
    width:       100%;
    height:      20rem;
    font-size:   small;
    font-family: monospace;
  }

  #scanner #upload,
  #scanner #upload * {
    z-index: 1;
		cursor:  pointer;

    display: block;
    margin:  auto;
    text-align: center;
	}

  #scanner #upload {
    width:  11rem;
    margin: auto;
  }

  #scanner #upload img {
		width:   60px;
    height:  60px;
  }

  #scanner #upload div {
    font-weight: bold;
  }
</style>
