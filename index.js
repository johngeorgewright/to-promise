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

const promisifyArray = arr =>
  arr.map(fn => promisifyFunction(fn, null))

const promisify = (subject, context = null) => {
  if (Array.isArray(subject)) return promisifyArray(subject)
  const type = typeof subject
  switch (type) {
    case 'function': return promisifyFunction(subject, context)
    case 'object': return promisifyObject(subject)
    case 'string': return promisifyModule(subject)
    default: throw new Error(`Don't know how to promisify a "${type}"`)
  }
}

module.exports = promisify
