<script lang:ts>
  import MHRiseCharmManager from './mhrise-charm-manager.js'
  import MHRiseCharmScanner from './mhrise-charm-scanner.js'
  import Hamburger from './Hamburger.svelte'
  import Nav from './Nav.svelte'
  import {charmManager} from './stores.js'

  const TITLE   = 'MHRise Charm Scanner'
  const VERSION = '0.5.0'

  let isNavigationOpen = false
  let fInitialized = false
  let charmScanner

  window.addEventListener('load', async () => {
    charmScanner = new MHRiseCharmScanner()
    $charmManager = new MHRiseCharmManager()
    await charmScanner.init()
    fInitialized = true
  })
</script>

<main>
  <header>
    <Hamburger bind:isOpen={isNavigationOpen}/>
	  <h1>{TITLE}</h1>
  </header>
  <div id="nav-wrapper">
    <Nav {...{isNavigationOpen, fInitialized, charmScanner}} />
  </div>
  <div id="version">v{VERSION}</div>
</main>


<style>
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
