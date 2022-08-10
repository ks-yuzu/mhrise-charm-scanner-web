import * as fs from 'fs'

function convertObjectToInitializationList(data: any, indent = 0) {
  if (typeof data === 'number') {
    return ' '.repeat(indent) + data
  }
  else if (typeof data === 'string') {
    return ' '.repeat(indent) + `"${data}"`
  }
  else if(data instanceof Object) {
    if (data instanceof Array) {
      return ' '.repeat(indent) + '{\n' +
        data.map(i => convertObjectToInitializationList(i, indent + 2) + ',\n').join('') +
        ' '.repeat(indent) + '}'
    }
    else {
      return ' '.repeat(indent) + '{\n' +
        Object.entries(data).map(([key, value]) => (
          ' '.repeat(indent + 2) + '{\n' +
            convertObjectToInitializationList(key, indent + 4) + ',\n' +
            convertObjectToInitializationList(value, indent + 4) + ',\n' +
            ' '.repeat(indent + 2) + '},\n'
        )).join('') +
        ' '.repeat(indent) + '}'
    }
  }
  else if (data === true || data === false) {
    return ' '.repeat(indent) + (data ? 'true' : 'false')
  }
  else if (data === null || data === undefined) {
    return ' '.repeat(indent) + 'null'
  }
}

const input = JSON.parse(fs.readFileSync('/dev/stdin').toString())
console.log(convertObjectToInitializationList(input))
