<script lang="ts">
  import {navOptions} from './NavOptions.svelte'

  export let isNavigationOpen: boolean

  let currentNavOptionId = 2
  let onActivate = {}

  function switchComponent(e: Event) {
    const selectedComponentId = (e.target as HTMLElement).closest('button')?.id
    if (selectedComponentId == null) { return }

    currentNavOptionId = parseInt(selectedComponentId)

    if ( onActivate[currentNavOptionId] ) {
      onActivate[currentNavOptionId]()
    }
  }
</script>


<div id="container">
  <ul class="navigation" style="width: {isNavigationOpen ? '14rem' : '3.2rem'}">
    {#each navOptions as option, i}
      <li class="navigation-item">
        <button id={String(i)}
                class={currentNavOptionId == i ? "active navigation-link" : "navigation-link"}
                role="tab"
                on:click={switchComponent}
                >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="19" fill="currentColor">
            {#each (option.iconData || []) as iconData}
              <path d={iconData}/>
            {/each}
          </svg>
          <span style="display: {isNavigationOpen ? 'inline' : 'none'}">
            {@html option.tabTitle.replace('\n', '<br>')}
          </span>
        </button>
      </li>
    {/each}
    <div style="position: fixed; bottom: 0; left: 5px;">
      <a href="https://twitter.com/share?ref_src=twsrc%5Etfw"
         class="twitter-share-button"
         data-text=""
         data-url="https://mhrise-charm-scanner.yuzu-k.com"
         data-hashtags="MHRise,護石,ツール"
         data-show-count="false">
        Tweet
      </a>
      <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
    </div>
  </ul>

  <div class="navigation-content">
    {#each navOptions as option, i}
      <div class="h-100 {currentNavOptionId == i ? 'd-block' : 'd-none'}">
        <svelte:component this={option.component}
                          bind:onActivate={onActivate[i]}
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

    line-height: 1.1rem;

    display: flex;
    align-items: center;
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
