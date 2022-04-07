<script lang="ts">
import AutoComplete      from 'simple-svelte-autocomplete'
import {allSkillDetails} from 'mhrise-skills.js'

export let inputId     = 'input-skill'
export let placeholder = 'スキル'
export let showClear   = true
export let hideArrow   = true
export let className   = 'autocomplete-skill'

export let value // スキル名 (親コンポーネントと共有)
let _value       // 補完用メタデータを含めたオブジェクト (AutoComplete コンポーネントと共有)

// value と _value を互いに自動更新する
// ベタ書きすると cyclical dependency エラーになるので関数にして分析を回避
$: _updateValue(value)  // 初期値は親からの値を優先するので value → _value を先に書く
$: updateValue(_value)

function _updateValue(value) {
  _value = allSkillDetails.find(i => i.name === value)
}

function updateValue(_value) {
  value = _value?.name
}
</script>

<AutoComplete items={allSkillDetails}
              bind:selectedItem={_value}
              inputId={inputId}
              labelFieldName="name"
              valueFieldName="name"
              keywordsFunction={s => `${s.name} ${s.hiragana} ${s.englishCharacters}`}
              placeholder={placeholder}
              showClear={showClear}
              hideArrow={hideArrow}
              className={className}
              />

<style>
  :global(.autocomplete-skill) {
    min-width: 13rem !important; /* overwrite */
  }
</style>
