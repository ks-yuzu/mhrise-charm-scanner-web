<script lang:ts>
  import {writable} from 'svelte/store'
  import VideoReader from './VideoReader.svelte'
  import MHRiseCharmManager from './mhrise-charm-manager.js'
  import MHRiseCharmScanner from './mhrise-charm-scanner.js'
  import SvelteTable from "svelte-table";

  const TITLE = 'MHRise Charm Scanner'

  const VIDEO_WIDTH      = 1280 // switch のキャプチャ解像度
  const VIDEO_HEIGHT     = 720
  const VIDEO_FRAME_RATE = 29.97
  const N_VIDEO_SPLITS = (navigator.hardwareConcurrency || 8) / 2

  let fInitialized = false
  let charmScanner
  let charmManager
  let domInput    // input 要素
  let files = []  // 選択されたローカルファイル

  // video reader
  let videoReaderProps = writable([])
  let countFinishVideoRead
  let isVideoReadFinished

  // progress
  let currentFileIndex = -1

  // result
  let nScanedCharms = 0
  let exportData = ''

  // charm-list
  const N_CHARM_SLOT_MAX = 3
  let charms = [];
  const columns = [
    {
      key: "id",
      title: "ID",
      value: v => v.id,
      sortable: true,
      filterOptions: rows => {
        // generate groupings of 0-10, 10-20 etc...
        let nums = {};
        rows.forEach(row => {
          let num = Math.floor(row.id / 10);
          if (nums[num] === undefined)
            nums[num] = { name: `${num * 10} 〜 ${(num + 1) * 10}`, value: num };
        });
        // fix order
        nums = Object.entries(nums)
          .sort()
          .reduce((o, [k, v]) => ((o[k] = v), o), {});
        return Object.values(nums);
      },
      filterValue: v => Math.floor(v.id / 10),
    },
  // {
  //   key: "first_name",
  //   title: "FIRST_NAME",
  //   value: v => v.first_name,
  //   sortable: true,
  //   filterOptions: rows => {
  //     // use first letter of first_name to generate filter
  //     let letrs = {};
  //     rows.forEach(row => {
  //       let letr = row.first_name.charAt(0);
  //       if (letrs[letr] === undefined)
  //         letrs[letr] = {
  //           name: `${letr.toUpperCase()}`,
  //           value: letr.toLowerCase()
  //         };
  //     });
  //     // fix order
  //     letrs = Object.entries(letrs)
  //       .sort()
  //       .reduce((o, [k, v]) => ((o[k] = v), o), {});
  //     return Object.values(letrs);
  //   },
  //   filterValue: v => v.first_name.charAt(0).toLowerCase()
  // },
    {
      key:     'skill1',
      title:   'スキル1',
      value:    v => v.skill1,
      sortable: true,
    },
    {
      key:     'skill1Level',
      title:   'スキル1 Lv',
      value:    v => v.skill1Level,
      sortable: true,
    },
    {
      key:     'skill2',
      title:   'スキル2',
      value:    v => v.skill2,
      sortable: true,
    },
    {
      key:     'skill2Level',
      title:   'スキル2 Lv',
      value:    v => v.skill2Level,
      sortable: true,
    },
    ...Array.from({length: N_CHARM_SLOT_MAX}, (_, i) => i + 1).map(i => ({
      key:        `slot${i}`,
      title:      `スロット${i}`,
      value:       v => v[`slot${i}`],
      renderValue: v => v[`slot${i}`] || '-',
      sortable:    true,
      filterOptions: [0,1,2,3],
    })),
  // {
  //   key: "gender",
  //   title: "GENDER",
  //   value: v => v.gender,
  //   renderValue: v => v.gender.charAt(0).toUpperCase() + v.gender.substring(1), // capitalize
  //   sortable: true,
  //   filterOptions: ["male", "female"] // provide array
  // }
];


  window.addEventListener('load', async () => {
    charmScanner = new MHRiseCharmScanner()
    charmManager = new MHRiseCharmManager()
    await charmScanner.init()
    fInitialized = true

    updateCharmTable()
  })


  const initVideoReaders = () => {
    videoReaderProps = writable([])
    countFinishVideoRead = 0
    isVideoReadFinished = false
  }


  const onFileSelected = async (e) => {
    const files = e.target.files

    if ( files == null ) { return }

    console.log(files)
    for (let i = 0; i < files.length; i++) {
      console.log(Date())
      currentFileIndex = i
      const file = files[i]

      initVideoReaders()

      const reader = new FileReader()
      reader.readAsDataURL(file);
      await new Promise((resolve) => { reader.onload = resolve })

      for (let i = 0; i < N_VIDEO_SPLITS; i++) {
        const index = $videoReaderProps.length

        $videoReaderProps[index] = {
          index: index,
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
    }

    const charms = charmScanner.getCharms()
    console.log(JSON.stringify(charms))

    charmManager.registerCharms(charms)
    updateCharmTable()
  }


  const onFinishVideoRead = () => {
    if ( ++countFinishVideoRead !== N_VIDEO_SPLITS ) { return }
    isVideoReadFinished = true
  }


  const updateCharmTable = async () => {
    const allCharms = await charmManager.searchCharms('select * from charms')
    charms = [...allCharms].map((elm, index) => ({...elm, id: 1 + index}))
  }
</script>

<main>
	<h1>{TITLE}</h1>
  <div id="description" class="card border border-light shadow-sm" style="max-width: 100%; width: 56rem; margin: auto">
    <div class="card-body">
    <p style="margin: auto; max-width: 100%; width: 54rem; text-align: left">
      モンスターハンターライズの護石を自動読み取りするツールです。<br>
      Nintendo Switch の 30 秒キャプチャ動画を用意するだけで, 護石のスキルやスロットが読み取れます。
      (<a href="sample/input.mp4">動画例</a>)<br>
      <br>
      出力形式は、&lt;スキル1&gt;,&lt;スキル1Lv&gt;,&lt;スキル2&gt;,&lt;スキル2Lv&gt;,&lt;スロット1Lv&gt;,&lt;スロット2Lv&gt;,&lt;スロット3Lv&gt; です。<br>
      <a href="https://mhrise.wiki-db.com/sim/">泣きシミュ</a> さんでそのままインポートできます。<br>
      <br>
      スキャンした護石を自動保存、管理する機能を追加中です。
    </p>
    </div>
  </div>


  <div id="status">
    <div id="status">
      {#each $videoReaderProps as props}
        <VideoReader {...props} />
      {/each}
      {#if files.length > 0}
        [{1 + Number(currentFileIndex)}/{files.length}]
      {/if}
    </div>

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

  <div id="result">
    <!-- {#if fFinished} -->
      <div>Found {nScanedCharms} charms in this scan.</div>
      <textarea placeholder="charms will be exported here">{exportData}</textarea>
    <!-- {/if} -->
  </div>

  <div id="charm-list">
    <SvelteTable columns="{columns}"
                 rows="{charms}"
                 classNameTable={['table table-striped table-hover table-responsible']}
                 classNameThead={['table-dark hide-first-child.disabled']}>
    </SvelteTable>
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
		/* text-transform: uppercase; */
		font-size: 4em;
		font-weight: 100;
	}

  #description {
    margin: 0 0 2rem;
  }

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
    margin: 2rem auto;
		width: 960px;
    max-width: 100%;
  }

  #result textarea {
    width: 100%;
    height: 10rem;
    font-family: monospace;
  }

  :global(.hide-first-child > *:first-child) {
    display: none;
  }

  :global(#charm-list td) {
    padding: 0.3rem;
  }

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
