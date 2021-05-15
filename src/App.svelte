<script lang:ts>
  import MHRiseCharmManager from './mhrise-charm-manager.js'
  import MHRiseCharmScanner from './mhrise-charm-scanner.js'
  import Nav from './Nav.svelte'

  const TITLE   = 'MHRise Charm Scanner'
  const VERSION = '0.2.1'

  let fInitialized = false
  let charmScanner
  let charmManager

  // let updateCharmTable


  window.addEventListener('load', async () => {
    charmScanner = new MHRiseCharmScanner()
    charmManager = new MHRiseCharmManager()
    await charmScanner.init()
    fInitialized = true

    // updateCharmTable()
  })
</script>

<main>
	<h1>{TITLE}</h1>
  <div id="nav-wrapper">
    <Nav {...{fInitialized, charmScanner, charmManager}}></Nav>
  </div>
  <div id="version">v{VERSION}</div>
</main>


<style>
	main {
    width:  100%;
    height: 100%;

    margin: 0;

		text-align: center;
		padding:    1rem;
		max-width:  240px;
	}

	h1 {
		color: #ff3e00;
		font-size: 4em;
		font-weight: 100;

    height: 5rem;
	}

  #nav-wrapper {
    height: calc(100% - 5rem);
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
