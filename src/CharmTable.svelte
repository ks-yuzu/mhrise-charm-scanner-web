<script>
  import {slide} from "svelte/transition"
  import SvelteTable from "./SvelteTable.svelte"
  import {getAllSkillNames} from './mhrise-skills.js'
  import {charmManager} from './stores.js'

  export let headerColor           = 'mediumseagreen'
  export let disableFilterHeader   = false
  export let showImageColumn       = true
  export let showSubstitutesColumn = true
  export let charms

  export let sliceBegin
  export let sliceEnd


  // constants
  const N_CHARM_SLOT_MAX = 3

  const allSkills = getAllSkillNames()
  const columns = [
    {
      key: "id",
      title: "ID",
      value: v => v.rowid,
      sortable: true,
      filterOptions: rows => {
        const UNIT = 50
        // generate groupings of 1-50, 51-100, etc...
        let nums = {}
        rows.forEach(row => {
          let num = Math.floor(row.rowid / UNIT)
          if (nums[num] === undefined)
            nums[num] = { name: `${num * UNIT + 1} 〜 ${(num + 1) * UNIT}`, value: num }
        })
        // fix order
        nums = Object.entries(nums)
          .sort()
          .reduce((o, [k, v]) => ((o[k] = v), o), {})
        return Object.values(nums)
      },
      filterValue: v => Math.floor((v.rowid - 1) / 50),
    },
    {
      key:           'skill1',
      title:         'スキル1',
      value:         v => v.skill1,
      filterOptions: allSkills,
      sortable:      true,
    },
    {
      key:           'skill1Level',
      title:         'スキル1 Lv',
      value:         v => v.skill1Level,
      filterOptions: [0,1,2,3,4,5,6,7],
      sortable:      true,
    },
    {
      key:           'skill2',
      title:         'スキル2',
      value:         v => v.skill2,
      filterOptions: allSkills,
      sortable:      true,
    },
    {
      key:           'skill2Level',
      title:         'スキル2 Lv',
      value:         v => v.skill2Level,
      filterOptions: [0,1,2,3,4,5,6,7],
      sortable:      true,
    },
    ...Array.from({length: N_CHARM_SLOT_MAX}, (_, i) => i + 1).map(i => ({
      key:           `slot${i}`,
      title:         `スロット${i}`,
      value:         v => v[`slot${i}`],
      renderValue:   v => v[`slot${i}`] || '-',
      sortable:      true,
      filterOptions: [0,1,2,3],
    })),
    {
      key:           'evaluation',
      title:         '合計Lv',
      value:         v => v.evaluation || '-',
      // filterOptions: rows => [...new Set(rows.map(i => i.evaluation))],
      filterOptions: [...Array(21).keys()],
      sortable:      true,
    },
    {
      key:           "image",
      title:         "画像",
      value:         v => v.imagename ? '有り' : '無し',
      renderValue:   v => v.imagename ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-camera-fill" viewBox="0 0 16 16"> <path d="M10.5 8.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/> <path d="M2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2zm.5 2a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1zm9 2.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z"/> </svg>' : '',
      sortable:      true,
      filterOptions: ["有り", "無し"],
      onClick:       toggleScreenshot,
    },
    {
      key:           "substitutableCharms",
      title:         "代替",
      value:         v => v.substitutableCharms?.length ? '有り' : '無し',
      renderValue:   v => {
        const question = '<span style="color: gray"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-question-square-fill" viewBox="0 0 16 16"> <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.496 6.033a.237.237 0 0 1-.24-.247C5.35 4.091 6.737 3.5 8.005 3.5c1.396 0 2.672.73 2.672 2.24 0 1.08-.635 1.594-1.244 2.057-.737.559-1.01.768-1.01 1.486v.105a.25.25 0 0 1-.25.25h-.81a.25.25 0 0 1-.25-.246l-.004-.217c-.038-.927.495-1.498 1.168-1.987.59-.444.965-.736.965-1.371 0-.825-.628-1.168-1.314-1.168-.803 0-1.253.478-1.342 1.134-.018.137-.128.25-.266.25h-.825zm2.325 6.443c-.584 0-1.009-.394-1.009-.927 0-.552.425-.94 1.01-.94.609 0 1.028.388 1.028.94 0 .533-.42.927-1.029.927z"/> </svg> </span>'
        const up = '<span style="color: mediumseagreen"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-square-fill" viewBox="0 0 16 16"> <path d="M2 16a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2zm6.5-4.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 1 0z"/> </svg> </span>'
        return v.substitutableCharms == null ? question
             : v.substitutableCharms.length  ? up
             :                                 ''
      },
      sortable:      true,
      filterOptions: ["有り", "無し"],
    },
  ].filter(i => {
    switch (i.key) {
      case 'image':               return showImageColumn
      case 'substitutableCharms': return showSubstitutesColumn
      default:                    return true
    }
  })


  // fields
  let isScreenshotShown = []
  let isSubstitutableCharmsShown = []


  // handlers
  function onSort(event) {
    // close all accordion
    isScreenshotShown = []
    isSubstitutableCharmsShown = []
  }

  function onClickRow({row}) {
    const index = row.rowid
    isSubstitutableCharmsShown[index] = !isSubstitutableCharmsShown[index]
  }

  async function toggleScreenshot({e, row}) {
    e.stopPropagation()

    const index = row.rowid
    const toShow = ! isScreenshotShown[index]
    isScreenshotShown[index] = toShow

    if ( toShow ) {
      // console.log(charms[index].imagename)
      const screenshot = await $charmManager.getScreenshot(row.imagename)

      // await new Promise((resolve) => requestAnimationFrame(resolve))
      cv.imshow(`charm-table-row-${index}-screenshot`, screenshot)
    }
  }


  $: styleVars = Object.entries({
    'header-background-color': headerColor,
    'table-width': `${61 + (showImageColumn ? 3 : 0) + (showSubstitutesColumn ? 3 : 0)}rem`,
  }).map(([k, v]) => `--${k}:${v}`)
    .join(';')
</script>

<div class="charm-table" style="{styleVars}">
  <SvelteTable columns="{columns}"
               rows="{charms}"
               classNameTable={['table table-striped table-hover table-responsible']}
               classNameThead={['table-dark hide-first-child.disabled']}
               disableFilterHeader={disableFilterHeader}
               bind:sliceBegin
               bind:sliceEnd
               on:clickCol={onSort}
               >
    <tr slot="row" let:row let:n on:click={(e) => onClickRow({row})}>
      {#each columns as col}
        <td on:click={(e) => { if (col.onClick) {col.onClick({e, row, col, index: n})} }}
            class={[col.class].join(' ')}
            >
          {#if col.renderComponent}
            <svelte:component
              this={col.renderComponent.component || col.renderComponent} {...(col.renderComponent.props || {})}
              row={row}
              col={col}
              />
          {:else}
            {@html col.renderValue ? col.renderValue(row) : col.value(row)}
          {/if}
        </td>
      {/each}
    </tr>
    <div slot="after-row" let:row let:n id="charm-table-row-{row.rowid}" style="width: 100%">
      {#if isSubstitutableCharmsShown[row.rowid]}
        {#if row.substitutableCharms == null}
          <div style="width: 100%; border-bottom: solid 1px #ddd">searching...</div>
        {:else if row.substitutableCharms.length === 0}
          <!-- none -->
        {:else}
          <div class="row-substitutes" transition:slide={{duration: 150}}>
          {#each row.substitutableCharms as c}
            <div style="width: 100%; text-align: left; padding: 0.3rem 2rem">
              {c.rowid}: {c.skill1}{c.skill1Level}, {c.skill2}{c.skill2Level}, {c.slot1}-{c.slot2}-{c.slot3}
            </div>
          {/each}
          </div>
        {/if}
      {/if}

      {#if isScreenshotShown[row.rowid]}
        <div style="width: 100%; border-bottom: solid 1px #ddd" transition:slide={{duration: 100}}>
          <canvas id="charm-table-row-{row.rowid}-screenshot" style="width: 100%"></canvas>
        </div>
      {/if}
    </div>
  </SvelteTable>
</div>


<style>
  .charm-table {
    height: 100%;
    font-family: monospace;
  }

  :global(.charm-table > table) {
    display: block;
    height:  100%;
  }

  :global(
    .charm-table > table thead,
    .charm-table > table tbody,
    .charm-table > table tr
  ) {
    display: flex;
    flex-shrink: 0;
  }

  :global(
    .charm-table > table thead,
    .charm-table > table tbody
  ) {
    flex-direction: row;
    flex-wrap: wrap;
  }

  :global(.charm-table > table thead) {
    background: none;
  }

  :global(.charm-table > table > thead > .row-filter-header) {
    border: none;
  }

  :global(.charm-table > table > thead > .row-title-header) {
    background: var(--header-background-color);
  }

  :global(.charm-table > table > :not(caption) > * > *) {
    padding-left:  0;
    padding-right: 0;
    border:        none;
  }

  :global(.charm-table > table > thead > .row-filter-header > th) {
    padding-left:  0.5rem;
    padding-right: 0.5rem;
  }

  :global(.charm-table > table > thead > .row-title-header > th) {
    padding-top:    0.5rem;
    padding-bottom: 0.5rem;
  }

  :global(.charm-table > table > thead th) {
    background: inherit;
  }

  :global(.charm-table > table > tbody) {
    height:     calc(100% - 6rem);
    overflow-x: auto;
    overflow-y: scroll;

    align-content: flex-start;
  }

  :global(.charm-table > table tr) {
    width:  100%;
  }

  :global(.charm-table > table tbody > tr) {
    height: 1.9rem;
  }

  :global(.charm-table > table tbody > div) {
    margin:  0;
    padding: 0;
  }

  :global(.charm-table > table tbody > div > div.row-substitutes) {
    margin:  0;
    padding: 0.5rem 2rem;

    max-height: 20rem;
    overflow:   auto;
  }

  :global(
    .charm-table > table th,
    .charm-table > table td
  ) {
    text-align: center;
    display:    inline-block;
  }

  :global(.charm-table > table td) {
    padding: 0.3rem;
  }


  /* width */
  :global(.charm-table > table) {
    width: var(--table-width) !important;
  }

  :global(.charm-table > table > * > tr > *:nth-child(1)) {
    width: 4rem;
    padding-right: 1rem;
    text-align: right;
  }
  :global(
    .charm-table > table > * > tr > *:nth-child(2),
    .charm-table > table > * > tr > *:nth-child(4)
  ) {
    /* width: calc((100% - 52rem - 6rem) / 2); */
    width: 10rem;
    padding-left: 1rem;
    text-align: left;
  }
  :global(
    .charm-table > table > * > tr > *:nth-child(3),
    .charm-table > table > * > tr > *:nth-child(5),
    .charm-table > table > * > tr > *:nth-child(6),
    .charm-table > table > * > tr > *:nth-child(7),
    .charm-table > table > * > tr > *:nth-child(8),
    .charm-table > table > * > tr > *:nth-child(9)
  ) {
    width: 6rem;
  }
  :global(
    .charm-table > table > * > tr > *:nth-child(10),
    .charm-table > table > * > tr > *:nth-child(11)
  ) {
    width: 3rem;
  }
</style>
