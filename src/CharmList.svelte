<script>
  import SvelteTable from "svelte-table";
  import MHRiseCharmManager from './mhrise-charm-manager.js'
  import {skillToSlotLevel} from './decorations.js'

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
    charms = null
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
        // generate groupings of 0-10, 10-20 etc...
        let nums = {}
        rows.forEach(row => {
          let num = Math.floor(row.id / 10)
          if (nums[num] === undefined)
            nums[num] = { name: `${num * 10} 〜 ${(num + 1) * 10}`, value: num }
        })
        // fix order
        nums = Object.entries(nums)
          .sort()
          .reduce((o, [k, v]) => ((o[k] = v), o), {})
        return Object.values(nums)
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
    // {
    //   key: "gender",
    //   title: "GENDER",
    //   value: v => v.gender,
    //   renderValue: v => v.gender.charAt(0).toUpperCase() + v.gender.substring(1), // capitalize
    //   sortable: true,
    //   filterOptions: ["male", "female"] // provide array
    // }
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
                 classNameThead={['table-dark hide-first-child.disabled']}>
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
    height:   calc(100% - 8rem);
    overflow: scroll;

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

  :global(#charm-list > table > * > tr > *:nth-child(1)) { width: 6rem; }
  :global(#charm-list > table > * > tr > *:nth-child(2)) { width: calc((100% - 54rem) / 2); }
  :global(#charm-list > table > * > tr > *:nth-child(3)) { width: 8rem; }
  :global(#charm-list > table > * > tr > *:nth-child(4)) { width: calc((100% - 54rem) / 2); }
  :global(#charm-list > table > * > tr > *:nth-child(5)) { width: 8rem; }
  :global(#charm-list > table > * > tr > *:nth-child(6)) { width: 8rem; }
  :global(#charm-list > table > * > tr > *:nth-child(7)) { width: 8rem; }
  :global(#charm-list > table > * > tr > *:nth-child(8)) { width: 8rem; }
  :global(#charm-list > table > * > tr > *:nth-child(9)) { width: 8rem; }


  #charm-list {
    margin-top: 2px;
    height:     100%;
  }

  #charm-list > table {
    height: 100%;
    width:  100%;
  }

</style>
