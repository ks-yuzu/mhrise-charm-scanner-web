<script lang="ts">
import AutoComplete from 'simple-svelte-autocomplete'

const MAX_NUM_SLOTS   = 3
const MAX_SLOT_LEVEL  = 3
const SLOT_LEVEL_LIST = [...Array(MAX_SLOT_LEVEL).keys()].map(i => i + 1) // 補完用リスト

export let inputId     = 'input-slot-'
export let placeholder = 'スロット'
export let showClear   = true
export let hideArrow   = true
export let className   = 'autocomplete-slot-level'

export let values = []

$: values = values.sort((a, b) => b - a)
</script>

<div>
  {#each [...Array(MAX_NUM_SLOTS).keys()] as i}
  <AutoComplete items={SLOT_LEVEL_LIST}
                bind:selectedItem={values[i]}
                inputId={inputId}{i}
                placeholder={placeholder}{i+1}
                showClear={showClear}
                hideArrow={hideArrow}
                className={className}
                />
  {/each}
</div>

<style>
  :global(.autocomplete-slot-level) {
    width:     8rem;
    min-width: 8rem !important; /* overwrite */
  }

  :global(.autocomplete-slot-level:nth-of-type(n+2)) {
    margin-left: 0.4rem;
  }
</style>
