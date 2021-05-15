<script>
  import SvelteTable from "svelte-table";
  import MHRiseCharmManager from './mhrise-charm-manager.js'


  // props
  export const updateCharmTable = async () => {
    const allCharms = await charmManager.searchCharms('select * from charms')
    charms = [...allCharms].map((elm, index) => ({...elm, id: 1 + index}))
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
  ]


  // fields
  let charmManager = new MHRiseCharmManager()
  let charms = []


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
  <SvelteTable columns="{columns}"
               rows="{charms}"
               classNameTable={['table table-striped table-hover table-responsible']}
               classNameThead={['table-dark hide-first-child.disabled']}>
  </SvelteTable>
</div>

<style>
    :global(.hide-first-child > *:first-child) {
    display: none;
  }

  :global(#charm-list td) {
    padding: 0.3rem;
  }
</style>
