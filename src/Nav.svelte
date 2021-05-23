<script>
  import {navOptions} from './NavOptions.svelte'

  export let isNavigationOpen
  export let fInitialized
  export let charmScanner

  let currentNavOptionId = 4
  let currentNavOption = navOptions[currentNavOptionId]

  let onActivate = {}

  function switchComponent(e) {
    currentNavOptionId = e.srcElement.closest('button').id
    currentNavOption = navOptions[currentNavOptionId]

    if ( onActivate[currentNavOptionId] ) {
      onActivate[currentNavOptionId]()
    }
  }
</script>


<div id="container">
  <ul class="navigation" style="width: {isNavigationOpen ? '14rem' : '3.2rem'}">
    {#each navOptions as option, i}
      <li class="navigation-item">
        <button id={i}
                class={currentNavOptionId == i ? "active navigation-link" : "navigation-link"}
                role="tab"
                on:click={switchComponent}
                >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="19" fill="currentColor">
            {#each (option.iconData || []) as iconData}
              <path d={iconData}/>
            {/each}
          </svg>
          <span style="display: {isNavigationOpen ? 'inline' : 'none'}">{option.tabTitle}</span>
        </button>
      </li>
    {/each}
  </ul>

  <div class="navigation-content">
    {#each navOptions as option, i}
      <div class="h-100 {currentNavOptionId == i ? 'd-block' : 'd-none'}">
        <svelte:component this={navOptions[i].component}
                          {...{fInitialized, charmScanner}}
                          onActivate={onActivate[i]}
                          />
      </div>
    {/each}
  </div>
</div>


<style>
  #container {
    width:  100%;
    height: 100%;

    display: flex;
    flex-wrap: nowrap;
  }

  ul.navigation {
    /* width:   14rem; */
    height:  100%;
    margin:  0;
    padding: 0;

    list-style: none;

    /* border: 2px solid #1266f140; */
    border: none;
    border-right: solid 1px #8884;

    flex-grow:   0;
    flex-shrink: 0;

    transition: left 0.3s ease-in-out;
  }

  ul.navigation li.navigation-item {
    width:  100%;
    height: 3rem;
    margin: 0;
  }

  ul.navigation li.navigation-item > button {
    width: 100%;
    height: 100%;
    margin:  0;
    padding: 0 1rem;

    background: inherit;
    border:     none;

    text-align: left;

    line-height: 3rem;
  }

  /* ul.navigation li.navigation-item > button > svg { */
  /*   position: absolute; */

  /* /\*   margin:  0; *\/ */
  /* /\*   padding: 0 0 0 1rem; *\/ */
  /* } */

  ul.navigation li.navigation-item > button > span {
  /*   margin:  0; */
    padding: 0 0 0 0.8rem;
  }

  ul.navigation li.navigation-item > button.active {
    background: #1266f110;
  }

  ul.navigation li.navigation-item > button:hover {
    background: #8881;
  }

  div.navigation-content {
    width:    100%;
    height:   100%;
    overflow: hidden;
  }
</style>
