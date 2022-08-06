<script lang="ts">
import AutoComplete from 'simple-svelte-autocomplete'
import {MAX_RARITY} from 'assets/mhrise/metadata'

const RARITY_LIST = [...Array(MAX_RARITY + 1).keys()].slice(1) // 補完用リスト

export let inputId     = 'input-rarity'
export let placeholder = ''
export let showClear   = false
export let hideArrow   = true
export let className   = 'autocomplete-rarity'

export let value: number | null
</script>

<div>
  <AutoComplete items={RARITY_LIST}
                bind:selectedItem={value}
                {inputId}
                {placeholder}
                {showClear}
                {hideArrow}
                {className}
                />
</div>

<style>
  :global(.autocomplete-rarity) {
    width:     6rem;
    min-width: 6rem !important; /* overwrite */
  }
</style>

