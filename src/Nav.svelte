<script>
  import {navOptions} from './NavOptions.svelte'

  let currentNavOption = navOptions[0]
  let currentNavOptionId = 0

  function switchComponent(e) {
    currentNavOptionId = e.srcElement.id
    currentNavOption = navOptions[currentNavOptionId]
  }
</script>

<ul class="nav nav-tabs">
  {#each navOptions as option, i}
    <li class="nav-item">
      <button id={"tab${i}"}
              class={currentNavOptionId == i ? "active nav-link p-2 ml-1" : "nav-link p-2 ml-1"}
              on:click={switchComponent}
              role="tab"
              >
        {option.tabTitle}
      </button>
    </li>
  {/each}
</ul>

<div class="nav-content">
  <svelte:component this={currentNavOption.component} />
</div>
