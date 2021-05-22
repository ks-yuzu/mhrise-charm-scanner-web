<script>
  import AutoComplete from 'simple-svelte-autocomplete'
  import {allSkillDetails} from './mhrise-skills.js'

  export let charmManager

  const MAX_SKILL_LEVEL   = 7
  const MAX_SLOTS = 3

  let skillFilters      = []
  let skillLevelFilters = []
  let slots             = []


  $: {
    for (const i in skillFilters) {
      if ( skillFilters[i] && skillLevelFilters[i] == null ) {
        skillLevelFilters[i] = 1
      }
      if ( skillFilters[i] == null ) {
        skillFilters.splice(i, 1)
        skillLevelFilters.splice(i, 1)
      }
    }
  }

  $: slots = slots.sort((a, b) => b - a)

  // async function exportCharms() {
  //   textareaValue = [
  //     ...(await charmManager.sql('select * from charms')).result.rows
  //   ] .map(row => {
  //       const {skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3} = row
  //       return [skill1, skill1Level, skill2, skill2Level, slot1, slot2, slot3].join(',')
  //     })
  //     .join('\n')
  // }
</script>


<div class="tab-content">
  <div id="charm-searcher">
    登録された護石から性能検索を行います。<br>
    スキルを装飾品で付けられる護石も検索対象になります。<br>
    <div id="charm-search-form">
      <div id="skills">
        スキル:
        {#each [...Array(skillFilters.filter(i => i).length + 1).keys()] as i}
          <div>
            <AutoComplete items={allSkillDetails}
                          bind:selectedItem={skillFilters[i]}
                          labelFieldName="name"
                          valueFieldName="name"
                          keywordsFunction={s => `${s.name} ${s.hiragana} ${s.englishCharacters}`}
                          placeholder="スキル{i+1}"
                          showClear
                          hideArrow
                          className="autocomplete-skill"
                          />
            <AutoComplete items={[...Array(MAX_SKILL_LEVEL + 1).keys()]}
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
                        bind:selectedItem={slots[i]}
                        showClear
                        hideArrow
                        className="autocomplete-slot-level"
                        />
        {/each}
      </div>
      <!-- <input type="checkbox" checked disabled> 装飾品を使うパターンを含める -->
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
    margin:     1rem auto;
    padding:    0;

    width:      95%;
  }

  .tab-content #charm-search-form #skills,
  .tab-content #charm-search-form #slots {
    margin:     1rem 0;
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
