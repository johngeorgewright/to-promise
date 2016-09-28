const functions = require('lodash.functionsin')
const pathHelper = require('path')

const isLocalModule = path => path.startsWith('.') || pathHelper.isAbsolute(path)

const promisifyFunction = (fn, context) =>
  (...args) => new Promise((resolve, reject) => {
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

const promisifyObject = obj => functions(obj).reduce(
  (acc, fnName) => {
    acc[fnName] = promisifyFunction(obj[fnName], obj)
    return acc
  },
  Object.assign({}, obj)
)

const promisifyModule = path => {
  if (isLocalModule(path)) {
    path = pathHelper.resolve(pathHelper.dirname(module.parent.filename), path)
  }
  const mod = require(path)
  if (typeof mod === 'string') {
    throw new Error(`Can't promisify module "${path}" as it's an incorrect type`)
  }
  return promisify(mod)
}

const promisify = (fnOrStringOrObject, context = null) => {
  const type = typeof fnOrStringOrObject
  switch (type) {
    case 'function': return promisifyFunction(fnOrStringOrObject, context)
    case 'object': return promisifyObject(fnOrStringOrObject)
    case 'string': return promisifyModule(fnOrStringOrObject)
    default: throw new Error(`Don't know how to promisify a "${type}"`)
  }
}

module.exports = promisify
