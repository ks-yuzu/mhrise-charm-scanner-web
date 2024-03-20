<script lang="ts">
  import Nav                from './components/nav/Nav.svelte'
  import Hamburger          from './components/parts/Hamburger.svelte'
  import MHRiseCharmScanner from 'assets/mhrise/mhrise-charm-scanner'
  import MHRiseCharmManager from 'assets/mhrise/mhrise-charm-manager'
  import {charmManager}     from 'stores/stores.js'
  import {isAppReady}       from 'stores/flags'

  const TITLE   = 'MHRise Charm Scanner'
  const VERSION = '0.9.0'

  // let isDemoMode       = false
  let isNavigationOpen = true

  window.addEventListener('load', async () => {
    $charmManager = new MHRiseCharmManager()
    await MHRiseCharmScanner.init()

    $isAppReady = true
  })

/*
  function onChangeDemoMode() {
    if ( isDemoMode ) {
      $charmManager = new MHRiseCharmManager({isDemoMode: true})
      console.log(charmScanner.charmTableName)
    }
    else {
      $charmManager = new MHRiseCharmManager()
      console.log(charmScanner.charmTableName)
    }
  }
*/
</script>

<main>
  <header>
    <Hamburger bind:isOpen={isNavigationOpen}/>
	  <h1>{TITLE}</h1>

    <!-- <div style="position: absolute; right: 0; width: 7rem; margin-top: 0.8rem; display: flex;"> -->
    <!--   <span style="color: white">DEMO</span> -->
    <!--   <div class="material-switch"> -->
    <!--     <input id="switch-demo" type="checkbox" bind:checked={isDemoMode} on:change={onChangeDemoMode}> -->
    <!--     <label for="switch-demo"></label> -->
    <!--   </div> -->
    <!-- </div> -->
  </header>
  <div id="nav-wrapper">
    <Nav {isNavigationOpen} />
  </div>
  <div id="version">v{VERSION}</div>
</main>


<style>
/*
  .material-switch > input[type="checkbox"] {
      display: none;
  }

  .material-switch > label {
      cursor: pointer;
      height: 0px;
      position: relative;
      width: 40px;
      top: 12px;
      left: 10px;
  }

  .material-switch > label::before {
      background: rgb(10, 10, 100);
      box-shadow: inset 0px 0px 10px rgba(0, 0, 0, 0.5);
      border-radius: 8px;
      content: '';
      height: 16px;
      margin-top: -8px;
      position:absolute;
      opacity: 0.3;
      transition: all 0.4s ease-in-out;
      width: 40px;
  }
  .material-switch > label::after {
      background: rgb(255, 255, 255);
      border-radius: 16px;
      box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
      content: '';
      height: 24px;
      left: -4px;
      margin-top: -8px;
      position: absolute;
      top: -4px;
      transition: all 0.3s ease-in-out;
      width: 24px;
  }
  .material-switch > input[type="checkbox"]:checked + label::before {
      background: orange;
      opacity: 0.5;
  }
  .material-switch > input[type="checkbox"]:checked + label::after {
      background: orange;
      left: 20px;
  }
*/
	main {
    width:   100%;
    height:  100%;

    margin:  0;
    padding: 0;

		text-align: left;
	}

  header {
    display: flex;
    background: #222;

    height: 3rem;
  }

	header h1 {
    margin:  0;
    padding: 0;
		/* color: #ff3e00; */
    color: white;

		font-weight: 400;
		font-size: 1.5em;
    line-height: 3rem;
    height: 3rem;

    border: none;
	}

  #nav-wrapper {
    height: calc(100% - 3rem);
  }

  #version {
    position:      fixed;
    bottom:        0;
    right:         0;
    padding-right: 0.5rem;

    font-size: small;
  }

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>
