/* eslint-env mocha */

const chai = require('chai')
const promisify = require('../../')

chai.use(require('chai-as-promised'))
chai.should()

suite('error handling', () => {
  test('errors are rejected', () => (
    promisify(() => { throw new Error('I should not be caught') })()
    .should.eventually.be.rejectedWith('I should not be caught')
  ))

  test('can only promisify certain types', () => {
    (() => promisify(1000)).should.throw()
  })
})
