<script lang:ts>
  import {writable} from 'svelte/store'
  import MHRiseCharmScanner from './mhrise-charm-scanner.js'
  import {fetchImage} from './util.js'


  const title = 'MHRise Charm Scanner'

  let scanner
  let fInitialized = false
  let fFinished    = false
  let domInput  // input 要素
  let files     // 選択されたローカルファイル
  let domVideo  // video 要素
  let video     // data uri
  let capture   // opencv の VideoCapture

  // result
  let nScanedCharms
  let domTextareaForScript
  let insertScript

  const progress = writable(0)


  window.addEventListener('load', async () => {
    scanner = new MHRiseCharmScanner()
    await scanner.init()
    fInitialized = true
  })


  const onFileSelected = async (e) => {
    const VIDEO_WIDTH = 1280
    const VIDEO_HEIGHT = 720

    const files = e.target.files
    if ( files && files[0] ) {
      const reader = new FileReader()
      reader.readAsDataURL(files[0]);

      await new Promise((resolve) => { reader.onload = resolve })
      video = reader.result

      await new Promise(r => setTimeout(r, 50)) // sleep
      domVideo.width  = VIDEO_WIDTH  // necessary for capture.read()
      domVideo.height = VIDEO_HEIGHT

      await new Promise((resolve) => domVideo.addEventListener('canplay', resolve))
      // if ( capture ) { capture.delete() }
      capture = new cv.VideoCapture(domVideo)

      const screenshot = new cv.Mat(VIDEO_HEIGHT, VIDEO_WIDTH, cv.CV_8UC4)
      await new Promise(r => setTimeout(r, 200)) // sleep

      const FRAME_RATE = 29.97
      while ( domVideo.duration != domVideo.currentTime ) {
        capture.read(screenshot)
        const result = scanner.scan(screenshot)

        const promiseSeek = new Promise(r => domVideo.addEventListener('seeked', r))
        seekFrames(domVideo, 1, FRAME_RATE)
        progress.set(domVideo.currentTime / domVideo.duration)

        await promiseSeek
      }
      progress.set(1)
      console.log(scanner.charms)
      fFinished = true

      screenshot.delete()
    }

    nScanedCharms = scanner.countCharms()
    insertScript = scanner.generateInsertScript()
  }


  const seekFrames = (video, nFrames, fps = 29.97) => {
	  const currentFrame = video.currentTime * fps
	  const newPosition = 0.00001 + (currentFrame + nFrames) / fps
	  // plus 0.00001 is workaround for safari

    video.currentTime = Math.min(video.duration, newPosition)
  }
</script>

<main>
	<h1>{title}</h1>
  <div id="description">
   モンスターハンターライズの護石を自動読み取りするツールです。<br>
   Nintendo Switch の 30 秒キャプチャ動画を用意するだけで, 護石のスキルやスロットが読み取れます。
   (<a href="sample/input.mp4">動画例</a>)<br>
   <br>
   現時点での出力形式は、スキルシミュレータへの登録スクリプトのみです。<br>
  </div>

  {#if video}
    <div id="status">
      <video class="preview" src="{video}" alt="preview" bind:this={domVideo}>
        <track kind="captions">
      </video>
      <div>
        <progress value={$progress}></progress>
        {Math.floor($progress * 100)}%
      </div>
    </div>
  {/if}

  {#if fInitialized}
  <div id="upload">
    <input style="display:none"
           type="file"
           accept=".mp4"
           on:change={(e) => onFileSelected(e)}
           bind:files bind:this={domInput}>
    <img src="https://static.thenounproject.com/png/625182-200.png" alt="" on:click={()=>{domInput.click()}} />
    <div on:click={()=>{domInput.click()}}>Choose Movie</div>
  </div>
  {:else}
  <div>Loading Files...</div>
  {/if}

  <div id="result">
    {#if fFinished}
      <div>{nScanedCharms} charms are scanned.</div>
      <textarea bind:this={domTextareaForScript}>{insertScript}</textarea>
    {/if}
  </div>
</main>


<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

  #description {
    margin: 0 0 2rem;
  }

  #status {
    display: block;
		width: 960px;
    max-width: 100%;
    margin: 1rem auto; /*tmp*/
  }

  #status .preview {
    height: 540px;
		width:  960px;
    max-width: 100%;
  }

  #status progress {
		display: block;
		width: 100%;
	}

  #upload > * {
		cursor:pointer;
	}

  #upload > img {
    height:50px;
		width:50px;
  }

  #result {
    margin: 2rem auto;
		width: 960px;
    max-width: 100%;
  }

  #result textarea {
    width: 100%;
    height: 10rem;
    font-family: monospace;
  }

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
