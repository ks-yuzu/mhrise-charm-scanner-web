import cv from 'opencv-ts'


export function fetchImage(path) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = path

    img.onload = () => {
      // console.log(`fetched ${path}`)
      const imgmat = cv.imread(img)
	    resolve(imgmat)
    }
  })
}


let canvasCount = 0
export function dumpImage(img) {
  const canvasId = `canvas${canvasCount}`
  if (document.querySelector(`#${canvasId}`) == null) {
    const divDump = document.querySelector('#imgdump')
    const newCanvas = document.createElement('canvas')
    newCanvas.id = canvasId
    divDump.append(newCanvas)
  }
  cv.imshow(canvasId, img)
}

export function setNextCanvas() {
  canvasCount++
}

export function setFirstCanvas() {
  canvasCount = 0
}

export function dumpImageNewline(img) {
  if (document.querySelector('#imgdump')?.lastChild?.tagName?.toLowerCase() === 'p') {
    return
  }
  const divDump = document.querySelector('#imgdump')
  const newElm = document.createElement('p')
  divDump.append(newElm)
}


export function countImageDiffAtPoint(image, templateImage, trimRect, diffBinaryThreshold, debug) {
  const trimmed = image.roi(trimRect)

  const diff = new cv.Mat()
  cv.absdiff(templateImage, trimmed, diff)
  cv.cvtColor(diff, diff, cv.COLOR_BGR2GRAY)

  const result = new cv.Mat()
  cv.threshold(diff, result, diffBinaryThreshold, 255, cv.THRESH_BINARY)
  debug({trimmed, templateImage, /*templateMask, masked,*/ diff, result})

  const diffCount = cv.countNonZero(result)
  result.delete()
  diff.delete()
  trimmed.delete()

  // const buffer = image.roi(trimRect)
  // cv.absdiff(templateImage, buffer, buffer)
  // cv.cvtColor(buffer, buffer, cv.COLOR_BGR2GRAY)
  // cv.threshold(buffer, buffer, diffBinaryThreshold, 255, cv.THRESH_BINARY)
  // const diffCount = cv.countNonZero(buffer)
  // buffer.delete()

  return diffCount
}


export function getMostMatchedImage(image, templates, trimRect, diffBinaryThreshold = 63, debug = () => {}) {
  let minDiffCount = Number.MAX_SAFE_INTEGER
  let candidate = null

  for (const [name, template] of Object.entries(templates)) {
    const diffCount = countImageDiffAtPoint(image, template, trimRect, diffBinaryThreshold, debug)

    if ( diffCount === 0 ) {
      return name
    }
    else if ( minDiffCount > diffCount ) {
      minDiffCount = diffCount;
      candidate = name;
    }
  }

  return candidate;
}


export function promiseAllRecursive(value) {
  if (value instanceof Promise) {
    return value
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map(promiseAllRecursive))
  }

  if (typeof value === 'object') {
    return resolveObject(value)
  }

  return Promise.resolve(value)
}

function resolveObject(obj) {
  const promises = Object
    .keys(obj)
    .map(key => promiseAllRecursive(obj[key]).then(value => ({ key, value }))) // as Promise<{key: any, value: any}>[]

  return Promise.all(promises).then(results => {
    return results.reduce((obj, pair) => {
      obj[pair.key] = pair.value
      return obj
    }, {})
  })
}
