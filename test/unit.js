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
    fsPromised.readdir(path.join(__dirname, 'fixtures'))
    .should.eventually.eql(['1.txt', '2.txt', '3.txt'])
  ))
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

suite('error handling', () => {
  test('errors are rejected', () => (
    promisify(() => { throw new Error('I should not be caught') })()
    .should.eventually.be.rejectedWith('I should not be caught')
  ))

  test('can only promisify certain types', () => {
    (() => promisify(1000)).should.throw()
  })
})
