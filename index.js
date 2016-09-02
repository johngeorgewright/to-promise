const functions = require('lodash.functionsin')

function promisifyFunction(fn, context) {
  return (...args) => new Promise((resolve, reject) => {
    fn.call(context, ...args, (err, ...result) => {
      if (err) {
        reject(err)
      } else if (result.length > 1) {
        resolve(result)
      } else {
        resolve(result[0])
      }
    })
  })
}

function promisifyObject(obj) {
  return Object.assign({}, obj, functions(obj).reduce((acc, fnName) => {
    acc[fnName] = promisifyFunction(obj[fnName], obj)
    return acc
  }, {}))
}

function promisify(fnOrStringOrObject, context = null) {
  const type = typeof fnOrStringOrObject
  switch (type) {
    case 'function': return promisifyFunction(fnOrStringOrObject, context)
    case 'object': return promisifyObject(fnOrStringOrObject)
    case 'string': return promisify(require(fnOrStringOrObject))
    default: throw new Error(`Don't know how to promisify a "${type}"`)
  }
}

module.exports = promisify
