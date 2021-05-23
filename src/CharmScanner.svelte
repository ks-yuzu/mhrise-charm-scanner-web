<script>
  import {writable} from 'svelte/store'
  import VideoReader from './VideoReader.svelte'
  import {charmManager} from './stores.js'


  const VIDEO_WIDTH      = 1280 // switch のキャプチャ解像度
  const VIDEO_HEIGHT     = 720
  const VIDEO_FRAME_RATE = 29.97
  const N_VIDEO_SPLITS = (navigator.hardwareConcurrency || 8) / 2

  export let charmScanner
  export let fInitialized

  let domInput    // input 要素
  let files = []  // 選択されたローカルファイル

  // video reader
  let videoReaderProps = writable([])
  let countFinishVideoRead
  let isVideoReadFinished

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
    const files = e.target.files
    if ( files == null ) { return }

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
          index: index,
          videoName: file.name,
          videoData: reader.result,
          charmScanner: charmScanner,
          nSplits: N_VIDEO_SPLITS,
          onFinish: onFinishVideoRead,
        }
      }
      // console.log($videoReaderProps)

      await new Promise((resolve) => requestAnimationFrame(resolve))

      await new Promise((resolve) => {
        setInterval(() => {
          nScanedCharms = charmScanner.countCharms()
          exportData = charmScanner.exportAsText()

          if ( isVideoReadFinished ) { resolve() }
        }, 1000)
      })

      const charms = charmScanner.getCharms()
      await $charmManager.registerCharms(charms)
    }

    const charms = charmScanner.getCharms()
    console.log(JSON.stringify(charms))

    isScanFinished = true
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
      {#if fInitialized}
        <input style="display:none"
               type="file"
               accept=".mp4"
               multiple
               on:change={onFileSelected}
               bind:files
               bind:this={domInput}>
        <img src="https://static.thenounproject.com/png/625182-200.png" alt="" on:click={()=>{domInput.click()}} />
        <div on:click={()=>{domInput.click}}>Click to Select Movie</div>
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
