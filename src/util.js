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


export function countImageDiffAtPoint(image, templateImage, point, maskBinaryThreshold, diffBinaryThreshold) {
  const size = new cv.Size(templateImage.cols, templateImage.rows)
  const rect = new cv.Rect(point, size)
  const trimmed = image.roi(rect)

  const templateMask = new cv.Mat()
  cv.threshold(templateImage, templateMask, maskBinaryThreshold, 255, cv.THRESH_BINARY)

  const masked = new cv.Mat()
  trimmed.copyTo(masked, templateMask)

  const diff = new cv.Mat()
  cv.absdiff(templateImage, masked, diff)
  cv.cvtColor(diff, diff, cv.COLOR_BGR2GRAY)

  const result = new cv.Mat()
  cv.threshold(diff, result, diffBinaryThreshold, 255, cv.THRESH_BINARY)
  // // cv::imwrite("./tmp/debug.png", diff); // for debug

  diff.delete()
  masked.delete()
  templateMask.delete()
  trimmed.delete()

  return result;
}


export function getMostMatchedImage(image, templates, point, maskBinaryThreshold = 63, diffBinaryThreshold = 63, debug = ()=>{}) {
  let minDiffCount = Number.MAX_SAFE_INTEGER
  let candidate = null

  // console.log(templates)
  for (const [name, template] of Object.entries(templates)) {
    const diff = countImageDiffAtPoint(image, template, point, maskBinaryThreshold, diffBinaryThreshold)
    debug(diff, name)
    const diffCount = cv.countNonZero(diff)

    if ( minDiffCount > diffCount ) {
      minDiffCount = diffCount;
      candidate = name;
    }

    diff.delete()
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

function resolveObject(object) {
  const promises = Object.keys(object).map(key => {
    return promiseAllRecursive(object[key]).then(value => ({ key, value }))
  });

  return Promise.all(promises).then(results => {
    return results.reduce((obj, pair) => {
      obj[pair.key] = pair.value
      return obj
    }, {})
  })
}
