<script lang="ts">
  import cv from 'opencv-ts'
  // import {writable} from 'svelte/store'

  const FRAME_RATE = 29.97
  const videoWidth = 1280
  const videoHeight = 720

  export let nSplits
  export let index
  export let videoName
  export let videoData
  export let isVideoVisible = false
  export let charmScanner
  export let onFinish

  let beginTime, endTime

  let domVideo

  let capture
  let frame = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4)
  let progress = 0

  ;(async () => {
    await new Promise(r => requestAnimationFrame(r))
    await new Promise(r => domVideo.oncanplay = r)
    capture = new cv.VideoCapture(domVideo)

    beginTime = index * domVideo.duration / nSplits
    endTime   = (index + 1) * domVideo.duration / nSplits

    domVideo.addEventListener('seeked', processCurrentFrame)
    // console.log( domVideo.currentTime, domVideo.duration, index, nSplits, beginTime, endTime )
    if ( domVideo.currentTime != beginTime ) {
      domVideo.currentTime = beginTime
    }
    else {
      processCurrentFrame()
    }
  })()

  const processCurrentFrame = async () => {
    // console.log( {currentTime: domVideo.currentTime, endTime} )

    if ( endTime - domVideo.currentTime < 1 / FRAME_RATE ) {
      // const nScanedCharms = charmScanner.countCharms()
      // console.log(nScanedCharms)
      // insertScript = charmScanner.generateInsertScript()

      progress = (1)
      // console.log(charmScanner.charms)

      onFinish()

      return
    }

    capture.read(frame)
    charmScanner.scan(frame, videoName) // TODO: コールバックにして汎用クラスにする

    seekFrames(1, FRAME_RATE)
    progress = ((domVideo.currentTime - beginTime) / (endTime - beginTime))
  }


  const seekFrames = (nFrames, fps) => {
	  const currentFrame = domVideo.currentTime * fps
	  const newPosition = 0.00001 + (currentFrame + nFrames) / fps
	  // plus 0.00001 is workaround for safari

    domVideo.currentTime = Math.min(endTime, newPosition)
  }

</script>


<div class="video-reader">
  <video id="video{index}"
         class="video-preview"
         src="{videoData}"
         width="{videoWidth}"
         height="{videoHeight}"
         alt="preview{index}"
         style="{isVideoVisible ? '' : 'display: none'}"
         bind:this={domVideo}>
    <track kind="captions">
  </video>

  <div>
    <progress value={progress}></progress>
    <span class="progress-text">{Math.floor(progress * 100)}%</span>
  </div>
</div>


<style>
  .video-reader {
    width: 100%;
    height: 100%;
  }

  .video-reader video {
    border: solid 1px gray;

    height: 540px;
		width:  960px;
  }

  .video-reader progress {
		/* display: block; */
		width:   calc(100% - 5rem);
	}

  .video-reader .progress-text {
    width:      4rem;
    display:    inline-block;
  }
</style>
