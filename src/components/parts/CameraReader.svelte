<script lang="ts">
  import cv from 'opencv-ts'
  import dayjs from 'dayjs'

  const videoWidth = 1280
  const videoHeight = 720

  // export let videoName = 'realtime-capture'
  export let isVideoVisible = true
  export let imageProcessor

  let videos = []
  let audios = []
  let video
  let audio
  let domVideo
  let videoStream
  $: {
    onSelectVideoInput({audio, video})
  }

  export async function init() {
    if (navigator.mediaDevices?.getUserMedia == null) { return }
    navigator.mediaDevices.getUserMedia({audio: true, video: true})

    const devices = await getInputDevices()
    videos = devices.videos
    audios = devices.audios
    const video = videos.find(i => i.label.includes('USB'))
    const audio = audios.find(i => i.label.includes('USB Digital Audio'))
  }

  async function getInputDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return {
      videos: devices.filter(i => i.kind === 'videoinput'),
      audios: devices.filter(i => i.kind === 'audioinput'),
    }
  }

  async function onSelectVideoInput({audio, video}) {
    const stream = await getVideoStream({video, audio})
    videoStream = stream // show video

    domVideo.height = 720
    domVideo.srcObject = videoStream
    if (stream == null) { return }
    if (domVideo.paused) {
      domVideo.play()
      run()
    }
  }

  async function getVideoStream({video, audio}) {
    if ( video == null ) { return }

    const mediaConstraints = {
      video: {
        // deviceId: {exact: video},
        deviceId: video,
        width: {
          min: 1280,
          max: 1280,
          // ideal: 1920,
          // max: 2560,
        },
        height: {
          min: 720,
          max: 720,
          // ideal: 1080,
          // max: 1440,
        },
      },
      // audio: {
      //   // deviceId: {exact: audio},
      //   deviceId: audio,
      // },
    }
    console.log({mediaConstraints})
    return await navigator.mediaDevices.getUserMedia(mediaConstraints)
  }

  async function run() {
    const capture = new cv.VideoCapture(domVideo)
    let frame = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4)
    while ( true ) {
      await new Promise(r => requestAnimationFrame(r))
      await capture.read(frame)
      await imageProcessor(frame) // TODO: 非同期でも？
    }
  }
</script>


<div class="camera-reader">
  <div>
    <select bind:value={video}>
      <option value={null}>なし</option>
      {#each videos as video}
        <option value={video.deviceId}>{video.label}</option>
      {/each}
    </select>
    <select bind:value={audio}>
      <option value={null}>なし</option>
      {#each audios as audio}
        <option value={audio.deviceId}>{audio.label}</option>
      {/each}
    </select>
  </div>

  <video bind:this={domVideo}
         width="1280"
         style="{isVideoVisible ? '' : 'display: none'}"
         />
         <!-- height="720" -->
</div>
<!-- <div class="video-reader"> -->
<!--   <video id="video{index}" -->
<!--          class="video-preview" -->
<!--          src="{videoData}" -->
<!--          width="{videoWidth}" -->
<!--          height="{videoHeight}" -->
<!--          alt="preview{index}" -->
<!--          bind:this={domVideo}> -->
<!--     <track kind="captions"> -->
<!--   </video> -->

<!--   <div> -->
<!--     <progress value={progress}></progress> -->
<!--     <span class="progress-text">{Math.floor(progress * 100)}%</span> -->
<!--   </div> -->
<!-- </div> -->


<style>
  /* .video-reader { */
  /*   width: 100%; */
  /*   height: 100%; */
  /* } */

  .camera-reader video {
    max-width: 100%;

    aspect-ratio: 16 / 9;
    object-fit: contain;

    background: #ccc;
  }
</style>
