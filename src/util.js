import cv from 'opencv-ts'

// TODO: 雑に詰め込みすぎなのでいい感じに整理して assets に

export function sleep(msec) {
  return new Promise(resolve => setTimeout(resolve, msec))
}


export async function fetchImage(path) {
  const img = new Image()
  img.src = path

  await new Promise(resolve => {img.onload = resolve})
  console.log(`fetched ${path}`)
  return cv.imread(img)
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

export function dumpImageNewline() {
  if (document.querySelector('#imgdump')?.lastChild?.tagName?.toLowerCase() === 'p') {
    return
  }
  const divDump = document.querySelector('#imgdump')
  const newElm = document.createElement('p')
  divDump.append(newElm)
}


export function countImageDiffAtPoint(image, templateImage, trimRect, diffBinaryThreshold, filter, debug) {
  // const trimmed = filter != null ? filter(image.roi(trimRect)) : image.roi(trimRect)
  const trimmed = image.roi(trimRect)
  if (filter != null) {
    filter(trimmed)
  }

  const diff = new cv.Mat()
  cv.absdiff(templateImage, trimmed, diff)
  cv.cvtColor(diff, diff, cv.COLOR_BGR2GRAY)

  const result = new cv.Mat()
  cv.threshold(diff, result, diffBinaryThreshold, 255, cv.THRESH_BINARY)

  const diffCount = cv.countNonZero(result)

  if (debug != null) {
    debug({trimmed, templateImage, diff, result})
  }

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


export function getMostMatchedImage(image, templates, trimRect, diffBinaryThreshold = 63, filter = null, debug = null) {
  let minDiffCount = Number.MAX_SAFE_INTEGER
  let candidate = null

  for (const [name, template] of Object.entries(templates)) {
    const diffCount = countImageDiffAtPoint(image, template, trimRect, diffBinaryThreshold, filter, debug)

    if ( diffCount === 0 ) {
      return {name, diffCount}
    }
    else if ( minDiffCount > diffCount ) {
      minDiffCount = diffCount;
      candidate = name;
    }
  }

  return {name: candidate, diffCount: minDiffCount}
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


// export function bgr2hsv(src) {
//   const hsv = new cv.Mat()
//   cv.cvtColor(src, hsv, cv.COLOR_BGR2HSV, 3)

//   return hsv
// }

// export function rgba2gray(src) {
//   const gray = new cv.Mat()
//   cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0)

//   return gray
// }

export function maskByColor(src, min, max) {
  const mask = new cv.Mat()
  const sMin = new cv.Mat(src.rows, src.cols, src.type(), min)
  const sMax = new cv.Mat(src.rows, src.cols, src.type(), max)
  cv.inRange(src, sMin, sMax, mask)

  const dst = new cv.Mat()
  src.copyTo(dst, mask)

  sMax.delete()
  sMin.delete()
  mask.delete()

  return dst
}
