<script lang="ts">
import AutoComplete from 'simple-svelte-autocomplete'
import {MAX_SKILL_LEVEL} from 'assets/mhrise/metadata'

const SKILL_LEVEL_LIST = [...Array(MAX_SKILL_LEVEL + 1).keys()].slice(1) // 補完用リスト

export let inputId     = 'input-skill-level-0'
export let placeholder = 'Lv'
export let showClear   = false
export let hideArrow   = true
export let className   = 'autocomplete-skill-level'

export let value = 0
</script>

<AutoComplete items={SKILL_LEVEL_LIST}
              bind:selectedItem={value}
              inputId={inputId}
              placeholder={placeholder}
              showClear={showClear}
              hideArrow={hideArrow}
              className={className}
              />

<style>
  :global(.autocomplete-skill-level) {
    width:     6rem;
    min-width: 6rem !important; /* overwrite */
  }
</style>

