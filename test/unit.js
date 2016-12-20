/* eslint-env mocha */

const chai = require('chai')
const promisify = require('../')
const fsPromised = promisify('fs')
const fs = require('fs')
const path = require('path')

chai.use(require('chai-as-promised'))
chai.should()

suite('modules', () => {
  test('immutability', () => fs.should.not.equal(fsPromised))

  test('a promised function', () => (
    fsPromised.readdir(path.join(__dirname, 'fixtures', 'promised-function'))
    .should.eventually.eql(['1.txt', '2.txt', '3.txt'])
  ))

  test('that local modules are relative to the parent', () => (
    promisify('./fixtures/modules/local').should.have.property('foo', 'bar')
  ))

  test('that modules that return strings throw an error', () => {
    const absPath = path.resolve(__dirname, './fixtures/modules/string')
    const fn = () => promisify('./fixtures/modules/string')
    fn.should.throw(
      `Can't promisify module "${absPath}" as it's an incorrect type`
    )
  })
})

suite('functions', () => {
  test('basic functions', () => {
    const inc = (number, callback) => callback(null, number + 1)
    return promisify(inc)(2).should.eventually.equal(3)
  })

  test('bound functions', () => {
    const obj = {number: 1}
    const inc = function (callback) { callback(null, this.number + 1) }
    return promisify(inc, obj)().should.eventually.equal(2)
  })

  test('a callback with arguments.length >= 2', () => {
    const getName = (firstName, surname, callback) =>
      callback(null, firstName, surname)
    return promisify(getName)('Foo', 'Bar')
    .should.eventually.eql(['Foo', 'Bar'])
  })

  test('a function that errors', () => {
    const error = new Error('Foo')
    const foo = callback => callback(error)
    return promisify(foo)().should.eventually.be.rejectedWith(error)
  })
})

suite('objects', () => {
  let obj

  setup(() => {
    obj = promisify({
      fn1: cb => cb(null, 'foo'),
      fn2: cb => cb(null, 'bar')
    })
  })

  test('all functions are promisified', () => (
    Promise.all([
      obj.fn1().should.eventually.equal('foo'),
      obj.fn2().should.eventually.equal('bar')
    ])
  ))
})

suite('arrays', () => {
  let arr
  let res

  setup(() => {
    arr = [
      cb => cb(null, 'foo'),
      cb => cb(null, this)
    ]
    res = promisify(arr)
  })

  test('all functions are promisified', () => (
    Promise.all([
      res[0]().should.eventually.equal('foo'),
      res[1]().should.be.an.instanceOf(Promise)
    ])
  ))

  test('the context is not the array', () => (
    res[0]().should.eventually.not.equal(arr)
  ))
})

suite('error handling', () => {
  test('errors are rejected', () => (
    promisify(() => { throw new Error('I should not be caught') })()
    .should.eventually.be.rejectedWith('I should not be caught')
  ))

  test('can only promisify certain types', () => {
    (() => promisify(1000)).should.throw()
  })
})