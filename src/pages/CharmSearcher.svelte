<script lang="ts">
  import AutoComplete      from 'simple-svelte-autocomplete'
  import CharmTable        from '../components/parts/CharmTable.svelte'
  import {charmManager}    from 'stores/stores.js'
  import {allSkillDetails} from 'assets/mhrise/mhrise-skills.js'
  import type {CharmEntry} from 'assets/mhrise/mhrise-charm'

  const MAX_SKILL_LEVEL  = 7
  const SKILL_LEVEL_LIST = [...Array(MAX_SKILL_LEVEL).keys()].map(i => i + 1) // 補完用
  const MAX_SLOTS        = 3

  let skillFilters      = []
  let skillLevelFilters = []
  let slots             = []

  let isSpinnerShown              = false
  let searchResults: CharmEntry[] = null

  // table pagination
  let currentPage         = 0,
      itemsPerPage        = 10
  $: nPages = Math.ceil((searchResults||[]).length / itemsPerPage)
  $: {
    if ( searchResults && nPages ) {
      currentPage = 0
    }
  }
  $: searchResultsToShow = searchResults //?.slice(itemsPerPage * currentPage, itemsPerPage * (currentPage+1))
  $: sliceBegin = itemsPerPage * currentPage
  $: sliceEnd   = itemsPerPage * (currentPage+1)

  // update form (skill)
  $: {
    for (let i = 0; i < skillFilters.length; i++) { // for ... in だと i が string になるので
      if ( skillFilters[i] && skillLevelFilters[i] == null ) {
        skillLevelFilters[i] = 1
      }
      if ( skillFilters[i] == null ) {
        skillFilters.splice(i, 1)
        skillLevelFilters.splice(i, 1)
      }
    }
  }

  // update form (slot)
  $: slots = slots.sort((a, b) => b - a)

  // update result
  $: {
    isSpinnerShown = true
    slots = slots.filter(i => i)

    const base = JSON.stringify({
      skills: skillFilters.map(i => i.name),
      skillLevels: skillLevelFilters,
      slots,
    })

    const search = () => {
      if ( !skillFilters.length && !skillLevelFilters.length && !slots.length) {
        searchResults = null
        return
      }

      if ( typeof Module.getSubstitutesAll !== 'function' ) {
        setTimeout(search, 100)
        return
      }

      const result = Module.getSubstitutes(
        JSON.stringify($charmManager.charms.map((i: CharmEntry) => {
          // 余分なデータを落としてから渡す
          // return i
          const {rowid, skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3} = i
          return {rowid, skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3}
        })),
        base
      )
      const matchIds = JSON.parse(result) as number[]
      searchResults = matchIds.map(id => $charmManager.charms.find((i: any) => i.rowid === id))
    }

    search()
    isSpinnerShown = false
  }


  function handleKeydown(event: KeyboardEvent) {
    if ( event.key === 'Escape' ) {
      document.body.click()
      return
    }

    // key combination
    if ( !( (event.ctrlKey && event.metaKey) || (event.ctrlKey && event.altKey) )) {
      return
    }

    let elementBasename = ''
    if      ( event.key === 'k' ) { elementBasename = 'input-skill-' }
    else if ( event.key === 'l' ) { elementBasename = 'input-skill-level-' }
    else if ( event.key === 't' ) { elementBasename = 'input-slot-' }
    else {
      return
    }

    const focusedId = document.activeElement.id
    if ( focusedId.startsWith(elementBasename) ) {
      const currentSuffix = parseInt(focusedId.replace(elementBasename, ''))
      const nextFocus = document.getElementById(`${elementBasename}${currentSuffix + 1}`)
                     || document.getElementById(`${elementBasename}0`)
      document.body.click()
      nextFocus.focus()
    }
    else {
      const nextFocus = document.getElementById(`${elementBasename}0`)
      document.body.click()
      nextFocus.focus()
    }
	}
</script>

<svelte:window on:keydown={handleKeydown}/>

<div class="tab-content">
  <div id="charm-searcher">
    <!-- <h2>検索条件</h2> -->
    <div id="charm-search-form">
      <div id="skills">
        スキル:
        {#each [...Array(skillFilters.filter(i => i).length + 1).keys()] as i}
          <div>
            <AutoComplete items={allSkillDetails}
                          inputId="input-skill-{i}"
                          bind:selectedItem={skillFilters[i]}
                          labelFieldName="name"
                          valueFieldName="name"
                          keywordsFunction={s => `${s.name} ${s.hiragana} ${s.englishCharacters}`}
                          placeholder="スキル{i+1}"
                          showClear
                          hideArrow
                          className="autocomplete-skill"
                          />
            <AutoComplete items={SKILL_LEVEL_LIST}
                          inputId="input-skill-level-{i}"
                          bind:selectedItem={skillLevelFilters[i]}
                          placeholder="Lv"
                          hideArrow
                          className="autocomplete-skill-level"
                          />
          </div>
        {/each}
      </div>
      <div id="slots">
        スロット:<br>
        {#each [...Array(MAX_SLOTS).keys()] as i}
          <AutoComplete items={[...Array(3).keys()].map(i => i + 1)}
                        placeholder="スロット{i+1}"
                        inputId="input-slot-{i}"
                        bind:selectedItem={slots[i]}
                        showClear
                        hideArrow
                        className="autocomplete-slot-level"
                        />&nbsp;
        {/each}
      </div>
      <!-- <div> -->
      <!--   現在の検索条件: -->
      <!--   <ul> -->
      <!--     {#each skillFilters.map((e, idx) => `${e.name} Lv${skillLevelFilters[idx]}`) as skill} -->
      <!--       <li>{skill}</li> -->
      <!--     {/each} -->
      <!--     {#if slots.length > 0} -->
      <!--       <li>空きスロット {slots.join('-')}</li> -->
      <!--     {/if} -->
      <!--   </ul> -->
      <!-- </div> -->

      <!-- <input type="checkbox" checked disabled> 装飾品を使うパターンを含める -->
    </div>

    <hr>

    <div id="charm-search-result">
      {#if isSpinnerShown}
        <div class="spinner-border text-info" role="status"></div>
      {:else if searchResults == null}
        <!-- blank -->
      {:else if searchResults.length === 0}
        <div style="text-align: center">not found</div>
      {:else}
        show
        <select bind:value={itemsPerPage}>
          <option>10</option>
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>
        charms
        <CharmTable bind:charms={searchResultsToShow}
                    bind:sliceBegin
                    bind:sliceEnd
                    disableFilterHeader={true}
                    headerColor='dodgerblue'
                    />
        <div id="charm-search-result-pager">
          <ul class="pagination">
            <li class="page-item {currentPage === 0 ? 'disabled' : ''}" aria-label="Previous">
              <span class="page-link" on:click={() => currentPage--}>
                <span aria-hidden="true">&laquo;</span>
              </span>
            </li>
            {#each [...Array(nPages).keys()] as i}
              <li class="page-item {i === currentPage ? 'active' : ''}">
                <span class="page-link" on:click={() => currentPage = i}>{i + 1}</span>
              </li>
            {/each}
            <li class="page-item {currentPage === (nPages - 1) ? 'disabled' : ''}" aria-label="Next">
              <span class="page-link" on:click={() => currentPage++}>
                <span aria-hidden="true">&raquo;</span>
              </span>
            </li>
          </ul>
        </div>
      {/if}
    </div>
  </div>
</div>


<style>
  .tab-content {
    margin:     0;
    padding:    0;
    height:     100%;
    overflow:   auto; /* width 100% でスクロールさせる用 */
  }

  .tab-content > #charm-searcher {
    margin:     0;
    padding:    0;

    width:      100%;
  }

  .tab-content > #charm-searcher hr {
    color: #ccc;
  }

  .tab-content > #charm-searcher #charm-search-form,
  .tab-content > #charm-searcher #charm-search-result {
    width:      calc(100% - 2rem);
    margin:     1rem auto 1.4rem;
  }

  .tab-content > #charm-searcher #charm-search-form #skills,
  .tab-content > #charm-searcher #charm-search-form #slots {
    margin:     1rem 0;
  }

  #charm-search-result-pager ul.pagination {
    width:           67rem;

    justify-content: center;
    flex-wrap:       wrap;
  }

  :global(.tab-content > #charm-searcher .autocomplete-skill-level) {
    width:     6rem;
    min-width: 6rem; /* overwrite */
  }

  :global(.tab-content > #charm-searcher .autocomplete-slot-level) {
    width:     8rem;
    min-width: 8rem; /* overwrite */
  }
</style>
