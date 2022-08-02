<script lang="ts">
import AutoComplete from 'simple-svelte-autocomplete'

export let inputIdPrefix
export let page
export let row
export let col

const MAX_PAGE = 30
const PAGE_LIST = [...Array(MAX_PAGE + 1).keys()].slice(1) // 補完用リスト

const MAX_ROW = 5
const ROW_LIST = [...Array(MAX_ROW + 1).keys()].slice(1) // 補完用リスト

const MAX_COL = 8
const COL_LIST = [...Array(MAX_COL + 1).keys()].slice(1) // 補完用リスト
</script>

<div>
  <AutoComplete items={PAGE_LIST}
                bind:selectedItem={page}
                inputId="{inputIdPrefix}page"
                placeholder="ページ"
                showClear={false}
                hideArrow={true}
                className="autocomplete-charm-page"
                />

  <AutoComplete items={ROW_LIST}
                bind:selectedItem={row}
                inputId="{inputIdPrefix}row"
                placeholder="行"
                showClear={false}
                hideArrow={true}
                className="autocomplete-charm-row"
                />

  <AutoComplete items={COL_LIST}
                bind:selectedItem={col}
                inputId="{inputIdPrefix}col"
                placeholder="列"
                showClear={false}
                hideArrow={true}
                className="autocomplete-charm-col"
                />
</div>

<style>
  :global(.autocomplete-charm-page, .autocomplete-charm-row, .autocomplete-charm-col) {
    width:     6rem;
    min-width: 6rem !important; /* overwrite */
  }
</style>

