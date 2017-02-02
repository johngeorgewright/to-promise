const chai = require('chai')
const promisify = require('../../')

chai.use(require('chai-as-promised'))
chai.should()

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
