<script lang="ts">
import AutoComplete from 'simple-svelte-autocomplete'

const MAX_RARITY = 7
const RARITY_LIST = [...Array(MAX_RARITY).keys()].map(i => i + 1) // 補完用リスト

export let inputId     = 'input-rarity'
export let placeholder = ''
export let showClear   = false
export let hideArrow   = true
export let className   = 'autocomplete-rarity'

export let value = 0
</script>

<div>
  <AutoComplete items={RARITY_LIST}
                bind:selectedItem={value}
                inputId={inputId}
                placeholder={placeholder}
                showClear={showClear}
                hideArrow={hideArrow}
                className={className}
                />
</div>

<style>
  :global(.autocomplete-rarity) {
    width:     6rem;
    min-width: 6rem !important; /* overwrite */
  }
</style>

