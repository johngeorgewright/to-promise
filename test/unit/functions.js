const chai = require('chai')
const promisify = require('../../')

chai.use(require('chai-as-promised'))
chai.should()

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
