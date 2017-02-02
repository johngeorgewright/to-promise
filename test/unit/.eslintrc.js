const conf = require('../../.eslintrc.js')

module.exports = Object.assign({}, conf, {
  env: Object.assign({}, conf.env, {
    mocha: true
  })
})
