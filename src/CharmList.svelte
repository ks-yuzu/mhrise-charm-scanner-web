<script>
  import {slide} from "svelte/transition"
  import SvelteTable from "./SvelteTable.svelte"
  import MHRiseCharmManager from './mhrise-charm-manager.js'
  import {skillToSlotLevel} from './mhrise-charm-decorations.js'

  // props
  export const updateCharmTable = async () => {
    const allCharms = await charmManager.searchCharms('select * from charms')
    charms = [...allCharms].map((elm, index) => {
      return {
        ...elm,
        id:         1 + index,
        evaluation: skillToSlotLevel[elm.skill1] * elm.skill1Level
                  + skillToSlotLevel[elm.skill2] * elm.skill2Level
                  + elm.slot1
                  + elm.slot2
                  + elm.slot3,
      }
    })
  }

  export const onActivate = () => {
    // charms = null
    updateCharmTable()
  }

  // constants
  const N_CHARM_SLOT_MAX = 3
  const columns = [
    {
      key: "id",
      title: "ID",
      value: v => v.id,
      sortable: true,
      filterOptions: rows => {
        const UNIT = 50
        // generate groupings of 0-10, 10-20 etc...
        let nums = {}
        rows.forEach(row => {
          let num = Math.floor(row.id / UNIT)
          if (nums[num] === undefined)
            nums[num] = { name: `${num * UNIT + 1} 〜 ${(num + 1) * UNIT}`, value: num }
        })
        // fix order
        nums = Object.entries(nums)
          .sort()
          .reduce((o, [k, v]) => ((o[k] = v), o), {})
        return Object.values(nums)
      },
      filterValue: v => Math.floor((v.id - 1) / 50),
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
      key:           `slot${i}`,
      title:         `スロット${i}`,
      value:         v => v[`slot${i}`],
      renderValue:   v => v[`slot${i}`] || '-',
      sortable:      true,
      filterOptions: [0,1,2,3],
    })),
    {
      key:      'evaluation',
      title:    '合計Lv',
      value:    v => v.evaluation,
      sortable: true,
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
      value:         v => v.substitutableCharms ? '有り' : '無し',
      renderValue:   v => v.substitutableCharms ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-square-fill" viewBox="0 0 16 16"> <path d="M2 16a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2zm6.5-4.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 1 0z"/> </svg>' : '',
      sortable:      true,
      filterOptions: ["有り", "無し"],
    },
  ]


  // fields
  let charmManager = new MHRiseCharmManager()
  let charms = null


  // init
  const init = async () => {
    if ( charmManager == null ) {
      setTimeout(init, 1000)
    }
    else {
      await updateCharmTable()
    }
  }
  init()


  // handlers
  function onSort(event) {
    // close all accordion
    charms.forEach(i => i.isScrennshotShown = i.isSubstitutableCharmsShown = false)
  }


  function onClickRow({e, index}) {
    charms[index].isSubstitutableCharmsShown = !charms[index].isSubstitutableCharmsShown
  }


  async function toggleScreenshot({e, row, index}) {
    e.stopPropagation()

    const toShow = ! charms[index].isScrennshotShown
    charms[index].isScrennshotShown = toShow

    if ( toShow ) {
      // console.log(charms[index].imagename)
      const screenshot = await charmManager.getScreenshot(row.imagename)

      // await new Promise((resolve) => requestAnimationFrame(resolve))
      cv.imshow(`charm-table-row-${index}-screenshot`, screenshot)
    }
  }
</script>


<div id="charm-list">
  {#if charms == null}
    <div style="margin-top: 20%" class="spinner-border text-info" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  {:else}
    <SvelteTable columns="{columns}"
                 rows="{charms}"
                 classNameTable={['table table-striped table-hover table-responsible']}
                 classNameThead={['table-dark hide-first-child.disabled']}
                 on:clickCol={onSort}
                 >
      <tr slot="row" let:row let:n on:click={(e) => onClickRow({e, index: n})}>
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
      <div slot="after-row" let:row let:n id="charm-table-row-{n}" style="width: 100%" transition:slide={{duration: 300}}>
        {#if charms[n].isSubstitutableCharmsShown}
          <div style="width: 100%; border-bottom: solid 1px #ddd">上位互換護石の表示は準備中です</div>
        {/if}
        {#if charms[n].isScrennshotShown}
          <div style="width: 100%; border-bottom: solid 1px #ddd">
            <canvas id="charm-table-row-{n}-screenshot" style="width: 100%"></canvas>
          </div>
        {/if}
      </div>
    </SvelteTable>
  {/if}
</div>


<style>
  :global(.hide-first-child > *:first-child) {
    display: none;
  }

  :global(#charm-list td) {
    padding: 0.3rem;
  }

  :global(#charm-list td) {
    padding: 0.3rem;
  }

  :global(#charm-list table) {
    display: block;
    height:  100%;
  }

  :global(
    #charm-list table thead,
    #charm-list table tbody,
    #charm-list table tr
  ) {
    display: flex;
    flex-shrink: 0;
  }

  :global(
    #charm-list thead,
    #charm-list tbody
  ) {
    flex-direction: row;
    flex-wrap: wrap;
  }

  :global(#charm-list > table > thead) {
    padding-right: 15px; /* tbody のスクロールバーに合わせる */
  }

  :global(#charm-list > table > tbody) {
    height:     calc(100% - 8rem);
    overflow-x: auto;
    overflow-y: scroll;

    align-content: flex-start;
  }

  :global(#charm-list > table tr) {
    width:  100%;
  }

  :global(#charm-list > table tbody tr) {
    height: 1.9rem;
  }

  :global(
    #charm-list > table th,
    #charm-list > table td
  ) {
    text-align: center;
    display:    inline-block;
  }


  /* width */
  :global(#charm-list > table) { width: 67rem; }

  :global(#charm-list > table > * > tr > *:nth-child(1)) { width: 4rem; }
  :global(
    #charm-list > table > * > tr > *:nth-child(2),
    #charm-list > table > * > tr > *:nth-child(4)
  ) {
    /* width: calc((100% - 52rem - 6rem) / 2); */
    width: 10rem;
  }
  :global(#charm-list > table > * > tr > *:nth-child(3))  { width: 6rem; }
  :global(#charm-list > table > * > tr > *:nth-child(5))  { width: 6rem; }
  :global(#charm-list > table > * > tr > *:nth-child(6))  { width: 6rem; }
  :global(#charm-list > table > * > tr > *:nth-child(7))  { width: 6rem; }
  :global(#charm-list > table > * > tr > *:nth-child(8))  { width: 6rem; }
  :global(#charm-list > table > * > tr > *:nth-child(9))  { width: 6rem; }
  :global(#charm-list > table > * > tr > *:nth-child(10)) { width: 3rem; }
  :global(#charm-list > table > * > tr > *:nth-child(11)) { width: 3rem; }

  :global(#charm-list > table > tbody > tr > td:nth-child(11)) { color: mediumseagreen; }

  :global(#charm-list > table > :not(caption) > * > *) {
    padding-left:  0;
    padding-right: 0;
  }

  :global(#charm-list > table > thead > tr[class]:first-child > th) {
    padding-left:  0.5rem;
    padding-right: 0.5rem;
  }

  #charm-list {
    max-width:  100%;
    height:     100%;
    margin-top: 2px;

    overflow-x: scroll;
    overflow-y: hidden;
  }
</style>
