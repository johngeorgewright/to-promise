const functions = require('lodash.functionsin')
const pathHelper = require('path')
const util = require('util')
const customPromisifyFunction = util.promisify && util.promisify.custom

const isLocalModule = path => path.startsWith('.') || pathHelper.isAbsolute(path)

class PromisifyBehaviour {
  promisifyFunction (fn, context) {
    if (customPromisifyFunction && Object.prototype.hasOwnProperty.call(fn, customPromisifyFunction)) {
      return fn[customPromisifyFunction]
    }
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

  promisifyObject (obj) {
    return functions(obj).reduce(
      (acc, fnName) => {
        acc[fnName] = this.promisifyFunction(obj[fnName], obj)
        return acc
      },
      Object.assign({}, obj)
    )
  }

  promisifyModule (path) {
    if (isLocalModule(path)) {
      path = pathHelper.resolve(pathHelper.dirname(module.parent.filename), path)
    }
    const mod = require(path)
    if (typeof mod === 'string') {
      throw new Error(`Can't promisify module "${path}" as it's an incorrect type`)
    }
    return this.promisify(mod)
  }

  promisifyArray (arr) {
    return arr.map(fn => this.promisifyFunction(fn, null))
  }

  promisify (subject, context = null) {
    if (Array.isArray(subject)) return this.promisifyArray(subject)
    const type = typeof subject
    switch (type) {
      case 'function': return this.promisifyFunction(subject, context)
      case 'object': return this.promisifyObject(subject)
      case 'string': return this.promisifyModule(subject)
      default: throw new Error(`Don't know how to promisify a "${type}"`)
    }
  }
}

const promisify = (
  subject,
  context = null,
  behaviour = {}
) => {
  behaviour = Object.assign(new PromisifyBehaviour(), behaviour)
  return behaviour.promisify(subject, context)
}

module.exports = promisify
