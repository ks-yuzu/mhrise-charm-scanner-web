// let Module = {}
importScripts('mhrise-charm-substitutes-search.js')

addEventListener('message', async e => {
  while ( typeof Module.getSubstitutesAll !== 'function' ) {
    await new Promise(r => setTimeout(r, 100))
  }

  const result = Module.getSubstitutesAll(e.data.charmsJson)
  self.postMessage({result})
})
