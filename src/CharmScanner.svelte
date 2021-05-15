<script>
  import {writable} from 'svelte/store'
  import VideoReader from './VideoReader.svelte'

  const VIDEO_WIDTH      = 1280 // switch のキャプチャ解像度
  const VIDEO_HEIGHT     = 720
  const VIDEO_FRAME_RATE = 29.97
  const N_VIDEO_SPLITS = (navigator.hardwareConcurrency || 8) / 2

  export let charmScanner
  export let charmManager
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
      await charmManager.registerCharms(charms)
    }

    const charms = charmScanner.getCharms()
    console.log(JSON.stringify(charms))

    // await charmManager.registerCharms(charms)
    isScanFinished = true
  }


  function onFinishVideoRead() {
    if ( ++countFinishVideoRead !== N_VIDEO_SPLITS ) { return }
    isVideoReadFinished = true
  }
</script>


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

    <!-- {#if video} -->
    <!--   <video class="preview" src="{video}" alt="preview" bind:this={domVideo}> -->
    <!--     <track kind="captions"> -->
    <!--   </video> -->
    <!-- {:else} -->
    <!--   <img class="preview" src="sample/sample-img.png" alt="preview-sample" /> -->

    <!--   <div style="height: 540px; width: 960px; display: flex; align-items: center; justify-content: center;"> -->
    <!--   {#if fInitialized} -->
        <!-- <div id="upload" on:click={()=>{domInput.click()}}> -->
        <!--   <input style="display:none" -->
        <!--          type="file" -->
        <!--          accept=".mp4" -->
        <!--          multiple -->
        <!--          on:change={(e) => onFileSelected(e)} -->
        <!--          bind:files -->
        <!--          bind:this={domInput}> -->
        <!--   <img src="https://static.thenounproject.com/png/625182-200.png" alt="" /> -->
        <!--   <div>Click to Select Movie</div> -->
        <!-- </div> -->
    <!--   {:else} -->
    <!--     <div>Loading Files...</div> -->
    <!--   {/if} -->
    <!--   </div> -->
    <!-- {/if} -->

    <!-- <div> -->
    <!--   <progress value={$progress}></progress> -->
    <!--   {Math.floor($progress * 100)}% -->
    <!-- </div> -->
  </div>


  <div id="result">
    <!-- {#if fFinished} -->
      <textarea placeholder="charms will be exported here">{exportData}</textarea>
      <div>Found {nScanedCharms} charms in this scan.</div>
    <!-- {/if} -->
  </div>

  {#if fInitialized}
    <div id="upload">
      <input style="display:none"
             type="file"
             accept=".mp4"
             multiple
             on:change={(e) => onFileSelected(e)}
             bind:files
             bind:this={domInput}>
      <img src="https://static.thenounproject.com/png/625182-200.png" alt="" on:click={()=>{domInput.click()}} />
      <div on:click={()=>{domInput.click()}}>Click to Select Movie</div>
    </div>
  {:else}
    <div>Loading Files...</div>
  {/if}
</div>


<style>
  #status {
    display: block;
    position: relative;
		width: 960px;
    max-width: 100%;
    margin: 1rem auto; /*tmp*/
  }

  #status .preview {
    height: 540px;
		width:  960px;
    max-width: 100%;
  }

  #status img.preview {
    opacity: 0.3;
    position: absolute;
    left: 0;
  }

  #status progress {
		display: block;
		width: 100%;
	}

  #upload,
  #upload * {
    z-index: 1;
		cursor:pointer;
	}

  #upload {
    width:  11rem;
    margin: auto;
  }

  #upload img {
		width:  60px;
    height: 60px;
  }

  #upload div {
    font-weight: bold;
  }

  #result {
    margin:    2rem auto;
		width:     960px;
    max-width: 100%;
  }

  #result textarea {
    width:       100%;
    height:      20rem;
    font-size:   small;
    font-family: monospace;
  }
</style>
