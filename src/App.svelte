<script lang:ts>
  import MHRiseCharmScanner from './mhrise-charm-scanner.js'
  import {fetchImage} from './util.js'
  import { writable } from 'svelte/store';

  const title = 'MHRise Charm Scanner'

  let scanner
  let domInput  // input 要素
  let files     // 選択されたローカルファイル
  let domVideo  // video 要素
  let video     // data uri
  let capture   // opencv の VideoCapture
  // let progress = 0
  const progress = writable(0)

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

      const FRAME_RATE = 1 / 30
      while ( domVideo.duration != domVideo.currentTime ) {
        capture.read(screenshot)
        scanner.scan(screenshot)

        progress.set(domVideo.currentTime / domVideo.duration)
        domVideo.currentTime = Math.min(domVideo.duration, domVideo.currentTime + FRAME_RATE)
        await new Promise(r => setTimeout(r, 0))
      }
      progress.set(1)
      // console.log(screenshot)
      // cv.imshow('canvasInput', screenshot)

      screenshot.delete()
    }
  }

  setTimeout(async () => {
    // const screenshot = await fetchImage('img001.png')

    scanner = new MHRiseCharmScanner()
    await scanner.init()
    // const tmp = scanner.scan(screenshot)
    // // cv.imshow('canvasInput', tmp)
    // screenshot.delete()
  }, 1000)
</script>

<main>
	<h1>{title}</h1>
  {#if video}
    <!-- <video class="preview" src="{video}" alt="preview" autoplay controls bind:this={domVideo}> -->
    <video class="preview" src="{video}" alt="preview" bind:this={domVideo}>
      <track kind="captions">
    </video>
    <p> <progress value={$progress}></progress> </p>

  {/if}
  <!-- <canvas id="canvasInput"></canvas> -->

  <div class="upload">
    <input style="display:none"
           type="file"
           accept=".mp4"
           on:change={(e) => onFileSelected(e)}
           bind:files bind:this={domInput}>
    <img src="https://static.thenounproject.com/png/625182-200.png" alt="" on:click={()=>{domInput.click()}} />
    <div on:click={()=>{domInput.click()}}>Choose Movie</div>
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

  progress {
		display: inline-block;
		width: 960px;
	}

  .preview {
    height: 540px;
		width:  960px;
  }

  .upload > * {
		cursor:pointer;
	}

  .upload > img {
    height:50px;
		width:50px;
  }

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
