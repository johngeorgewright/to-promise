/* eslint-env mocha */

const chai = require('chai')
const promisify = require('../../')

chai.use(require('chai-as-promised'))
chai.should()

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
