<script>
  import {navOptions} from './NavOptions.svelte'

  export let fInitialized
  export let charmScanner
  export let charmManager

  let currentNavOptionId = 2
  let currentNavOption = navOptions[currentNavOptionId]

  let onActivate = {}

  function switchComponent(e) {
    currentNavOptionId = e.srcElement.id
    currentNavOption = navOptions[currentNavOptionId]

    if ( onActivate[currentNavOptionId] ) {
      onActivate[currentNavOptionId]()
    }
  }
</script>


<div id="container">
  <ul class="nav nav-tabs">
    {#each navOptions as option, i}
      <li class="nav-item">
        <button id={i}
                class={currentNavOptionId == i ? "active nav-link p-2 ml-1" : "nav-link p-2 ml-1"}
                role="tab"
                on:click={switchComponent}
                >
          {option.tabTitle}
        </button>
      </li>
    {/each}
  </ul>

  <div class="nav-content">
    {#each navOptions as option, i}
      <div class="h-100 {currentNavOptionId == i ? 'd-block' : 'd-none'}">
        <svelte:component this={navOptions[i].component}
                          {...{fInitialized, charmScanner, charmManager}}
                          bind:onActivate={onActivate[i]}/>
      </div>
    {/each}
  </div>
</div>


<style>
  #container {
    height: 100%;
  }

  ul.nav {
    height: 2rem;
    border-bottom: 2px solid #1266f140;
  }

  ul.nav li.nav-item {
    width: 8rem;
  }

  ul.nav li.nav-item > button {
    width: 100%;
    border-top:   1px solid #8882;
    border-left:  1px solid #8882;
    border-right: 1px solid #8882;
  }

  ul.nav li.nav-item > button.active {
    background: #1266f110;
  }

  div.nav-content {
    height: calc(100% - 2rem);
    overflow: hidden;
  }
</style>
