const chai = require('chai')
const promisify = require('../../')
const fsPromised = promisify('fs')
const fs = require('fs')
const path = require('path')

chai.use(require('chai-as-promised'))
chai.should()

suite('modules', () => {
  test('immutability', () => fs.should.not.equal(fsPromised))

  test('a promised function', () => (
    fsPromised.readdir(path.resolve(__dirname, '..', 'fixtures', 'promised-function'))
    .should.eventually.eql(['1.txt', '2.txt', '3.txt'])
  ))

  test('that local modules are relative to the parent', () => (
    promisify('../fixtures/modules/local').should.have.property('foo', 'bar')
  ))

  test('that modules that return strings throw an error', () => {
    const absPath = path.resolve(__dirname, '..', 'fixtures', 'modules', 'string')
    const fn = () => promisify('../fixtures/modules/string')
    fn.should.throw(
      `Can't promisify module "${absPath}" as it's an incorrect type`
    )
  })
})
